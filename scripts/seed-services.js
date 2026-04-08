const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const services = [
    { name: "Corte", price: 35, duration: 45 },
    { name: "Barba", price: 25, duration: 30 },
    { name: "Corte + Barba", price: 55, duration: 60 },
    { name: "Sobrancelha", price: 15, duration: 15 },
  ];

  for (const service of services) {
    const exists = await prisma.service.findFirst({
      where: { name: service.name },
    });

    if (!exists) {
      await prisma.service.create({
        data: {
          ...service,
          active: true,
        },
      });
    }
  }

  console.log("Serviços cadastrados com sucesso.");
}

main()
  .catch((e) => {
    console.error("Erro ao cadastrar serviços:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });