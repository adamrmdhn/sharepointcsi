import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createUser() {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    const user = await prisma.user.create({
      data: {
        email: "admin@example.com",
        password: hashedPassword,
        role: "super_admin",
        namaPerusahaan: "Admin Utama",
        isActive: true,
      },
    });
    
    console.log("✅ User created successfully!");
    console.log("📧 Email:", user.email);
    console.log("🔑 Password: admin123");
    console.log("👤 Role:", user.role);
  } catch (error: any) {
    if (error.code === "P2002") {
      console.log("⚠️ User already exists with email: admin@example.com");
      console.log("📧 Email: admin@example.com");
      console.log("🔑 Password: admin123");
    } else {
      console.error("❌ Error:", error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createUser();