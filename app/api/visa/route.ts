import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Ambil semua data VISA
export async function GET() {
  try {
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

// POST - Tambah data VISA baru (BYPASS AUTH)
export async function POST(request: NextRequest) {
  try {
    // BYPASS AUTH - SEMENTARA UNTUK TESTING
    // const session = await getServerSession(authOptions);
    // if (!session || (session.user?.role !== "admin" && session.user?.role !== "super_admin")) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const body = await request.json();
    const { namaPelaut, kodePelaut, kodePasspor, negaraTujuan, status } = body;

    console.log("📝 Creating VISA:", { namaPelaut, kodePelaut, kodePasspor, negaraTujuan, status });

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

    // Buat VISA baru (bisa multiple VISA untuk 1 pelaut)
    const newData = await prisma.vISA.create({
      data: {
        pelautId: pelaut.id,
        kodePasspor: kodePasspor,
        negaraTujuan: negaraTujuan,
        status: status,
        updatedBy: "dummy-id", // Bypass: pakai dummy user
      },
      include: {
        pelaut: true,
      },
    });

    console.log("✅ VISA berhasil dibuat:", newData);
    return NextResponse.json(newData, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating VISA:", error);
    return NextResponse.json(
      { error: "Internal server error: " + (error as Error).message },
      { status: 500 }
    );
  }
}