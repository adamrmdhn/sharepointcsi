import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET - Ambil semua data E-SID
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await prisma.e_SID.findMany({
      include: {
        pelaut: true,
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching E-SID:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Tambah data E-SID baru
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== "admin" && session.user?.role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { namaPelaut, kodePelaut, lokasiPembuatan, status } = body;

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

    // Cek apakah pelaut sudah punya E-SID
    const existingESID = await prisma.e_SID.findUnique({
      where: { pelautId: pelaut.id },
    });

    if (existingESID) {
      return NextResponse.json(
        { error: "Pelaut ini sudah memiliki E-SID" },
        { status: 400 }
      );
    }

    // Buat E-SID baru
    const newESID = await prisma.e_SID.create({
      data: {
        pelautId: pelaut.id,
        lokasiPembuatan: lokasiPembuatan,
        status: status,
        updatedBy: session.user.id,
      },
      include: {
        pelaut: true,
      },
    });

    return NextResponse.json(newESID, { status: 201 });
  } catch (error) {
    console.error("Error creating E-SID:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}