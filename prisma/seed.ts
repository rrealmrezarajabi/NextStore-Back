import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import slugify from 'slugify';

const prisma = new PrismaClient();

const categoryNames = [
  'Electronics',
  'Clothing',
  'Shoes',
  'Home',
  'Beauty',
  'Books',
  'Sports',
  'Toys',
  'Groceries',
  'Automotive',
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

async function main() {
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@nextstore.dev';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin1234';

  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.create({
    data: {
      name: 'NextStore Admin',
      email: adminEmail,
      role: 'admin',
      avatar: 'https://i.pravatar.cc/300?img=68',
      passwordHash: adminPasswordHash,
    },
  });

  const userCreates = Array.from({ length: 20 }).map((_, i) => {
    const idx = i + 1;
    return prisma.user.create({
      data: {
        name: `Customer ${idx}`,
        email: `customer${idx}@nextstore.dev`,
        role: 'customer',
        avatar: `https://i.pravatar.cc/300?img=${(idx % 70) + 1}`,
        passwordHash: adminPasswordHash,
      },
    });
  });
  await Promise.all(userCreates);

  const categories = await Promise.all(
    categoryNames.map((name, i) =>
      prisma.category.create({
        data: {
          name,
          image: `https://picsum.photos/seed/category-${i + 1}/800/600`,
        },
      }),
    ),
  );

  const adjectives = [
    'Premium',
    'Modern',
    'Compact',
    'Smart',
    'Comfort',
    'Classic',
    'Eco',
    'Pro',
    'Advanced',
    'Lite',
  ];
  const nouns = [
    'Headphones',
    'Jacket',
    'Sneakers',
    'Lamp',
    'Serum',
    'Novel',
    'Bike',
    'Puzzle',
    'Coffee',
    'Toolkit',
  ];

  for (let i = 1; i <= 100; i += 1) {
    const title = `${randomFrom(adjectives)} ${randomFrom(nouns)} ${i}`;
    const category = randomFrom(categories);

    const product = await prisma.product.create({
      data: {
        title,
        slug: slugify(title, { lower: true, strict: true }),
        price: randomInt(10, 2000),
        description: `Generated seed description for ${title}.`,
        categoryId: category.id,
      },
    });

    const imagesCount = randomInt(1, 3);

    await prisma.productImage.createMany({
      data: Array.from({ length: imagesCount }).map((_, idx) => ({
        productId: product.id,
        url: `https://picsum.photos/seed/product-${product.id}-${idx + 1}/1200/900`,
      })),
    });
  }

  console.log('Seed completed.');
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
