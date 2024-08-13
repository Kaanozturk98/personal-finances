"use client";
import React, { useState, useEffect } from "react";
import { IColumnObject } from "@/types";
import DateRangeInput from "@/components/Inputs/DateRangeInput";
import Table from "@/components/Table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { numberWithCommas } from "@/utils";
import { TransactionWithCategory } from "../transactions/page";
import BarChart from "@/components/Charts/BarChart";
import PieChart from "@/components/Charts/PieChart";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";

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
    sort: true,
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
    key: "installments",
    label: "Installments",
    sort: true,
    type: "number",
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
      transaction.installments.toString(),
      transaction.isRepayment ? "Yes" : "No",
      `${numberWithCommas(transaction.amount)} TL`,
    ];
  });
};

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [labels, setLabels] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    const searchParams = new URLSearchParams();
    if (dateRange?.from)
      searchParams.set("fromDate", dateRange.from.toISOString().split("T")[0]);
    if (dateRange?.to)
      searchParams.set("toDate", dateRange.to.toISOString().split("T")[0]);

    fetch(`/api/reports?${searchParams.toString()}`)
      .then((response) => response.json())
      .then(({ totalSpent, totalIncome, categoryData }) => {
        setTotalSpent(totalSpent);
        setTotalIncome(totalIncome);

        const labels = categoryData.map(
          (item: { categoryName: string }) => item.categoryName
        );
        const data = categoryData.map(
          (item: { categoryAmount: number }) => item.categoryAmount
        );

        setLabels(labels);
        setData(data);
      });
  }, [dateRange]);

  const defaultFilter = {
    date: {
      from: dateRange?.from ? dateRange.from.toISOString().split("T")[0] : "",
      to: dateRange?.to ? dateRange.to.toISOString().split("T")[0] : "",
    },
  };

  return (
    <div className="container mx-auto flex space-y-6 flex-col h-full">
      <h1 className="text-xl font-semibold">Reports</h1>

      <DateRangeInput
        id="date-range"
        label="Date Range"
        value={dateRange}
        onChange={setDateRange}
      />

      <div className="grid grid-cols-2 gap-4 ">
        <Card>
          <CardHeader>
            <CardTitle>Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {numberWithCommas(totalSpent)} TL
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {numberWithCommas(totalIncome)} TL
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-row space-x-4">
        <div className="w-1/2 h-full overflow-hidden">
          <Card>
            <CardHeader>
              <CardTitle>Pie Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart data={data} labels={labels} />
            </CardContent>
          </Card>
        </div>
        <div className="w-1/2 h-full overflow-hidden">
          <Card>
            <CardHeader>
              <CardTitle>Column Graph</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart data={data} labels={labels} label="Amount (TL)" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Not sure how the 'flex flex-col2 on the middle div fixes this...*/}
      <div className="flex flex-col min-h-0">
        <div className="overflow-hidden flex flex-col">
          <Table
            columns={columns}
            route="transactions"
            formatData={formatData}
            defaultFilter={defaultFilter}
          />
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
