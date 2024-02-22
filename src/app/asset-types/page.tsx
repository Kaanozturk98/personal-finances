"use client";
import Table from "@component/components/Table";
import { IColumnObject } from "@component/types";
import { AssetCategory, AssetType } from "@prisma/client";
import React from "react";

const columns: IColumnObject<AssetType>[] = [
  {
    key: "id",
    label: "ID",
    sort: false,
    type: "number",
  },
  {
    key: "name",
    label: "Name",
    sort: true,
    type: "string",
    filter: true,
    form: true,
  },
  {
    key: "shortName",
    label: "Short Name",
    sort: true,
    type: "string",
    form: true,
  },
  {
    key: "valuationInUSD",
    label: "Valuation in USD",
    sort: true,
    type: "number",
    form: true,
  },
  {
    key: "valuationInTRY",
    label: "Valuation in TRY",
    sort: true,
    type: "number",
    form: true,
  },
  {
    key: "assetCategory",
    label: "Asset Category",
    sort: false,
    type: "enum",
    form: true,
    options: Object.values(AssetCategory),
  },
  {
    key: "createdAt",
    label: "Created At",
    sort: true,
    type: "date",
    form: false,
  },
];

const AssetTypesPage: React.FC = () => {
  const formatData = (types: AssetType[]) =>
    types.map((type) => {
      const formattedDate = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(type.createdAt));

      return [
        type.id.toString(),
        type.name,
        type.shortName,
        type.valuationInUSD?.toString() || "",
        type.valuationInTRY?.toString() || "",
        type.assetCategory,
        formattedDate,
      ];
    });

  return (
    <Table<AssetType>
      columns={columns}
      route="asset-types"
      formatData={formatData}
      defaultSortBy={"name"}
      add
      update
      checkbox={false}
    />
  );
};

export default AssetTypesPage;
