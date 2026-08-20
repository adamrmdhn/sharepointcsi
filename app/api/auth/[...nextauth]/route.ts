import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<any> {
        try {
          console.log("🔍 [AUTH] Login attempt START for:", credentials?.email);
          
          if (!credentials?.email || !credentials?.password) {
            console.log("❌ [AUTH] No credentials provided");
            return null;
          }

          console.log("🔍 [AUTH] Trying to find user:", credentials.email);
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          console.log("📦 [AUTH] User found:", user ? "YES" : "NO");
          console.log("📧 [AUTH] User email:", user?.email);
          console.log("🔑 [AUTH] User role:", user?.role);
          console.log("✅ [AUTH] User active:", user?.isActive);
          
          if (!user) {
            console.log("❌ [AUTH] User not found in database");
            return null;
          }

          if (!user.isActive) {
            console.log("❌ [AUTH] User is inactive");
            return null;
          }

          console.log("🔐 [AUTH] Comparing passwords...");
          console.log("📝 [AUTH] Input password length:", credentials.password.length);
          console.log("📝 [AUTH] Stored hash length:", user.password.length);
          
          const passwordMatch = await bcrypt.compare(credentials.password, user.password);
          console.log("✅ [AUTH] Password match:", passwordMatch);

          if (!passwordMatch) {
            console.log("❌ [AUTH] Password does NOT match");
            return null;
          }

          console.log("✅ [AUTH] Login SUCCESS for:", user.email);
          
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            namaPerusahaan: user.namaPerusahaan,
          };
        } catch (error) {
          console.error("🔥 [AUTH] ERROR in authorize:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.namaPerusahaan = user.namaPerusahaan;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.namaPerusahaan = token.namaPerusahaan;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };