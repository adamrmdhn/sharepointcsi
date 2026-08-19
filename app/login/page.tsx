"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Username atau password salah");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="bg-[#1a1a1a] border border-[#D4AF37]/30 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#D4AF37] tracking-wide">
            APTA CPITA SEVANAM
          </h1>
          <p className="text-[#D4AF37]/70 text-sm mt-2 tracking-wider">
            Empowering Seafarers Through Seamless Documentation
          </p>
          <div className="w-20 h-0.5 bg-[#D4AF37] mx-auto mt-4"></div>
          <p className="text-gray-400 text-sm mt-4">Sistem Monitoring Dokumen Pelaut</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#D4AF37] mb-1">
              Username
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition text-white placeholder-gray-500"
              placeholder="Masukkan username"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#D4AF37] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition text-white placeholder-gray-500"
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D4AF37] text-[#0a0a0a] font-semibold py-2 rounded-lg hover:bg-[#C9A84C] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} APTA CPITA SEVANAM
        </div>
      </div>
    </div>
  );
}