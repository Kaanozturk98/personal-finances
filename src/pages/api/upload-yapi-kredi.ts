// pages/api/upload-excel.js
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import XLSX from "xlsx";
import { generateFingerprint } from "@component/utils";
import { processExcelFile } from "@component/utils/upload-yapi-kredi";
import { TransactionCreate } from "@component/types";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      // Convert base64 string to buffer
      const excelBuffer = Buffer.from(req.body, "base64");

      // Parse the Excel file from buffer using xlsx library
      const workbook = XLSX.read(excelBuffer, { type: "buffer" });

      // Assuming you want to read the first sheet of the workbook
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert sheet to JSON
      const rows = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
      });

      /* console.log("rows", rows);

      throw new Error("Test error"); */

      const transactions: TransactionCreate[] = processExcelFile(
        rows as unknown as string[][]
      );

      /* console.log("transactions", transactions);

        throw new Error("Test error"); */

      // Insert the transactions into the database in batches
      const batchSize = 100;
      for (let i = 0; i < transactions.length; i += batchSize) {
        const batch = transactions.slice(i, i + batchSize);
        const fingerprints = batch.map(generateFingerprint);
        const data = batch.map((t, i) => ({
          ...t,
          fingerprint: fingerprints[i],
        }));
        await prisma.transaction.createMany({ data });
      }

      res.status(200).json({ message: "Transactions created successfully" });
    } catch (error) {
      console.error("Error creating transactions", error);
      res.status(500).json({ message: "Error creating transactions" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
