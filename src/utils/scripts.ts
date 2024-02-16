import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function updateTransactions() {
  await prisma.transaction.updateMany({
    data: {
      bank: "ENPARA",
    },
  });
}
