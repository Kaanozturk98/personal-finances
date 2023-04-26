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

  // Create a where object for filtering
  const whereSpent = {
    date: dateFilter,
    isRepayment: false, // Add isRepayment condition for totalSpent
    OR: [
      {
        category: {
          NOT: {
            name: "Savings & Investments", // Filter out Savings & Investments
          },
        },
      },
      {
        category: null, // Include transactions without a category
      },
    ],
  };

  const whereIncome = {
    date: dateFilter,
    isRepayment: true, // Add isRepayment condition for totalIncome
    OR: [
      {
        category: {
          NOT: {
            name: "Savings & Investments", // Filter out Savings & Investments
          },
        },
      },
      {
        category: null, // Include transactions without a category
      },
    ],
  };

  const whereSavingsAndInvestments = {
    date: dateFilter,
    category: {
      name: "Savings & Investments", // Get only Savings & Investments
    },
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

  const savingsAndInvestments = await prisma.transaction.aggregate({
    _sum: {
      amount: true,
    },
    where: whereSavingsAndInvestments,
  });

  return NextResponse.json({
    totalSpent: totalSpent._sum.amount || 0,
    totalIncome: totalIncome._sum.amount || 0,
    savingsAndInvestments: savingsAndInvestments._sum.amount || 0,
  });
}
