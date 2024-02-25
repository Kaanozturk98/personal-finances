import { fixYkKkTransactionDates } from "@component/utils/scripts";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const result = await fixYkKkTransactionDates();
      res.status(200).json({ message: "Script executed successfully", result });
    } catch (error) {
      res.status(500).json({ message: "Error executing script", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
