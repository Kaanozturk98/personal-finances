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
import { getColorForLabel } from "@component/utils";

// Register the necessary components
Chart.register(
  BarElement,
  BarController,
  LinearScale,
  LogarithmicScale,
  CategoryScale
);

interface BarGraphProps {
  data: number[];
  labels: string[];
  label: string;
}

const BarChart: React.FC<BarGraphProps> = ({ data, labels, label }) => {
  const chartData: ChartData<"bar", number[], string> = {
    labels: labels,
    datasets: [
      {
        label,
        data: data,
        backgroundColor: labels.map((label) => getColorForLabel(label)),
        borderColor: labels.map((label) => getColorForLabel(label)),
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
    scales: {
      x: {
        display: true,
        ticks: {
          color: "#A6ADBB",
        },
        grid: {
          color: "rgba(166, 173, 187, 0.4)",
        },
      },
      y: {
        display: true,
        type: "linear",
        beginAtZero: true,
        ticks: {
          color: "#A6ADBB",
        },
        grid: {
          color: "rgba(166, 173, 187, 0.4)",
        },
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

export default BarChart;
