"use client";
import Table from "@component/components/Table";
import { IColumnObject } from "@component/types";
import { numberWithCommas } from "@component/utils";
import { Bank, CardType, Category, Transaction } from "@prisma/client";
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
    sort: true,
    type: "string",
    form: true,
    filter: true,
  },
  {
    key: "categoryId",
    label: "Category",
    sort: true,
    type: "reference",
    form: true,
    fetchUrl: "categories",
    filter: true,
  },
  {
    key: "bank",
    label: "Bank",
    sort: false,
    type: "enum",
    filter: true,
    options: Object.values(Bank),
  },
  {
    key: "cardType",
    label: "Card Type",
    sort: false,
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
    form: true,
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
        transaction.bank,
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
      search={true}
      searchKey="description"
      bulkUpdate
    />
  );
};

export default TransactionsPage;
