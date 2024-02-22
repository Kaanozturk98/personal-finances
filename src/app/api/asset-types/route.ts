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

  const assetTypes = await prisma.assetType.findMany({
    orderBy: {
      [sortBy]: sortOrder,
    },
    where: {
      ...filterObj,
    },
    skip,
    take: limit,
  });
  const totalAssetTypes = await prisma.assetType.count({
    where: {
      ...filterObj,
    },
  });

  return NextResponse.json({
    data: assetTypes,
    total: totalAssetTypes,
    page,
    limit,
  });
}
