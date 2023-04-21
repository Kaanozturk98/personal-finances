import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") as string);
  const limit = parseInt(searchParams.get("limit") as string);
  const skip = (page - 1) * limit;
  const sortBy = searchParams.get("sortBy") as string;
  const sortOrder = searchParams.get("sortOrder");

  const transactions = await prisma.transaction.findMany({
    include: {
      category: true,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    skip,
    take: limit,
  });
  const totalTransactions = await prisma.transaction.count();

  return NextResponse.json({
    data: transactions,
    total: totalTransactions,
    page,
    limit,
  });
}
