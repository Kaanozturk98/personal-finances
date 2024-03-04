"use client";
import Table from "@component/components/Table";
import { IColumnObject } from "@component/types";
import { AssetHolding, HoldingForm, HoldingPlatform } from "@prisma/client";
import React from "react";

export type AssetHoldingWithAssetType = AssetHolding & {
  assetType: {
    name: string;
    shortName: string;
  };
};

const columns: IColumnObject<AssetHoldingWithAssetType>[] = [
  {
    key: "id",
    label: "ID",
    sort: false,
    type: "number",
  },
  {
    key: "assetTypeId",
    label: "Asset Type",
    sort: true,
    type: "reference",
    form: true,
    fetchUrl: "asset-types",
  },
  {
    key: "quantity",
    label: "Quantity",
    sort: true,
    type: "number",
    form: true,
  },
  {
    key: "holdingForm",
    label: "Holding Form",
    sort: false,
    type: "enum",
    form: true,
    options: Object.values(HoldingForm),
  },
  {
    key: "platform",
    label: "Platform",
    sort: true,
    type: "enum",
    form: true,
    options: Object.values(HoldingPlatform),
  },
  {
    key: "createdAt",
    label: "Created At",
    sort: true,
    type: "date",
    form: false,
  },
];

const AssetHoldingsPage: React.FC = () => {
  const formatData = (holdings: AssetHoldingWithAssetType[]) =>
    holdings.map((holding) => {
      const formattedDate = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(holding.createdAt));

      const formattedAssetType = holding.assetType
        ? holding.assetType.shortName
        : "-";

      return [
        holding.id.toString(),
        formattedAssetType,
        holding.quantity.toString(),
        holding.holdingForm,
        holding.platform,
        formattedDate,
      ];
    });

  return (
    <Table<AssetHoldingWithAssetType>
      columns={columns}
      route="asset-holdings"
      formatData={formatData}
      defaultSortBy={"createdAt"}
      add
      update
      checkbox={false}
    />
  );
};

export default AssetHoldingsPage;
