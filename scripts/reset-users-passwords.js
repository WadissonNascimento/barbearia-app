const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("123456", 10);
  const barberPassword = await bcrypt.hash("123456", 10);
  const customerPassword = await bcrypt.hash("123456", 10);

  await prisma.user.updateMany({
    where: { role: "ADMIN" },
    data: { password: adminPassword, active: true },
  });

  await prisma.user.updateMany({
    where: { role: "BARBER" },
    data: { password: barberPassword, active: true },
  });

  await prisma.user.updateMany({
    where: { role: "CUSTOMER" },
    data: { password: customerPassword, active: true },
  });

  console.log("Senhas redefinidas com sucesso.");
  console.log("ADMIN -> 123456");
  console.log("BARBER -> 123456");
  console.log("CUSTOMER -> 123456");
}

main()
  .catch((e) => {
    console.error("Erro ao redefinir senhas:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });