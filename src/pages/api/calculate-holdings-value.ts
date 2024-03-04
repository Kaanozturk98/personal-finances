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
      let currentYear = currentDate.getFullYear();
      let currentMonth = currentDate.getMonth();

      // Function to query assetHoldings
      const queryAssetHoldings = async (year: number, month: number) => {
        return await prisma.assetHolding.findMany({
          include: {
            assetType: true, // Include related assetType data
          },
          where: {
            createdAt: {
              gte: new Date(year, month, 1),
              lt: new Date(year, month + 1, 1),
            },
          },
        });
      };

      // Query assetHoldings for the current month
      let assetHoldings = await queryAssetHoldings(currentYear, currentMonth);

      // If there are no holdings for the current month, query for the last month
      if (assetHoldings.length === 0) {
        // Adjust month and year for the previous month
        if (currentMonth === 0) {
          currentYear -= 1;
          currentMonth = 11; // December of the previous year
        } else {
          currentMonth -= 1;
        }

        // Query for the previous month
        assetHoldings = await queryAssetHoldings(currentYear, currentMonth);
      }

      let totalValueUSD = 0;
      let totalValueTRY = 0;
      let usdValuationInTRY = null;

      // If there are still no holdings (even from the previous month)
      if (assetHoldings.length === 0) {
        return res.status(200).json({ totalValueUSD, totalValueTRY });
      }

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
