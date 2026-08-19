"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface BukuPelaut {
  id: string;
  pelaut: {
    nama: string;
    kodePelaut: string;
  };
  keteranganOrder: string;
  status: string;
  updatedAt: string;
}

export default function BukuPelautPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<BukuPelaut[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formData, setFormData] = useState({
    pelautId: "",
    namaPelaut: "",
    kodePelaut: "",
    keteranganOrder: "Sijil On",
    status: "Proses",
  });

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
    fetchData();
  }, [status]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/buku-pelaut");
      if (res.ok) {
        const data = await res.json();
        setData(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingData ? `/api/buku-pelaut/${editingData.id}` : "/api/buku-pelaut";
      const method = editingData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingData(null);
        setFormData({
          pelautId: "",
          namaPelaut: "",
          kodePelaut: "",
          keteranganOrder: "Sijil On",
          status: "Proses",
        });
        fetchData();
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus data ini?")) {
      try {
        const res = await fetch(`/api/buku-pelaut/${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchData();
        }
      } catch (error) {
        console.error("Error deleting data:", error);
      }
    }
  };

  const handleEdit = (item: BukuPelaut) => {
    setEditingData(item);
    setFormData({
      pelautId: item.pelaut?.kodePelaut || "",
      namaPelaut: item.pelaut?.nama || "",
      kodePelaut: item.pelaut?.kodePelaut || "",
      keteranganOrder: item.keteranganOrder,
      status: item.status,
    });
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Issued: "bg-green-900/30 text-green-400 border border-green-700/50",
      Proses: "bg-yellow-900/30 text-yellow-400 border border-yellow-700/50",
      Dijalankan: "bg-blue-900/30 text-blue-400 border border-blue-700/50",
    };
    return colors[status] || "bg-gray-800 text-gray-400 border border-gray-700";
  };

  const getOrderColor = (order: string) => {
    const colors: Record<string, string> = {
      "Sijil On": "bg-purple-900/30 text-purple-400 border border-purple-700/50",
      "Sijil Off": "bg-orange-900/30 text-orange-400 border border-orange-700/50",
      "Sijil On Off": "bg-indigo-900/30 text-indigo-400 border border-indigo-700/50",
      Perpanjang: "bg-teal-900/30 text-teal-400 border border-teal-700/50",
      Pergantian: "bg-pink-900/30 text-pink-400 border border-pink-700/50",
    };
    return colors[order] || "bg-gray-800 text-gray-400 border border-gray-700";
  };

  const filteredData = data.filter((item) => {
    const matchSearch = 
      item.pelaut?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pelaut?.kodePelaut?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter ? item.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

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
              <h2 className="text-lg font-semibold text-white hidden sm:block">Buku Pelaut</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 hidden sm:block">
                {session?.user?.email}
              </span>
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
            <h2 className="text-2xl font-bold text-[#D4AF37]">Daftar Buku Pelaut</h2>
            <p className="text-sm text-gray-400">Kelola dokumen Buku Pelaut</p>
          </div>
          {(userRole === "admin" || userRole === "super_admin") && (
            <button
              onClick={() => {
                setEditingData(null);
                setFormData({
                  pelautId: "",
                  namaPelaut: "",
                  kodePelaut: "",
                  keteranganOrder: "Sijil On",
                  status: "Proses",
                });
                setShowModal(true);
              }}
              className="px-4 py-2 bg-[#D4AF37] text-[#0a0a0a] font-semibold text-sm rounded-lg hover:bg-[#C9A84C] transition-colors flex items-center gap-2"
            >
              <span>+</span> Tambah Buku Pelaut
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Cari nama atau kode pelaut..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-[#D4AF37]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-white placeholder-gray-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-[#1a1a1a] border border-[#D4AF37]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-white"
          >
            <option value="">Semua Status</option>
            <option value="Proses">Proses</option>
            <option value="Dijalankan">Dijalankan</option>
            <option value="Issued">Issued</option>
          </select>
        </div>

        <div className="bg-[#1a1a1a] border border-[#D4AF37]/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0a0a] border-b border-[#D4AF37]/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#D4AF37] uppercase tracking-wider">Nama Pelaut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#D4AF37] uppercase tracking-wider">Kode Pelaut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#D4AF37] uppercase tracking-wider">Keterangan Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#D4AF37] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#D4AF37] uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/10">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="text-4xl mb-2">📭</div>
                      <p>Belum ada data Buku Pelaut</p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-[#0a0a0a] transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{item.pelaut?.nama || "-"}</td>
                      <td className="px-6 py-4 text-gray-400">{item.pelaut?.kodePelaut || "-"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderColor(item.keteranganOrder)}`}>
                          {item.keteranganOrder}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {(userRole === "admin" || userRole === "super_admin") && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-[#D4AF37] hover:text-[#C9A84C] transition-colors"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Hapus"
                            >
                              🗑️
                            </button>
                          </div>
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
          Menampilkan {filteredData.length} dari {data.length} data
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-[#D4AF37]/30 rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-[#D4AF37] mb-4">
              {editingData ? "Edit Buku Pelaut" : "Tambah Buku Pelaut"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#D4AF37] mb-1">Nama Pelaut</label>
                  <input
                    type="text"
                    value={formData.namaPelaut}
                    onChange={(e) => setFormData({ ...formData, namaPelaut: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#D4AF37]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#D4AF37] mb-1">Kode Pelaut</label>
                  <input
                    type="text"
                    value={formData.kodePelaut}
                    onChange={(e) => setFormData({ ...formData, kodePelaut: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#D4AF37]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#D4AF37] mb-1">Keterangan Order</label>
                  <select
                    value={formData.keteranganOrder}
                    onChange={(e) => setFormData({ ...formData, keteranganOrder: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#D4AF37]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-white"
                  >
                    <option value="Sijil On">Sijil On</option>
                    <option value="Sijil Off">Sijil Off</option>
                    <option value="Sijil On Off">Sijil On Off</option>
                    <option value="Perpanjang">Perpanjang</option>
                    <option value="Pergantian">Pergantian</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#D4AF37] mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#D4AF37]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-white"
                  >
                    <option value="Proses">Proses</option>
                    <option value="Dijalankan">Dijalankan</option>
                    <option value="Issued">Issued</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#D4AF37] text-[#0a0a0a] font-semibold rounded-lg hover:bg-[#C9A84C] transition-colors"
                >
                  {editingData ? "Update" : "Simpan"}
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
    </div>
  );
}