"use client";
import Table from "@component/components/Table";
import { Transaction } from "@prisma/client";
import React from "react";

const headers = [
  "Description",
  "Category",
  "Card Type",
  "Date",
  "Installments",
  "Repayment",
  "Amount",
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
        headers={headers}
        route="transactions"
        formatData={formatData}
      />
    </div>
  );
};

export default Transactions;
