"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface User {
  id: string;
  email: string;
  role: string;
  namaPerusahaan: string;
  isActive: boolean;
  createdAt: string;
}

export default function KelolaAkunPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user",
    namaPerusahaan: "",
  });
  const [profileData, setProfileData] = useState({
    username: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });

  const userRole = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
    if (userRole !== "super_admin") {
      redirect("/dashboard");
    }
    fetchUsers();
    if (session?.user?.email) {
      setProfileData(prev => ({
        ...prev,
        username: session.user.email || "",
      }));
    }
  }, [status, userRole, session]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          email: "",
          password: "",
          role: "user",
          namaPerusahaan: "",
        });
        fetchUsers();
        alert("✅ Akun berhasil dibuat!");
      } else {
        const error = await res.json();
        alert(error.error || "Gagal membuat akun");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Terjadi kesalahan");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Terjadi kesalahan");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus akun ini?")) {
      try {
        const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchUsers();
          alert("✅ Akun berhasil dihapus!");
        } else {
          alert("Gagal menghapus akun");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Terjadi kesalahan");
      }
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage({ type: "", text: "" });

    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      setProfileMessage({ type: "error", text: "Password baru tidak cocok!" });
      return;
    }

    if (profileData.newPassword && profileData.newPassword.length < 6) {
      setProfileMessage({ type: "error", text: "Password minimal 6 karakter!" });
      return;
    }

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: profileData.username,
          newPassword: profileData.newPassword || undefined,
        }),
      });

      if (res.ok) {
        setProfileMessage({ type: "success", text: "✅ Profil berhasil diupdate! Silakan login ulang." });
        setProfileData(prev => ({
          ...prev,
          newPassword: "",
          confirmPassword: "",
        }));
        setTimeout(() => {
          window.location.href = "/api/auth/signout";
        }, 2000);
      } else {
        const error = await res.json();
        setProfileMessage({ type: "error", text: error.error || "Gagal update profil" });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setProfileMessage({ type: "error", text: "Terjadi kesalahan" });
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <nav className="bg-[#1a1a1a] border-b border-[#D4AF37]/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-gray-400 hover:text-[#D4AF37]">
                ←
              </Link>
              <h1 className="text-lg font-bold text-[#D4AF37] tracking-wide hidden sm:block">
                APTA CPITA SEVANAM
              </h1>
              <span className="text-gray-500 hidden sm:block">|</span>
              <h2 className="text-lg font-semibold text-white hidden sm:block">Kelola Akun</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 hidden sm:block">
                {session?.user?.email}
              </span>
              <button
                onClick={() => setShowProfileModal(true)}
                className="text-sm text-[#D4AF37] hover:text-[#C9A84C] transition-colors"
              >
                ⚙️ Profil
              </button>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#D4AF37]">Daftar Akun</h2>
            <p className="text-sm text-gray-400">Kelola user dan admin yang memiliki akses</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowProfileModal(true)}
              className="px-4 py-2 bg-[#1a1a1a] border border-[#D4AF37]/30 text-[#D4AF37] text-sm rounded-lg hover:bg-[#2a2a2a] transition-colors flex items-center gap-2"
            >
              ⚙️ Ubah Profil
            </button>
            <button
              onClick={() => {
                setShowModal(true);
                setFormData({
                  email: "",
                  password: "",
                  role: "user",
                  namaPerusahaan: "",
                });
              }}
              className="px-4 py-2 bg-[#D4AF37] text-[#0a0a0a] font-semibold text-sm rounded-lg hover:bg-[#C9A84C] transition-colors flex items-center gap-2"
            >
              <span>+</span> Tambah Akun
            </button>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#D4AF37]/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0a0a] border-b border-[#D4AF37]/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#D4AF37] uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#D4AF37] uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#D4AF37] uppercase tracking-wider">Perusahaan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#D4AF37] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#D4AF37] uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/10">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="text-4xl mb-2">👤</div>
                      <p>Belum ada akun</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-[#0a0a0a] transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          user.role === "super_admin" ? "border-red-500 text-red-400" :
                          user.role === "admin" ? "border-[#D4AF37] text-[#D4AF37]" :
                          "border-gray-500 text-gray-400"
                        }`}>
                          {user.role === "super_admin" ? "Super Admin" : 
                           user.role === "admin" ? "Admin" : "User"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{user.namaPerusahaan || "-"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          user.isActive ? "border-green-500 text-green-400" : "border-red-500 text-red-400"
                        }`}>
                          {user.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.role !== "super_admin" ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleToggleActive(user.id, user.isActive)}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                user.isActive
                                  ? "bg-yellow-900/30 text-yellow-400 border border-yellow-700/50 hover:bg-yellow-900/50"
                                  : "bg-green-900/30 text-green-400 border border-green-700/50 hover:bg-green-900/50"
                              }`}
                            >
                              {user.isActive ? "Nonaktifkan" : "Aktifkan"}
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="px-3 py-1 bg-red-900/30 text-red-400 border border-red-700/50 rounded text-xs font-medium hover:bg-red-900/50 transition-colors"
                            >
                              Hapus
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">Tidak bisa diubah</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Total {users.length} akun terdaftar
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-[#D4AF37]/30 rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-[#D4AF37] mb-4">Tambah Akun</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#D4AF37] mb-1">Username</label>
                  <input
                    type="text"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#D4AF37]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#D4AF37] mb-1">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#D4AF37]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#D4AF37] mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#D4AF37]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-white"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#D4AF37] mb-1">Nama Perusahaan</label>
                  <input
                    type="text"
                    value={formData.namaPerusahaan}
                    onChange={(e) => setFormData({ ...formData, namaPerusahaan: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#D4AF37]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#D4AF37] text-[#0a0a0a] font-semibold rounded-lg hover:bg-[#C9A84C] transition-colors"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-[#0a0a0a] border border-[#D4AF37]/20 text-gray-400 rounded-lg hover:bg-[#2a2a2a] transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-[#D4AF37]/30 rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-[#D4AF37] mb-4">⚙️ Ubah Profil</h3>
            <p className="text-sm text-gray-400 mb-4">Ubah username dan password untuk akun Super Admin</p>
            
            {profileMessage.text && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                profileMessage.type === "success" 
                  ? "bg-green-900/30 border border-green-700/50 text-green-400" 
                  : "bg-red-900/30 border border-red-700/50 text-red-400"
              }`}>
                {profileMessage.text}
              </div>
            )}

            <form onSubmit={handleProfileUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#D4AF37] mb-1">Username Baru</label>
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#D4AF37]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#D4AF37] mb-1">Password Baru (opsional)</label>
                  <input
                    type="password"
                    value={profileData.newPassword}
                    onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#D4AF37]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-white"
                    placeholder="Kosongkan jika tidak ingin diubah"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#D4AF37] mb-1">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#D4AF37]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-white"
                    placeholder="Ulangi password baru"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#D4AF37] text-[#0a0a0a] font-semibold rounded-lg hover:bg-[#C9A84C] transition-colors"
                >
                  Simpan Perubahan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(false);
                    setProfileMessage({ type: "", text: "" });
                    setProfileData(prev => ({
                      ...prev,
                      newPassword: "",
                      confirmPassword: "",
                    }));
                  }}
                  className="flex-1 px-4 py-2 bg-[#0a0a0a] border border-[#D4AF37]/20 text-gray-400 rounded-lg hover:bg-[#2a2a2a] transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}