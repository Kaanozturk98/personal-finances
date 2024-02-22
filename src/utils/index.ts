import { IAssignment, TransactionCreate } from "@component/types";
import { CardType, Category, Transaction } from "@prisma/client";
import { fingerprintCounter } from "./upload-enpara";
import crypto from "crypto";

const colorPool = [
  "#FF6384", // Light Red
  "#36A2EB", // Light Blue
  "#FFCE56", // Light Yellow
  "#4BC0C0", // Light Turquoise
  "#9966FF", // Light Purple
  "#FF9F40", // Light Orange
  "#26D07C", // Light Green
  "#FF6A82", // Coral
  "#6A67FF", // Periwinkle
  "#40C057", // Green
  "#A461D8", // Medium Purple
  "#FFB400", // Orange
  "#EC5D57", // Red
  "#56B4E9", // Sky Blue
  "#F0E442", // Yellow
  "#D55E00", // Brown
];
const labelColors: Record<string, string> = {};
export function getColorForLabel(label: string): string {
  // Check if the color is already assigned to the label
  if (labelColors[label]) {
    return labelColors[label];
  }

  // Find the next available color from the pool
  const color = colorPool.find((c) => !Object.values(labelColors).includes(c));

  // If all colors are used, start reusing the colors
  if (!color) {
    const index = Object.keys(labelColors).length % colorPool.length;
    labelColors[label] = colorPool[index];
  } else {
    labelColors[label] = color;
  }

  return labelColors[label];
}

// Utility function to generate month ranges for a given year
export function getMonthRange(year: number) {
  const monthRanges = [];
  for (let month = 1; month <= 12; month++) {
    const fromDate = new Date(year, month - 1, 1);
    const toDate = new Date(year, month, 0);
    monthRanges.push({ fromDate, toDate });
  }
  return monthRanges;
}

export function numberWithCommas(n: number) {
  var parts = n.toString().split(".");
  return (
    parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
    (parts[1] ? "." + parts[1].slice(0, 2) : "")
  );
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export async function getCategoryPredictions(
  transactions: Transaction[],
  categories: Category[]
): Promise<{ assignments: IAssignment[]; usage: Record<string, number> }> {
  const prompt = `Given the following transaction descriptions and categories, please assign the most appropriate category to each transaction:
  
  Transaction descriptions:
  ${transactions
    .map((transaction) => `${transaction.id}. ${transaction.description}`)
    .join(",\n")}
  
  Categories:
  ${categories
    .map((category) => `${category.id}. ${category.name}`)
    .join(",\n")}
  
  Assignments (format: <transaction id>.<transaction description> ||  <category id>. <category name>, one per line):`;

  console.log("prompt", prompt);
  /* return prompt as any; */

  const openaiApiKey = process.env.OPENAI_API_KEY;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "system", content: prompt }],
      max_tokens: 80 * transactions.length,
      n: 1,
      stop: null,
      temperature: 0,
    }),
  });

  // Check if the response is not OK
  if (!response.ok)
    throw new Error(
      `Error fetching category predictions: ${response.statusText}`
    );

  const data = await response.json();
  /* console.log("data", data);
    console.log("data", data.choices[0].message); */
  const assignments = data.choices[0].message.content
    .trim()
    .split("\n")
    .map((assignment: string) => {
      const [transactionWithIndex, categoryWithIndex] = assignment.split("||"); // Updated the separator to '||'
      const transactionId = parseInt(transactionWithIndex.split(".")[0].trim());
      const categoryId = parseInt(categoryWithIndex.split(".")[0].trim());

      return {
        transactionId,
        categoryId,
      };
    });

  const usage = data.usage;
  console.log("assignments", assignments);
  return { assignments, usage };
}

export function generateFingerprint(transaction: TransactionCreate): string {
  // Get the current time
  const currentTime = new Date();

  // Round the current time to the nearest second
  const roundedCurrentTime = new Date(
    currentTime.getFullYear(),
    currentTime.getMonth(),
    currentTime.getDate(),
    currentTime.getHours(),
    currentTime.getMinutes(),
    currentTime.getSeconds()
  );

  // Generate a key for the current second
  const counterKey = roundedCurrentTime.toISOString();

  // Increment the counter for the current second or initialize it with 1
  fingerprintCounter[counterKey] = (fingerprintCounter[counterKey] || 0) + 1;
  const counterValue = fingerprintCounter[counterKey];

  const data = [
    transaction.description,
    transaction.amount.toFixed(2),
    typeof transaction.date === "string"
      ? transaction.date
      : transaction.date.toISOString(),
    transaction.categoryId || "",
    transaction.installments,
    transaction.cardType,
    transaction.currency,
    transaction.isRepayment,
    transaction.bank,
    counterValue, // Include the counter value in the fingerprint generation
  ].join("|");

  const hash = crypto.createHash("md5").update(data).digest("hex");
  return hash;
}

export function areDatesInSameMonth(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
}

export function parseDate(dateEl: string, cardType: CardType) {
  const [day, month, year] = dateEl.split("/");
  const date = new Date(
    Date.UTC(
      parseInt((cardType === CardType.DEBIT ? "20" : "") + year),
      parseInt(month) - 1,
      parseInt(day),
      0,
      0,
      0
    )
  );
  return date;
}
