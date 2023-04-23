"use client";
import Table from "@component/components/Table";
import { IColumnObject } from "@component/components/Table/types";
import { Category } from "@prisma/client";
import React from "react";

const columns: IColumnObject<Category>[] = [
  {
    key: "name",
    label: "Name",
    sort: false,
    type: "string",
  },
];

const CategoriesPage: React.FC = () => {
  const formatData = (categories: any[]) =>
    categories.map((category) => {
      return [category.name];
    });

  return (
    <Table<Category>
      columns={columns}
      route="categories"
      formatData={formatData}
      defaultSortBy={"name"}
    />
  );
};

export default CategoriesPage;
