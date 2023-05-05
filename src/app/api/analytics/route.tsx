import { getMonthRange } from "@component/utils";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year =
    parseInt(searchParams.get("year") as string, 10) ||
    new Date().getFullYear();

  const monthRanges = getMonthRange(year);

  const categoryDataByMonth: Record<string, any> = {};

  // Fetch all categories
  const categories = await prisma.category.findMany({
    where: {
      name: {
        not: "Income",
      },
    },
  });

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  for (const { fromDate, toDate } of monthRanges) {
    const categoryData = await Promise.all(
      categories.map(async (category) => {
        const whereCategory = (isRepayment: boolean) => ({
          date: {
            gte: fromDate,
            lte: toDate,
          },
          parentTransactionId: null,
          isRepayment,
          category: {
            id: category.id,
          },
        });

        const categoryTransactionsNotRepayment =
          await prisma.transaction.aggregate({
            _sum: {
              amount: true,
            },
            where: whereCategory(false),
          });

        const categoryTransactionsRepayment =
          await prisma.transaction.aggregate({
            _sum: {
              amount: true,
            },
            where: whereCategory(true),
          });

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

    categoryDataByMonth[months[toDate.getMonth()]] = categoryData;
  }

  return NextResponse.json({ categoryDataByMonth, categories });
}
