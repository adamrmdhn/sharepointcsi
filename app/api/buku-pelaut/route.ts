import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET - Ambil semua data Buku Pelaut
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await prisma.bukuPelaut.findMany({
      include: {
        pelaut: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching Buku Pelaut:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Tambah data Buku Pelaut baru
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== "admin" && session.user?.role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { namaPelaut, kodePelaut, keteranganOrder, status } = body;

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

    // Cek apakah pelaut sudah punya Buku Pelaut
    const existing = await prisma.bukuPelaut.findUnique({
      where: { pelautId: pelaut.id },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Pelaut ini sudah memiliki Buku Pelaut" },
        { status: 400 }
      );
    }

    // Buat Buku Pelaut baru
    const newData = await prisma.bukuPelaut.create({
      data: {
        pelautId: pelaut.id,
        keteranganOrder: keteranganOrder,
        status: status,
        updatedBy: session.user.id,
      },
      include: {
        pelaut: true,
      },
    });

    return NextResponse.json(newData, { status: 201 });
  } catch (error) {
    console.error("Error creating Buku Pelaut:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}