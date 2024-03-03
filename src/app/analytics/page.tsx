"use client";
import Card from "@component/components/Card";
import StackedBarChart from "@component/components/StackedBarChart";
import { AnyObject } from "@component/types";
import { getColorForLabel } from "@component/utils";
import { Category } from "@prisma/client";
import React, { useEffect, useState } from "react";

const Analytics = () => {
  const [datasets, setDatasets] = useState<
    { label: string; data: number[]; backgroundColor: string }[]
  >([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/api/analytics`);
      const { categoryDataByMonth, categories } = await response.json();

      const labels = Object.keys(categoryDataByMonth);
      const datasets = categories.map((category: Category) => {
        const data = labels.map((label) => {
          // Find the corresponding category data for the month
          const categoryDataForMonth = categoryDataByMonth[label].find(
            (data: AnyObject) => data.categoryId === category.id
          );

          // Return the categoryAmount, or null if not found
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

      setLabels(labels);
      setDatasets(datasets);
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Monthly Expenses by Category</h1>
      {datasets.length > 0 && labels.length > 0 ? (
        <div className="h-[calc(100vh-216px)]">
          <Card>
            <StackedBarChart datasets={datasets} labels={labels} />
          </Card>
        </div>
      ) : (
        <span>Loading...</span>
      )}
    </div>
  );
};

export default Analytics;
