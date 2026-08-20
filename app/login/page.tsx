"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Langsung redirect ke dashboard
    router.push("/dashboard");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-[#D4AF37]">Redirecting...</div>
    </div>
  );
}