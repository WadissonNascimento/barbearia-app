const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      name: 'Pomada Modeladora',
      description: 'Fixação média com acabamento natural.',
      price: 39.9,
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1621607512022-6aecc4fed814?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Óleo para Barba',
      description: 'Hidratação e maciez para barba e pele.',
      price: 29.9,
      stock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1517837016564-bfc28f6b3b0a?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Shampoo Masculino',
      description: 'Limpeza refrescante para uso diário.',
      price: 24.9,
      stock: 18,
      imageUrl: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80'
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.name.toLowerCase().replace(/\s+/g, '-') },
      update: product,
      create: { id: product.name.toLowerCase().replace(/\s+/g, '-'), ...product }
    }).catch(async () => {
      const found = await prisma.product.findFirst({ where: { name: product.name } });
      if (!found) await prisma.product.create({ data: product });
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
