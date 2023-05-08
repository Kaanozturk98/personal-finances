"use client";
import Card from "@component/components/Card";
import SelectInput from "@component/components/SelectInput";
import StackedBarChart from "@component/components/StackedBarChart";
import { getColorForLabel } from "@component/utils";
import { Category } from "@prisma/client";
import React, { useEffect, useState } from "react";

const Analytics = () => {
  const [datasets, setDatasets] = useState<
    { label: string; data: number[]; backgroundColor: string }[]
  >([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    // Fetch the data from your API endpoint
    const searchParams = new URLSearchParams();
    if (year) searchParams.set("year", year.toString());

    const fetchData = async () => {
      const response = await fetch(`/api/analytics?${searchParams.toString()}`);
      const { categoryDataByMonth, categories } = await response.json();

      // Extract category labels from the data
      const labels = Object.keys(categoryDataByMonth);

      const datasets = categories.map((category: Category, index: number) => {
        const data = labels.map((label: string) => {
          return categoryDataByMonth[label][index].categoryAmount;
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
  }, [year]);

  const years = Array.from(
    { length: 2 },
    (_, i) => new Date().getFullYear() - i
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Monthly Expenses by Category</h1>
      <div className="max-w-xs">
        <SelectInput
          id="year-select"
          label="Year"
          value={year.toString()}
          onChange={(value) => setYear(parseInt(value, 10))}
          optionValues={years.map((y) => y.toString())}
          clearOption={false}
        />
      </div>
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
