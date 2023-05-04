import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  BarElement,
  BarController,
  CategoryScale,
  LogarithmicScale,
  LinearScale,
} from "chart.js";
import { ChartData, ChartOptions } from "chart.js";
import { getValidRGBAFromString } from "@component/utils";

// Register the necessary components
Chart.register(
  BarElement,
  BarController,
  LinearScale,
  LogarithmicScale,
  CategoryScale
);

interface ColumnGraphProps {
  data: number[];
  labels: string[][];
  label: string;
}

const ColumnGraph: React.FC<ColumnGraphProps> = ({ data, labels, label }) => {
  const chartData: ChartData<"bar", number[], string[]> = {
    labels: labels,
    datasets: [
      {
        label,
        data: data,
        backgroundColor: labels.map((label) =>
          getValidRGBAFromString(label[0], 0.4)
        ),
        borderColor: labels.map((label) => getValidRGBAFromString(label[0], 1)),
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    plugins: {
      legend: {
        display: false,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    minBarLength: 5,
    scales: {
      x: {
        display: true,
      },
      y: {
        display: true,
        type: "logarithmic",
        beginAtZero: true,
      },
    },
  };

  return (
    <Bar
      data={chartData}
      options={options}
      style={{ height: "100%", width: "100%" }}
    />
  );
};

export default ColumnGraph;
