// pages/api/upload-yapi-kredi-holdings.js
import { NextApiRequest, NextApiResponse } from "next";
import { AssetCategory, HoldingPlatform, PrismaClient } from "@prisma/client";
import XLSX from "xlsx";
import { mergeRows } from "@component/utils/upload-yapi-kredi-holdings";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const excelBuffer = Buffer.from(req.body, "base64");
      const workbook = XLSX.read(excelBuffer, { type: "buffer" });

      // FON PORTFÖYÜ TABLE
      const sheetName1 = workbook.SheetNames[6];
      const worksheet1 = workbook.Sheets[sheetName1];
      const rows1 = mergeRows(
        XLSX.utils.sheet_to_json(worksheet1, {
          header: 1,
          defval: "",
        }) as string[][]
      );

      // DİĞER KURUM FONLARI TABLE
      const sheetName2 = workbook.SheetNames[7];
      const worksheet2 = workbook.Sheets[sheetName2];
      const rows2 = mergeRows(
        XLSX.utils.sheet_to_json(worksheet2, {
          header: 1,
          defval: "",
        }) as string[][]
      );

      const processRows = async (
        rows: string[][],
        assetCategory: AssetCategory,
        platform: HoldingPlatform
      ) => {
        const headers = rows[1]; // Assuming second row is always headers
        const hasItfaTarihi = headers.includes("İtfa Tarihi");

        for (let i = 2; i < rows.length; i++) {
          let shortName, name, stringifiedQuantity, stringifiedValuationInTRY;

          if (hasItfaTarihi) {
            // If 'İtfa Tarihi' is present, adjust the destructuring accordingly
            [
              ,
              ,
              shortName,
              name, // Skip 'İtfa Tarihi'
              ,
              ,
              ,
              stringifiedQuantity,
              stringifiedValuationInTRY,
            ] = rows[i];
          } else {
            // If 'İtfa Tarihi' is not present
            [
              ,
              ,
              shortName,
              name, // Skip other fields not needed for assetType
              ,
              ,
              stringifiedQuantity,
              stringifiedValuationInTRY,
            ] = rows[i];
          }

          const quantity = parseFloat(stringifiedQuantity);
          const valuationInTRY = parseFloat(stringifiedValuationInTRY);

          const assetType = await prisma.assetType.upsert({
            where: { shortName },
            update: { valuationInTRY },
            create: { name, shortName, valuationInTRY, assetCategory },
          });

          await prisma.assetHolding.create({
            data: {
              quantity,
              assetTypeId: assetType.id,
              holdingForm: "INVESTMENT_ACCOUNT",
              platform,
            },
          });
        }
      };

      // Process 'FON PORTFÖYÜ' table
      await processRows(rows1, "STOCK", "YAPI_KREDI");

      // Process 'DİĞER KURUM FONLARI' table
      await processRows(rows2, "STOCK", "YAPI_KREDI");

      res
        .status(200)
        .json({ message: "Yapı Kredi holding objects created successfully" });
    } catch (error) {
      console.error("Error creating Yapı Kredi holding objects", error);
      res
        .status(500)
        .json({ message: "Error creating Yapı Kredi holding objects" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
