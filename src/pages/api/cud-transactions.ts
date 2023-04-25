import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { body } = req;
      await prisma.transaction.create({ data: body });

      res.status(200).json({ message: "Transaction created successfully" });
    } catch (error) {
      console.error("Error creating transaction", error);
      res.status(500).json({ message: "Error creating transaction" });
    }
  } else if (req.method === "PUT") {
    try {
      const { body } = req;
      const { id, ...updatedData } = body;

      if (!id) {
        res.status(400).json({ message: "Transaction ID is required" });
        return;
      }

      await prisma.transaction.update({
        where: { id },
        data: updatedData,
      });

      res.status(200).json({ message: "Transaction updated successfully" });
    } catch (error) {
      console.error("Error updating transaction", error);
      res.status(500).json({ message: "Error updating transaction" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
