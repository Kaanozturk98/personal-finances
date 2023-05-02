import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");

  const dateFilter: { gte?: Date; lte?: Date } = {};
  if (fromDate) {
    dateFilter.gte = new Date(fromDate);
  }
  if (toDate) {
    dateFilter.lte = new Date(toDate);
  }

  const whereSpent = {
    date: dateFilter,
    isRepayment: false,
    OR: [
      {
        category: {
          NOT: {
            name: "Savings & Investments",
          },
        },
      },
      /* {
        category: null,
      }, */
    ],
  };

  const whereIncome = {
    date: dateFilter,
    isRepayment: true,
    OR: [
      {
        category: {
          NOT: {
            name: "Savings & Investments",
          },
        },
      },
      /* {
        category: null,
      }, */
    ],
  };

  const totalSpent = await prisma.transaction.aggregate({
    _sum: {
      amount: true,
    },
    where: whereSpent,
  });

  const totalIncome = await prisma.transaction.aggregate({
    _sum: {
      amount: true,
    },
    where: whereIncome,
  });

  // Fetch all categories
  const categories = await prisma.category.findMany({
    where: {
      name: {
        not: "Income",
      },
    },
  });

  // Loop through each category and fetch the aggregated data for that category
  const categoryData = await Promise.all(
    categories.map(async (category) => {
      const categoryTransactions = await prisma.transaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          date: dateFilter,
          category: {
            id: category.id,
          },
        },
      });

      return {
        categoryId: category.id,
        categoryName: category.name,
        categoryAmount: categoryTransactions._sum.amount || 0,
      };
    })
  );

  return NextResponse.json({
    totalSpent: totalSpent._sum.amount || 0,
    totalIncome: totalIncome._sum.amount || 0,
    categoryData,
  });
}
