// pages/api/upload-midas.js
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import XLSX from "xlsx";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const excelBuffer = Buffer.from(req.body, "base64");
      const workbook = XLSX.read(excelBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[3];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
      });

      for (let i = 2; i < rows.length; i++) {
        const [nameWithShortName, stringifiedQuantity, , , totalHoldingValue] =
          rows[i] as unknown as string[];

        const quantity = parseFloat(stringifiedQuantity);
        const valuationInUSD = parseFloat(totalHoldingValue) / quantity;

        const [shortName, name] = nameWithShortName.split(" - ");
        const assetType = await prisma.assetType.upsert({
          where: { shortName },
          update: { valuationInUSD },
          create: { name, shortName, valuationInUSD, assetCategory: "STOCK" },
        });

        await prisma.assetHolding.create({
          data: {
            quantity,
            assetTypeId: assetType.id,
            holdingForm: "INVESTMENT_ACCOUNT",
            platform: "MIDAS",
          },
        });
      }

      res
        .status(200)
        .json({ message: "Midas holding objects created successfully" });
    } catch (error) {
      console.error("Error creating Midas holding objects", error);
      res.status(500).json({ message: "Error creating Midas holding objects" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
