import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Transaction } from "@prisma/client";
import { getCategoryPredictions } from "@component/utils";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PUT") {
    try {
      const { body } = req;
      const { transactions } = body;

      const filteredTransactions = transactions.filter(
        (transaction: Transaction) => !transaction.categoryId
      );

      if (filteredTransactions.length === 0) {
        res.status(200).json({
          message: "All selected transactions are already categorized",
        });
      }

      const categories = await prisma.category.findMany();
      const batchSize = 25;
      let totalTokens = 0;
      const allAssignments = [];

      for (let i = 0; i < filteredTransactions.length; i += batchSize) {
        const batch = filteredTransactions.slice(i, i + batchSize);
        const { assignments, usage } = await getCategoryPredictions(
          batch,
          categories
        );

        totalTokens += usage.total_tokens;
        allAssignments.push(...assignments);

        for await (const pair of assignments) {
          await prisma.transaction.update({
            where: { id: parseInt(pair.transactionId) },
            data: { categoryId: parseInt(pair.categoryId) },
          });
        }
      }

      await prisma.chatGptUsage.create({
        data: {
          count: allAssignments.length,
          total_tokens: totalTokens,
        },
      });

      const estimatedCostPerTotalToken = 0.03 * 0.8 + 0.06 * 0.2;

      res.status(200).json({
        message: `Transactions categorized successfully. Cost: $${
          (totalTokens * estimatedCostPerTotalToken) / 1000
        }`,
        assignments: allAssignments,
      });
    } catch (error) {
      console.log(error);
      console.error("Error categorizing transactions", error);
      res.status(500).json({ message: "Error categorizing transactions" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
