import { IAssignment, IUsage, TransactionCreate } from "@component/types";
import OpenAI from "openai";
import {
  CardType,
  Category,
  ChatGptUsageStatus,
  PrismaClient,
  Transaction,
} from "@prisma/client";
import { fingerprintCounter } from "./upload-enpara";
import crypto from "crypto";
import { MessageContentText } from "openai/resources/beta/threads/messages/messages";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const prisma = new PrismaClient();

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

// Utility function to generate month ranges for last 12 months
export function getMonthRange() {
  const monthRanges = [];
  const currentDate = new Date();
  for (let i = 11; i >= 0; i--) {
    const fromDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      1
    );
    const toDate = new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 0);
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
): Promise<{ assignments: IAssignment[]; usage: IUsage }> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const openai = new OpenAI({ apiKey: openaiApiKey });

  const chatGptUsage = await prisma.chatGptUsage.create({
    data: {
      count: transactions.length,
      total_tokens: 0,
    },
  });

  const prompt = `Given the following transaction details (format: Id: Description, Amount, Installment Count) and categories, please assign the most appropriate category to each transaction:

Transaction details:
  ${transactions
    .map(
      (transaction) =>
        `${transaction.id}: ${transaction.description}, ${transaction.amount}, ${transaction.installments}`
    )
    .join("\n")}
  
Categories:
  ${categories
    .map((category) => `${category.id}. ${category.name}`)
    .join("\n")}`;

  console.log(prompt);

  const run = await openai.beta.threads.createAndRun({
    assistant_id: "asst_cRX3uWtOxr1VBaCxFmvunPLf",
    thread: {
      messages: [{ role: "user", content: prompt }],
    },
  });

  let lastStatus = "";
  let completed = false;
  let usage: IUsage = {
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
  };

  while (!completed) {
    const processingRun = await openai.beta.threads.runs.retrieve(
      run.thread_id,
      run.id
    );

    if (
      processingRun.status !== lastStatus ||
      processingRun.status === "cancelled" ||
      processingRun.status === "completed"
    ) {
      const status =
        processingRun.status === "completed"
          ? ChatGptUsageStatus.COMPLETED
          : processingRun.status === "cancelled"
          ? ChatGptUsageStatus.CANCELLED
          : ChatGptUsageStatus.IN_PROGRESS;

      // Update status in chatGptUsage
      await prisma.chatGptUsage.update({
        data: {
          status,
          total_tokens: processingRun.usage?.total_tokens,
        },
        where: {
          id: chatGptUsage.id,
        },
      });

      lastStatus = processingRun.status;
    }

    if (processingRun.status === "completed") {
      completed = true;
      usage = processingRun.usage as any;
    } else if (processingRun.status === "cancelled")
      throw new Error("Thread run was cancelled");

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const {
    data: [lastMessage],
  } = await openai.beta.threads.messages.list(run.thread_id, {
    limit: 1,
    order: "desc",
  });

  const data = (lastMessage.content as MessageContentText[])[0].text.value;

  console.log("data", typeof data, data);

  const assignments = data
    .trim()
    .split("\n")
    .map((assignment: string) => {
      const [unparcedTransactionId, unparcedCategoryId] =
        assignment.split("||"); // Updated the separator to '||'
      const transactionId = unparcedTransactionId.trim();
      const categoryId = unparcedCategoryId.trim();

      return {
        transactionId,
        categoryId,
      };
    });

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
