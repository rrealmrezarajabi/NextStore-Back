import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@nextstore.dev";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin1234";

  // avoid clobbering an existing 'admin' username belonging to someone else
  let username = "admin";
  const usernameOwner = await prisma.user.findUnique({ where: { username } });
  if (usernameOwner && usernameOwner.email !== adminEmail) {
    username = `admin_${Date.now()}`;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      firstName: "NextStore",
      lastName: "Admin",
      role: "admin",
      avatar: "https://i.pravatar.cc/300?img=68",
      passwordHash,
    },
    create: {
      firstName: "NextStore",
      lastName: "Admin",
      username,
      email: adminEmail,
      role: "admin",
      avatar: "https://i.pravatar.cc/300?img=68",
      passwordHash,
    },
  });

  console.log(`Admin ensured: ${user.email} (id: ${user.id})`);
  console.log(`Login with: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
