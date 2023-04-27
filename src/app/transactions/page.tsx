"use client";
import Table from "@component/components/Table";
import { IColumnObject } from "@component/types";
import { numberWithCommas } from "@component/utils";
import { CardType, Category, Transaction } from "@prisma/client";
import React from "react";

export type TransactionWithCategory = Transaction & {
  category: Category | null;
};

const columns: IColumnObject<TransactionWithCategory>[] = [
  {
    key: "id",
    label: "ID",
    sort: false,
    type: "number",
  },
  {
    key: "description",
    label: "Description",
    sort: false,
    type: "string",
    form: true,
  },
  {
    key: "categoryId",
    label: "Category",
    sort: true,
    type: "reference",
    form: true,
    fetchUrl: "categories",
  },
  {
    key: "cardType",
    label: "Card Type",
    sort: true,
    type: "enum",
    filter: true,
    options: Object.values(CardType),
  },
  {
    key: "date",
    label: "Date",
    sort: true,
    type: "date",
    filter: true,
  },
  {
    key: "installments",
    label: "Installments",
    sort: true,
    type: "number",
    filter: true,
    form: false,
  },
  {
    key: "isRepayment",
    label: "Repayment",
    sort: true,
    type: "boolean",
    filter: true,
  },
  {
    key: "amount",
    label: "Amount",
    sort: true,
    type: "number",
  },
];

const TransactionsPage: React.FC = () => {
  const formatData = (transactions: TransactionWithCategory[]) =>
    transactions.map((transaction) => {
      const formattedDate = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(transaction.date));

      const formattedCategory = transaction.category
        ? transaction.category.name
        : "-";

      return [
        transaction.id.toString(),
        transaction.description,
        formattedCategory,
        transaction.cardType,
        formattedDate,
        transaction.installments.toString(),
        transaction.isRepayment ? "Yes" : "No",
        `${numberWithCommas(transaction.amount)} ${transaction.currency}`,
      ];
    });

  return (
    <Table<TransactionWithCategory>
      columns={columns}
      route="transactions"
      formatData={formatData}
      defaultSortBy={"date"}
      update
    />
  );
};

export default TransactionsPage;
