import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";


// PUT - Update username dan password Super Admin
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "super_admin") {
      return NextResponse.json({ error: "Hanya Super Admin yang bisa mengubah profil" }, { status: 403 });
    }

    const body = await request.json();
    const { username, newPassword } = body;

    const userId = session.user.id;

    // Cek apakah username sudah digunakan oleh user lain
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: username,
          id: { not: userId },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Username sudah digunakan oleh akun lain" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (username) {
      updateData.email = username;
    }

    if (newPassword && newPassword.length >= 6) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data yang diubah" },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({
      message: "Profil berhasil diupdate",
      user: {
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}