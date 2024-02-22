import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body } = req;

  if (method === "POST") {
    try {
      const createdAssetHolding = await prisma.assetHolding.create({
        data: body,
      });
      res
        .status(200)
        .json({
          message: "Asset Holding created successfully",
          createdAssetHolding,
        });
    } catch (error) {
      console.error("Error creating asset holding", error);
      res.status(500).json({ message: "Error creating asset holding" });
    }
  } else if (method === "PUT") {
    try {
      const { id, ...updatedData } = body;
      if (!id) {
        res.status(400).json({ message: "Asset Holding ID is required" });
        return;
      }
      const updatedAssetHolding = await prisma.assetHolding.update({
        where: { id },
        data: updatedData,
      });
      res
        .status(200)
        .json({
          message: "Asset Holding updated successfully",
          updatedAssetHolding,
        });
    } catch (error) {
      console.error("Error updating asset holding", error);
      res.status(500).json({ message: "Error updating asset holding" });
    }
  } else if (method === "DELETE") {
    try {
      const { id: deleteId } = req.query;
      if (!deleteId || Array.isArray(deleteId)) {
        res
          .status(400)
          .json({ message: "Asset Holding ID is required for deletion" });
        return;
      }
      await prisma.assetHolding.delete({
        where: { id: parseInt(deleteId) },
      });
      res.status(200).json({ message: "Asset Holding deleted successfully" });
    } catch (error) {
      console.error("Error deleting asset holding", error);
      res.status(500).json({ message: "Error deleting asset holding" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
