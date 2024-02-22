"use client";
import Table from "@component/components/Table";
import { IColumnObject } from "@component/types";
import { AssetHolding } from "@prisma/client";
import React from "react";

const columns: IColumnObject<AssetHolding>[] = [
  {
    key: "id",
    label: "ID",
    sort: false,
    type: "number",
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
    type: "string",
    form: true,
  },
  {
    key: "platform",
    label: "Platform",
    sort: true,
    type: "string",
    form: true,
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
  const formatData = (holdings: AssetHolding[]) =>
    holdings.map((holding) => {
      return [
        holding.id.toString(),
        holding.quantity.toString(),
        holding.holdingForm,
        holding.platform,
        holding.createdAt.toISOString().split("T")[0],
      ];
    });

  return (
    <Table<AssetHolding>
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
