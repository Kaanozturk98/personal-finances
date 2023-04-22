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
  const filter = searchParams.get("filter");
  const filterObj = filter ? JSON.parse(filter) : {};

  const dateFilter: { gte?: Date; lte?: Date } = {};
  if (filterObj.date && filterObj.date.from) {
    dateFilter.gte = new Date(filterObj.date.from);
  }
  if (filterObj.date && filterObj.date.to) {
    dateFilter.lte = new Date(filterObj.date.to);
  }

  const transactions = await prisma.transaction.findMany({
    include: {
      category: true,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    where: {
      ...filterObj,
      date: dateFilter,
    },
    skip,
    take: limit,
  });
  const totalTransactions = await prisma.transaction.count({
    where: {
      ...filterObj,
      date: dateFilter,
    },
  });

  return NextResponse.json({
    data: transactions,
    total: totalTransactions,
    page,
    limit,
  });
}
