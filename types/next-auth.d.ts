import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    namaPerusahaan?: string;
  }

  interface Session {
    user: {
      id?: string;
      role?: string;
      namaPerusahaan?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}