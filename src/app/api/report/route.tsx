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

  const whereSpent = (isRepayment: boolean) => ({
    date: dateFilter,
    parentTransactionId: null,
    isRepayment,
    AND: [
      {
        category: {
          NOT: {
            name: "Savings & Investments",
          },
        },
      },
      {
        category: {
          NOT: {
            name: "Income",
          },
        },
      },
    ],
  });

  const totalSpentNotRepayment = await prisma.transaction.aggregate({
    _sum: {
      amount: true,
    },
    where: whereSpent(false),
  });

  const totalSpentRepayment = await prisma.transaction.aggregate({
    _sum: {
      amount: true,
    },
    where: whereSpent(true),
  });

  const whereIncome = {
    date: dateFilter,
    parentTransactionId: null,
    isRepayment: true,
    OR: [
      {
        category: {
          name: "Income",
        },
      },
      /* {
        category: null,
      }, */
    ],
  };

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
      const whereCategory = (isRepayment: boolean) => ({
        date: dateFilter,
        parentTransactionId: null,
        isRepayment,
        category: {
          id: category.id,
        },
      });

      console.log("where", whereCategory(false));
      console.log("where", whereCategory(true));

      const categoryTransactionsNotRepayment =
        await prisma.transaction.aggregate({
          _sum: {
            amount: true,
          },
          where: whereCategory(false),
        });

      const categoryTransactionsRepayment = await prisma.transaction.aggregate({
        _sum: {
          amount: true,
        },
        where: whereCategory(true),
      });

      console.log("category", category);
      console.log(
        "categoryTransactionsNotRepayment._sum",
        categoryTransactionsNotRepayment._sum
      );
      console.log(
        "categoryTransactionsRepayment._sum",
        categoryTransactionsRepayment._sum
      );

      const categoryAmount =
        (categoryTransactionsNotRepayment._sum.amount || 0) -
        (categoryTransactionsRepayment._sum.amount || 0);

      return {
        categoryId: category.id,
        categoryName: category.name,
        categoryAmount,
      };
    })
  );

  const totalSpent =
    (totalSpentNotRepayment._sum.amount || 0) -
    (totalSpentRepayment._sum.amount || 0);

  return NextResponse.json({
    totalSpent,
    totalIncome: totalIncome._sum.amount || 0,
    categoryData,
  });
}
