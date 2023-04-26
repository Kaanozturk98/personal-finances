"use client";
import React, { useState, useEffect } from "react";
import { IColumnObject } from "@component/types";
import DateInput from "@component/components/DateInput";
import Table from "@component/components/Table";
import Card from "@component/components/Card";
import { numberWithCommas } from "@component/utils";
import { TransactionWithCategory } from "../transactions/page";

const columns: IColumnObject<TransactionWithCategory>[] = [
  {
    key: "description",
    label: "Description",
    sort: true,
    type: "string",
  },
  {
    key: "categoryId",
    label: "Category",
    sort: false,
    type: "reference",
  },
  {
    key: "date",
    label: "Date",
    sort: true,
    type: "date",
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

const formatData = (data: TransactionWithCategory[]): string[][] => {
  return data.map((transaction) => {
    const formattedDate = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(transaction.date));

    const formattedCategory = transaction.category
      ? transaction.category.name
      : "-";

    return [
      transaction.description,
      formattedCategory,
      formattedDate,
      transaction.isRepayment ? "Yes" : "No",

      `${numberWithCommas(transaction.amount)} TL`,
    ];
  });
};

const ReportsPage = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [savingsAndInvestments, setSavingsAndInvestments] = useState(0);

  const handleDateChange = (type: "from" | "to", value: string) => {
    if (type === "from") {
      setFromDate(value);
    } else {
      setToDate(value);
    }
  };

  // Update the useEffect hook to fetch the total income as well
  useEffect(() => {
    const searchParams = new URLSearchParams();
    if (fromDate) searchParams.set("fromDate", fromDate);
    if (toDate) searchParams.set("toDate", toDate);

    fetch(`/api/report?${searchParams.toString()}`)
      .then((response) => response.json())
      .then(({ totalSpent, totalIncome, savingsAndInvestments }) => {
        // Update fetched data to include totalIncome
        setTotalSpent(totalSpent);
        setTotalIncome(totalIncome);
        setSavingsAndInvestments(savingsAndInvestments);
      });
  }, [fromDate, toDate]);

  const defaultFilter = {
    date: {
      from: fromDate,
      to: toDate,
    },
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Reports</h1>
      <div className="flex space-x-4 mb-6">
        <div className="w-1/2">
          <DateInput
            id="from-date"
            label="From"
            value={fromDate}
            onChange={(value: string) => handleDateChange("from", value)}
          />
        </div>
        <div className="w-1/2">
          <DateInput
            id="to-date"
            label="To"
            value={toDate}
            onChange={(value: string) => handleDateChange("to", value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 mb-6">
        <Card title="Total Spent">
          <p className="text-lg font-semibold">
            {numberWithCommas(totalSpent)} TL
          </p>
        </Card>

        <Card title="Total Income">
          <p className="text-lg font-semibold">
            {numberWithCommas(totalIncome)} TL
          </p>
        </Card>

        <Card title="Savings & Investments">
          <p className="text-lg font-semibold">
            {numberWithCommas(savingsAndInvestments)} TL
          </p>
        </Card>
      </div>

      <Table
        columns={columns}
        route="transactions"
        formatData={formatData}
        defaultFilter={defaultFilter}
      />
    </div>
  );
};

export default ReportsPage;
