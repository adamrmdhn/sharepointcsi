import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET - Ambil semua data VISA
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await prisma.vISA.findMany({
      include: {
        pelaut: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching VISA:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Tambah data VISA baru
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== "admin" && session.user?.role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { namaPelaut, kodePelaut, kodePasspor, negaraTujuan, status } = body;

    // Cari atau buat pelaut
    let pelaut = await prisma.pelaut.findUnique({
      where: { kodePelaut: kodePelaut },
    });

    if (!pelaut) {
      pelaut = await prisma.pelaut.create({
        data: {
          nama: namaPelaut,
          kodePelaut: kodePelaut,
        },
      });
    }

    // Buat VISA baru (bisa multiple VISA untuk 1 pelaut)
    const newData = await prisma.vISA.create({
      data: {
        pelautId: pelaut.id,
        kodePasspor: kodePasspor,
        negaraTujuan: negaraTujuan,
        status: status,
        updatedBy: session.user.id,
      },
      include: {
        pelaut: true,
      },
    });

    return NextResponse.json(newData, { status: 201 });
  } catch (error) {
    console.error("Error creating VISA:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}