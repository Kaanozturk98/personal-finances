import { NextApiRequest, NextApiResponse } from "next";
import { AssetType, PrismaClient } from "@prisma/client";
import { formatPayload } from "@component/app/asset-types/utils";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body } = req;

  if (method === "POST") {
    try {
      const createdAssetType = await prisma.assetType.create({ data: body });
      res
        .status(200)
        .json({ message: "Asset Type created successfully", createdAssetType });
    } catch (error) {
      console.error("Error creating asset type", error);
      res.status(500).json({ message: "Error creating asset type" });
    }
  } else if (method === "PUT") {
    try {
      const { id, ...updatedData } = body;
      if (!id) {
        res.status(400).json({ message: "Asset Type ID is required" });
        return;
      }

      const formattedPayload = formatPayload(updatedData as Partial<AssetType>);

      const updatedAssetType = await prisma.assetType.update({
        where: { id },
        data: formattedPayload,
      });
      res
        .status(200)
        .json({ message: "Asset Type updated successfully", updatedAssetType });
    } catch (error) {
      console.error("Error updating asset type", error);
      res.status(500).json({ message: "Error updating asset type" });
    }
  } else if (method === "DELETE") {
    try {
      const { id: deleteId } = req.query;
      if (!deleteId || Array.isArray(deleteId)) {
        res
          .status(400)
          .json({ message: "Asset Type ID is required for deletion" });
        return;
      }
      await prisma.assetType.delete({
        where: { id: parseInt(deleteId) },
      });
      res.status(200).json({ message: "Asset Type deleted successfully" });
    } catch (error) {
      console.error("Error deleting asset type", error);
      res.status(500).json({ message: "Error deleting asset type" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
