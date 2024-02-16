import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import pdfParse from "pdf-parse";
import { TransactionCreate } from "@component/types";
import {
  transformPdfText,
  extractTransactions,
  cleanPdfText,
} from "@component/utils/upload-enpara";
import { generateFingerprint } from "@component/utils";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      // Parse the PDF file
      const pdfBuffer = Buffer.from(req.body, "base64");
      const pdfData = await pdfParse(pdfBuffer);

      // A workaround for the encoding problems with the old pdf files
      // Replace problematic characters with the correct ones
      const cleanedText = cleanPdfText(pdfData.text);

      /* console.log("cleanedText", cleanedText);

      res.status(200).json({ cleanedText });
      return; */

      // Transform the parsed PDF data into rows
      const { rows, cardType, pdfdate } = transformPdfText(cleanedText);

      /* console.log("rows", rows);

      res.status(200).json({ rows, cardType });
      return; */

      // Extract transactions from the transformed PDF data
      const transactions: TransactionCreate[] = extractTransactions(
        rows,
        cardType,
        pdfdate
      );

      /* console.log("transactions", transactions); */

      /* res.status(200).json({ transactions });
      return; */

      // Bug fix block
      /* for await (const transaction of transactions) {
        try {
          const fingerprint = generateFingerprint(transaction);
          await prisma.transaction.create({
            data: { ...transaction, fingerprint },
          });
        } catch (error) {
          console.log("Error inserting object:", transaction);
          console.log("Error message:", error);
        }
      } */

      // Insert the transactions into the database in batches of 100
      const batchSize = 100;
      const numBatches = Math.ceil(transactions.length / batchSize);
      for (let i = 0; i < numBatches; i++) {
        const startIdx = i * batchSize;
        const endIdx = Math.min(startIdx + batchSize, transactions.length);
        const batch = transactions.slice(startIdx, endIdx);
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
