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
import { getValidRGBAFromString } from "@component/utils";

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
        backgroundColor: labels.map((label) =>
          getValidRGBAFromString(label[0], 0.4)
        ),
        borderColor: labels.map((label) => getValidRGBAFromString(label[0], 1)),
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<"pie"> = {
    plugins: {
      legend: {
        position: "bottom",
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
