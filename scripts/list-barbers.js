const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const barbers = await prisma.user.findMany({
    where: {
      role: "BARBER",
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  console.log(barbers);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });