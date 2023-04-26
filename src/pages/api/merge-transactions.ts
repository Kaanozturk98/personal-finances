import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { generateFingerprint } from "@component/utils";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { body } = req;
      const { subTransactionIds, categoryId, ...rest } = body;

      const parentTransaction = await prisma.transaction.create({
        data: {
          ...rest,
          fingerprint: generateFingerprint({ categoryId, ...rest }),
          category: {
            connect: {
              id: categoryId,
            },
          },
          subTransactions: {
            connect: subTransactionIds.map((id: string) => ({ id })),
          },
        },
      });

      res.status(200).json({
        message: "Parent transaction created successfully",
        parentTransaction,
      });
    } catch (error) {
      console.error("Error creating parent transaction", error);
      res.status(500).json({ message: "Error creating parent transaction" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
