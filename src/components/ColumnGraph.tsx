import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  BarElement,
  BarController,
  LinearScale,
  CategoryScale,
} from "chart.js";
import { ChartData, ChartOptions } from "chart.js";

// Register the necessary components
Chart.register(BarElement, BarController, LinearScale, CategoryScale);

interface ColumnGraphProps {
  data: number[];
  labels: string[][];
}

const ColumnGraph: React.FC<ColumnGraphProps> = ({ data, labels }) => {
  const chartData: ChartData<"bar", number[], string[]> = {
    labels: labels,
    datasets: [
      {
        label: "Your Label",
        data: data,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    plugins: {},
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
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
