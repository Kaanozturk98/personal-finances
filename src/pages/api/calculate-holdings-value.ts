import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      // Get the current month and year
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();

      // Query assetHoldings for the current month
      const assetHoldings = await prisma.assetHolding.findMany({
        include: {
          assetType: true, // Include related assetType data
        },
        where: {
          createdAt: {
            gte: new Date(currentYear, currentMonth, 1),
            lt: new Date(currentYear, currentMonth + 1, 1),
          },
        },
      });

      let totalValueUSD = 0;
      let totalValueTRY = 0;
      let usdValuationInTRY = null;

      // Calculate total value in USD and TRY
      assetHoldings.forEach((holding) => {
        const valuationUSD = holding.assetType.valuationInUSD ?? 0;
        const valuationTRY = holding.assetType.valuationInTRY ?? 0;

        // Check if the asset type is USD and store its TRY valuation
        if (holding.assetType.shortName === "USD") {
          usdValuationInTRY = valuationTRY;
        }

        let valueToAdd = 0; // Default value set to 0

        // Determine which valuation to use
        if (valuationUSD && valuationTRY) {
          valueToAdd = valuationUSD !== 1 ? valuationUSD : valuationTRY;
        } else if (valuationUSD || valuationTRY) {
          valueToAdd = valuationUSD || valuationTRY;
        }

        // Add to the total value
        if (valueToAdd === valuationUSD) {
          totalValueUSD += holding.quantity * valueToAdd;
        } else if (valueToAdd === valuationTRY) {
          totalValueTRY += holding.quantity * valueToAdd;
        }
      });

      // Adjust the totals based on the USD exchange rate
      if (!usdValuationInTRY) {
        // Fetch from schema if not available
        // Assuming fetching logic here (pseudo-code)
        usdValuationInTRY = await fetchUsdValuationInTRY();
      }

      totalValueTRY += totalValueUSD * usdValuationInTRY;
      totalValueUSD = totalValueTRY / usdValuationInTRY;

      // Send response
      res.status(200).json({ totalValueUSD, totalValueTRY });
    } catch (error) {
      console.error("Error calculating holdings value", error);
      res.status(500).json({ message: "Error calculating holdings value" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

async function fetchUsdValuationInTRY() {
  // Implement fetching logic here
  // This is a placeholder function
  return 0; // Replace with actual fetching logic
}
