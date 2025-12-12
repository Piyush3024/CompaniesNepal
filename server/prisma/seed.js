import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from "bcrypt";

try {
  async function seed() {
    const roles = [
      {
        role_id: 1,
        name: "buyer",
      },
      {
        role_id: 2,
        name: "seller",
      },
      {
        role_id: 3,
        name: "admin",
      },
    ];

    for (const role of roles) {
      await prisma.role.upsert({
        where: {
          role_id: role.role_id,
        },
        update: {},
        create: role,
      });
    }

    const statuses = [
      {
        status_id: 1,
        name: "approved",
      },
      {
        status_id: 2,
        name: "verified",
      },
      {
        status_id: 3,
        name: "rejected",
      },
    ];

    for (const status of statuses) {
      await prisma.status.upsert({
        where: {
          status_id: status.status_id,
        },
        update: {},
        create: status,
      });
    }
    const password1 = await bcrypt.hash("adminPass123", 12);
    const password2 = await bcrypt.hash("buyerPass456", 12);
    const password3 = await bcrypt.hash("sellerPass789", 12);
    const password4 = await bcrypt.hash("buyerTwoPass", 12);
    const password5 = await bcrypt.hash("sellerTwoPass", 12);

    const users = [
      {
        id: 1,
        username: "AdminShiva",
        email: "admin1@example.com",
        password: password1,
        role_id: 3,
        status_id: 1,
        email_verified: true,
      },
      {
        id: 2,
        username: "BuyerSita",
        email: "buyer1@example.com",
        password: password2,
        role_id: 1,
        status_id: 2,
        email_verified: true,
      },
      {
        id: 3,
        username: "SellerRam",
        email: "seller1@example.com",
        password: password3,
        role_id: 2,
        status_id: 1,
        email_verified: true,
      },
      {
        id: 4,
        username: "BuyerGita",
        email: "buyer2@example.com",
        password: password4,
        role_id: 1,
        status_id: 1,
        email_verified: true,
      },
      {
        id: 5,
        username: "SellerHari",
        email: "seller2@example.com",
        password: password5,
        role_id: 2,
        status_id: 2,
        email_verified: true,
      },
    ];

    const password = await bcrypt.hash("hello", 12);
    for (const user of users) {
      await prisma.user.upsert({
        where: {
          email: user.email,
        },
        update: {},
        create: {
          ...user,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    }
    console.log("✅ Seeding complete with different users!");
  }
  seed();
} catch (error) {
  console.log(error);
  process.exit(1);
} finally {
  async () => {
    await prisma.$disconnect();
  };
}
