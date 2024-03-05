// StackedBarChart.tsx
import React from "react";
import {
  Chart,
  BarElement,
  BarController,
  CategoryScale,
  LinearScale,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";

Chart.register(BarElement, BarController, LinearScale, CategoryScale);

interface StackedBarChartProps {
  datasets: { label: string; data: number[]; backgroundColor: string }[];
  labels: string[];
}

const StackedBarChart: React.FC<StackedBarChartProps> = ({
  datasets,
  labels,
}) => {
  const chartData: ChartData<"bar", number[], string> = {
    labels,
    datasets: datasets,
  };

  const chartOptions: ChartOptions<"bar"> = {
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "#A6ADBB",
        },
      },
    },
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: "#A6ADBB",
        },
        grid: {
          color: "rgba(166, 173, 187, 0.4)",
        },
      },
      y: {
        stacked: true,
        ticks: {
          color: "#A6ADBB",
        },
        grid: {
          color: "rgba(166, 173, 187, 0.4)",
        },
      },
    },
  };

  return <Bar data={chartData} options={chartOptions} />;
};

export default StackedBarChart;
