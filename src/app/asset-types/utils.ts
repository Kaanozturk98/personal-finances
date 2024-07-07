import { AssetType } from "@prisma/client";

export const formatPayload = (data: Partial<AssetType>) => {
  return {
    ...data,
    valuationInUSD: parseFloat(String(data.valuationInUSD)),
    valuationInTRY: parseFloat(String(data.valuationInTRY)),
  };
};
