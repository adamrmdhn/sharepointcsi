import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// PUT - Update E-SID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== "admin" && session.user?.role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { namaPelaut, kodePelaut, lokasiPembuatan, status } = body;

    const existingESID = await prisma.e_SID.findUnique({
      where: { id },
      include: { pelaut: true },
    });

    if (!existingESID) {
      return NextResponse.json(
        { error: "E-SID tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.pelaut.update({
      where: { id: existingESID.pelautId },
      data: {
        nama: namaPelaut,
        kodePelaut: kodePelaut,
      },
    });

    const updatedESID = await prisma.e_SID.update({
      where: { id },
      data: {
        lokasiPembuatan: lokasiPembuatan,
        status: status,
        updatedBy: session.user.id,
      },
      include: {
        pelaut: true,
      },
    });

    return NextResponse.json(updatedESID);
  } catch (error) {
    console.error("Error updating E-SID:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Hapus E-SID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== "admin" && session.user?.role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingESID = await prisma.e_SID.findUnique({
      where: { id },
    });

    if (!existingESID) {
      return NextResponse.json(
        { error: "E-SID tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.e_SID.delete({
      where: { id },
    });

    return NextResponse.json({ message: "E-SID berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting E-SID:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}