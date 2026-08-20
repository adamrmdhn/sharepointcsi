import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT - Update Buku Pelaut (BYPASS AUTH)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // BYPASS AUTH
    const { id } = await params;
    const body = await request.json();
    const { namaPelaut, kodePelaut, keteranganOrder, status } = body;

    const existing = await prisma.bukuPelaut.findUnique({
      where: { id },
      include: { pelaut: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.pelaut.update({
      where: { id: existing.pelautId },
      data: {
        nama: namaPelaut,
        kodePelaut: kodePelaut,
      },
    });

    const updated = await prisma.bukuPelaut.update({
      where: { id },
      data: {
        keteranganOrder: keteranganOrder,
        status: status,
        updatedBy: "dummy-id",
      },
      include: {
        pelaut: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating Buku Pelaut:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Hapus Buku Pelaut (BYPASS AUTH)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.bukuPelaut.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.bukuPelaut.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Data berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting Buku Pelaut:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}