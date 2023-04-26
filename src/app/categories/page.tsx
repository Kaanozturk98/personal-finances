"use client";
import Table from "@component/components/Table";
import { IColumnObject } from "@component/types";
import { Category } from "@prisma/client";
import React from "react";

const columns: IColumnObject<Category>[] = [
  {
    key: "id",
    label: "ID",
    sort: false,
    type: "number",
  },
  {
    key: "name",
    label: "Name",
    sort: false,
    type: "string",
    filter: true,
    form: true,
  },
];

const CategoriesPage: React.FC = () => {
  const formatData = (categories: Category[]) =>
    categories.map((category) => {
      return [category.id.toString(), category.name];
    });

  return (
    <Table<Category>
      columns={columns}
      route="categories"
      formatData={formatData}
      defaultSortBy={"name"}
      add
      update
      checkbox={false}
    />
  );
};

export default CategoriesPage;
