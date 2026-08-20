import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Ambil semua data Buku Pelaut
export async function GET() {
  try {
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

// POST - Tambah data Buku Pelaut baru (BYPASS AUTH)
export async function POST(request: NextRequest) {
  try {
    // BYPASS AUTH - SEMENTARA UNTUK TESTING
    // const session = await getServerSession(authOptions);
    // if (!session || (session.user?.role !== "admin" && session.user?.role !== "super_admin")) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const body = await request.json();
    const { namaPelaut, kodePelaut, keteranganOrder, status } = body;

    console.log("📝 Creating Buku Pelaut:", { namaPelaut, kodePelaut, keteranganOrder, status });

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
      console.log("✅ Pelaut baru dibuat:", pelaut);
    }

    // Cek apakah pelaut sudah punya Buku Pelaut
    const existing = await prisma.bukuPelaut.findUnique({
      where: { pelautId: pelaut.id },
    });

    if (existing) {
      console.log("⚠️ Pelaut sudah memiliki Buku Pelaut");
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
        updatedBy: "dummy-id", // Bypass: pakai dummy user
      },
      include: {
        pelaut: true,
      },
    });

    console.log("✅ Buku Pelaut berhasil dibuat:", newData);
    return NextResponse.json(newData, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating Buku Pelaut:", error);
    return NextResponse.json(
      { error: "Internal server error: " + (error as Error).message },
      { status: 500 }
    );
  }
}