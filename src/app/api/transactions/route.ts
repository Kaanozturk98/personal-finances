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
  let filterObj: any = {};

  try {
    if (filter) filterObj = JSON.parse(filter);
    // throw new Error("Error parsing filter");
  } catch (error) {
    console.error("Error parsing filter", error);
    throw new Error("Error parsing filter");
  }

  const searchText = searchParams.get("searchText");
  const searchKey = searchParams.get("searchKey");

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
      subTransactions: true,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    where: {
      ...filterObj,
      date: dateFilter,
      parentTransactionId: null,
      ...(searchText && searchKey
        ? {
            [searchKey]: {
              contains: searchText,
            },
          }
        : {}),
    },
    skip,
    take: limit,
  });

  const totalTransactions = await prisma.transaction.count({
    where: {
      ...filterObj,
      date: dateFilter,
      parentTransactionId: null,
      ...(searchText && searchKey
        ? {
            [searchKey]: {
              contains: searchText,
            },
          }
        : {}),
    },
  });

  return NextResponse.json({
    data: transactions,
    total: totalTransactions,
    page,
    limit,
  });
}
