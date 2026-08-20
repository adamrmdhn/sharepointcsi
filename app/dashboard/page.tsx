"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const menuItems = [
    {
      title: "E-SID",
      description: "Kelola dan monitoring dokumen E-SID pelaut",
      href: "/e-sid",
    },
    {
      title: "Buku Pelaut",
      description: "Kelola dan monitoring Buku Pelaut",
      href: "/buku-pelaut",
    },
    {
      title: "VISA",
      description: "Kelola dan monitoring dokumen VISA",
      href: "/visa",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <nav className="bg-[#1a1a1a] border-b border-[#D4AF37]/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-[#D4AF37] tracking-wide hidden sm:block">
                APTA CPITA SEVANAM
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400 hidden sm:block">
                {session.user?.email}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                userRole === "super_admin" ? "border-red-500 text-red-400" :
                userRole === "admin" ? "border-[#D4AF37] text-[#D4AF37]" :
                "border-gray-500 text-gray-400"
              }`}>
                {userRole === "super_admin" ? "Super Admin" : 
                 userRole === "admin" ? "Admin" : "User"}
              </div>
              <a
                href="/api/auth/signout"
                className="text-sm text-gray-400 hover:text-red-400 transition-colors"
              >
                Logout
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border border-[#D4AF37]/20 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="Logo"
              width={50}
              height={50}
              className="object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-[#D4AF37] mb-2">
                Selamat Datang, {session.user?.email}
              </h1>
              <p className="text-gray-400">
                Anda login sebagai <span className="text-[#D4AF37] font-semibold">
                  {userRole === "super_admin" ? "Super Admin" : 
                   userRole === "admin" ? "Admin" : "User"}
                </span>
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-[#D4AF37] mb-4">Menu Utama</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group bg-[#1a1a1a] border border-[#D4AF37]/20 rounded-xl hover:border-[#D4AF37]/50 transition-all duration-200 p-6 hover:shadow-lg hover:shadow-[#D4AF37]/5"
            >
              <h3 className="text-lg font-semibold text-white group-hover:text-[#D4AF37] transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-gray-400 mt-1">{item.description}</p>
              <div className="mt-4 text-sm text-[#D4AF37] group-hover:translate-x-1 transition-transform inline-block">
                Lihat →
              </div>
            </Link>
          ))}
        </div>

        {userRole === "super_admin" && (
          <div className="mt-8 bg-[#1a1a1a] border border-[#D4AF37]/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#D4AF37]">Administrasi</h3>
                <p className="text-sm text-gray-400 mt-1">Kelola akun user dan admin</p>
              </div>
              <Link
                href="/kelola-akun"
                className="px-4 py-2 bg-[#D4AF37] text-[#0a0a0a] font-semibold text-sm rounded-lg hover:bg-[#C9A84C] transition-colors"
              >
                Kelola Akun
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}