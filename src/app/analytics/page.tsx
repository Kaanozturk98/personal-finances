"use client";
import Card from "@component/components/Card";
import StackedBarChart from "@component/components/Charts/StackedBarChart";
import { AnyObject } from "@component/types";
import { getColorForLabel } from "@component/utils";
import { Category } from "@prisma/client";
import React, { useCallback, useEffect, useState } from "react";

const Analytics = () => {
  const [datasets, setDatasets] = useState<
    { label: string; data: number[]; backgroundColor: string }[]
  >([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false); // New loading state

  // Function to fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true); // Start loading
    const response = await fetch(`/api/analytics`);
    const { categoryDataByMonth, categories } = await response.json();

    const newLabels = Object.keys(categoryDataByMonth);
    const newDatasets = categories.map((category: Category) => {
      const data = newLabels.map((label) => {
        const categoryDataForMonth = categoryDataByMonth[label].find(
          (data: AnyObject) => data.categoryId === category.id
        );

        return categoryDataForMonth
          ? categoryDataForMonth.categoryAmount
          : null;
      });

      return {
        label: category.name,
        data,
        backgroundColor: getColorForLabel(category.name),
      };
    });

    setLabels(newLabels);
    setDatasets(newDatasets);
    setIsLoading(false); // End loading
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Monthly Expenses by Category</h1>
      <button onClick={fetchData} className="btn btn-base">
        Refresh Data
      </button>
      {isLoading ? (
        <span>Loading...</span>
      ) : datasets.length > 0 && labels.length > 0 ? (
        <div className="h-[calc(100vh-216px)]">
          <Card>
            <StackedBarChart datasets={datasets} labels={labels} />
          </Card>
        </div>
      ) : (
        <span>No data available</span>
      )}
    </div>
  );
};

export default Analytics;
