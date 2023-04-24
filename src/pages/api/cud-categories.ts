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
      await prisma.category.create({ data: body });

      res.status(200).json({ message: "Category created successfully" });
    } catch (error) {
      console.error("Error creating category", error);
      res.status(500).json({ message: "Error creating category" });
    }
  } else if (req.method === "PUT") {
    try {
      const { body } = req;
      const { id, ...updatedData } = body;

      if (!id) {
        res.status(400).json({ message: "Category ID is required" });
        return;
      }

      await prisma.category.update({
        where: { id },
        data: updatedData,
      });

      res.status(200).json({ message: "Category updated successfully" });
    } catch (error) {
      console.error("Error updating category", error);
      res.status(500).json({ message: "Error updating category" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
