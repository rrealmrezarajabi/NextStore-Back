import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@nextstore.dev";

  const admins = await prisma.user.findMany({
    where: {
      OR: [{ role: "admin" }, { username: "admin" }, { email: adminEmail }],
    },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  if (admins.length === 0) {
    console.log("No admin user found.");
  } else {
    console.log("Admin users:");
    console.log(JSON.stringify(admins, null, 2));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
