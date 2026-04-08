import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@barbearia.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "123456";

  const adminHash = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: "Administrador",
        email: adminEmail,
        passwordHash: adminHash,
        phone: "11999999999",
        role: "ADMIN",
      },
    });
  }

  const barberEmail = "barbeiro@jakcompany.com";
  const barberHash = await bcrypt.hash("123456", 10);

  const existingBarber = await prisma.user.findUnique({
    where: { email: barberEmail },
  });

  if (!existingBarber) {
    await prisma.user.create({
      data: {
        name: "Barbeiro Exemplo",
        email: barberEmail,
        passwordHash: barberHash,
        phone: "11988888888",
        role: "BARBER",
      },
    });
  }

  const customerEmail = "cliente@jakcompany.com";
  const customerHash = await bcrypt.hash("123456", 10);

  const existingCustomer = await prisma.user.findUnique({
    where: { email: customerEmail },
  });

  if (!existingCustomer) {
    await prisma.user.create({
      data: {
        name: "Cliente Exemplo",
        email: customerEmail,
        passwordHash: customerHash,
        phone: "11977777777",
        role: "CUSTOMER",
      },
    });
  }

  const services = [
    {
      name: "Corte masculino",
      description: "Corte com acabamento profissional",
      duration: 45,
      price: 35,
    },
    {
      name: "Barba",
      description: "Alinhamento e acabamento da barba",
      duration: 30,
      price: 25,
    },
    {
      name: "Corte + barba",
      description: "Combo completo",
      duration: 60,
      price: 55,
    },
    {
      name: "Sobrancelha",
      description: "Acabamento de sobrancelha",
      duration: 15,
      price: 15,
    },
  ];

  for (const service of services) {
    const exists = await prisma.service.findFirst({
      where: { name: service.name },
    });

    if (!exists) {
      await prisma.service.create({ data: service });
    }
  }

  const products = [
    {
      name: "Pomada modeladora",
      description: "Fixacao forte e acabamento seco",
      price: 29.9,
      stock: 20,
      imageUrl: "/produtos/pomada.jpg",
    },
    {
      name: "Oleo para barba",
      description: "Hidratacao e brilho para barba",
      price: 34.9,
      stock: 15,
      imageUrl: "/produtos/oleo-barba.jpg",
    },
    {
      name: "Shampoo masculino",
      description: "Limpeza diaria para cabelo e barba",
      price: 24.9,
      stock: 25,
      imageUrl: "/produtos/shampoo.jpg",
    },
  ];

  for (const product of products) {
    const exists = await prisma.product.findFirst({
      where: { name: product.name },
    });

    if (!exists) {
      await prisma.product.create({ data: product });
    }
  }

  console.log("Seed executado com sucesso.");
  console.log("Admin:", adminEmail, "/ senha:", adminPassword);
  console.log("Barbeiro exemplo: barbeiro@jakcompany.com / senha: 123456");
  console.log("Cliente exemplo: cliente@jakcompany.com / senha: 123456");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
