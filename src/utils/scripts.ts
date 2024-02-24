import { PrismaClient, Transaction } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

export async function updateTransactions() {
  await prisma.transaction.updateMany({
    data: {
      bank: "ENPARA",
    },
  });
}

export async function generateTransactionFiles() {
  // Fetching transactions from the database
  const transactions = await prisma.transaction.findMany({
    select: {
      description: true,
      amount: true,
      installments: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  let fileData: Array<{
    description: string;
    amount: number;
    installmentCount: number;
    categoryName: string;
  }> = [];
  let fileIndex = 1;
  let fileSize = 0;

  for (const t of transactions) {
    const transactionObject = {
      description: t.description,
      amount: t.amount,
      installmentCount: t.installments,
      categoryName: t.category ? t.category.name : "",
    };

    fileData.push(transactionObject);
    const estimatedSize = Buffer.byteLength(JSON.stringify(fileData), "utf-8");

    if (estimatedSize > 512 * 1024 * 1024) {
      // 512 MB limit
      // Write the current fileData to a file
      fs.writeFileSync(
        `transactions_${fileIndex}.json`,
        JSON.stringify(fileData, null, 2)
      );
      console.log(`File transactions_${fileIndex}.json written successfully`);

      // Reset for next file
      fileData = [transactionObject];
      fileSize = Buffer.byteLength(JSON.stringify(fileData), "utf-8");
      fileIndex++;
    } else {
      fileSize = estimatedSize;
    }
  }

  // Write remaining content to the last file
  if (fileData.length > 0) {
    fs.writeFileSync(
      `transactions_${fileIndex}.json`,
      JSON.stringify(fileData, null, 2)
    );
    console.log(`File transactions_${fileIndex}.json written successfully`);
  }
}
