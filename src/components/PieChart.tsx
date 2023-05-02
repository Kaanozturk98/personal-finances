import React from "react";
import { Pie } from "react-chartjs-2";
import {
  ChartData,
  ChartOptions,
  Chart,
  ArcElement,
  PieController,
  Tooltip,
  Legend,
} from "chart.js";

// Register required elements, controllers and plugins
Chart.register(ArcElement, PieController, Tooltip, Legend);

interface PieChartProps {
  data: number[];
  labels: string[][];
}

const PieChart: React.FC<PieChartProps> = ({ data, labels }) => {
  const chartData: ChartData<"pie", number[], string[]> = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<"pie"> = {
    plugins: {
      legend: {
        position: "left",
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <Pie
      data={chartData}
      options={options}
      style={{ height: "100%", width: "100%" }}
    />
  );
};

export default PieChart;
