"use client";
import Table from "@component/components/Table";
import { IColumnObject } from "@component/components/Table/types";
import { CardType, Transaction } from "@prisma/client";
import React from "react";

const columns: IColumnObject<Transaction>[] = [
  {
    key: "description",
    label: "Description",
    sort: false,
    type: "string",
  },
  {
    key: "categoryId",
    label: "Category",
    sort: false,
    type: "reference",
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

const Transactions: React.FC = () => {
  const formatData = (transactions: any[]) =>
    transactions.map((transaction) => {
      const formattedDate = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(transaction.date));
      return [
        transaction.description,
        transaction.categoryId?.toString() ?? "-",
        transaction.cardType,
        formattedDate,
        transaction.installments.toString(),
        transaction.isRepayment ? "Yes" : "No",
        `${transaction.amount.toFixed(2)} ${transaction.currency}`,
      ];
    });

  return (
    <div className="p-8">
      <Table<Transaction>
        columns={columns}
        route="transactions"
        formatData={formatData}
        defaultSortBy={"date"}
      />
    </div>
  );
};

export default Transactions;
