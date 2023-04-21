import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = searchParams.get("page")
    ? parseInt(searchParams.get("page") as string)
    : 1;
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit") as string)
    : 10;
  const skip = (page - 1) * limit;

  const transactions = await prisma.transaction.findMany({
    skip,
    take: limit,
    include: {
      category: true,
    },
  });
  const totalTransactions = await prisma.transaction.count();

  return NextResponse.json({
    data: transactions,
    total: totalTransactions,
    page,
    limit,
  });
}
