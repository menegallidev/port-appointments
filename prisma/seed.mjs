import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não encontrado.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedServices() {
  const services = [
    {
      name: "Corte Tradicional",
      description: "Corte clássico com acabamento completo.",
      durationMinutes: 45,
      price: "45.00",
    },
    {
      name: "Barba Completa",
      description: "Modelagem e acabamento da barba.",
      durationMinutes: 35,
      price: "35.00",
    },
    {
      name: "Corte + Barba",
      description: "Pacote completo de corte e barba.",
      durationMinutes: 70,
      price: "75.00",
    },
    {
      name: "Pigmentação",
      description: "Pigmentação com finalização.",
      durationMinutes: 50,
      price: "55.00",
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: {
        description: service.description,
        durationMinutes: service.durationMinutes,
        price: service.price,
        isActive: true,
      },
      create: service,
    });
  }
}

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@barbearia.local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Administrador",
      role: UserRole.ADMIN,
      passwordHash,
    },
    create: {
      name: "Administrador",
      email: adminEmail,
      role: UserRole.ADMIN,
      passwordHash,
    },
  });

  return { adminEmail, adminPassword };
}

async function main() {
  await seedServices();
  const admin = await seedAdmin();

  console.log("Seed finalizado.");
  console.log(`Admin email: ${admin.adminEmail}`);
  console.log(`Admin senha: ${admin.adminPassword}`);
}

main()
  .catch((error) => {
    console.error("Erro no seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
