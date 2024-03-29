import { Bank, CardType, Currency } from "@prisma/client";
import { TransactionCreate } from "@component/types";
import { parseDate, areDatesInSameMonth } from ".";
import { parseAmount } from "./upload-enpara";

function getBillingPeriodDates(billingDateStr: string): [Date, Date] {
  const billingDate = parseDate(billingDateStr, CardType.CREDIT);
  const startDate = new Date(
    billingDate.getFullYear(),
    billingDate.getMonth() - 2,
    billingDate.getDate() + 1
  );
  const endDate = new Date(
    billingDate.getFullYear(),
    billingDate.getMonth() - 1,
    billingDate.getDate() + 1
  );
  return [startDate, endDate];
}

export function extractInstallmentNumber(description: string): number {
  const installmentMatch = description.match(/(\d+)\/(\d+)\s*taksidi/i);
  return installmentMatch ? parseInt(installmentMatch[2], 10) : 1;
}

export function processExcelFile(rows: string[][]): TransactionCreate[] {
  // Assume the billing period date is in the third column of the 13th row
  const billingPeriodDates = getBillingPeriodDates(rows[12][2]);

  // Define the transactions to filter out as a constant
  const transactionsToFilter = new Set([
    "Önceki Dönem TL Hesap Özeti Borcu",
    "ÖDEME-İNTERNET BANKACILIĞI",
  ]);

  // Skip the header and filter out unwanted transactions
  return rows
    .slice(16)
    .filter(
      (row) =>
        !transactionsToFilter.has(row[1].trim()) &&
        row.some((cell) => cell.trim() !== "")
    )
    .map((row) => {
      let date = parseDate(row[0], CardType.CREDIT);
      const description = row[1];
      const amount = parseAmount(row[3]);
      const isRepayment = row[3].startsWith("+");
      const installments = extractInstallmentNumber(description);

      // Assign the correct date to the transactions with installments
      if (installments > 1 && !areDatesInSameMonth(date, billingPeriodDates[0]))
        date = billingPeriodDates[0];

      return {
        date,
        description,
        amount,
        currency: Currency.TL,
        cardType: CardType.CREDIT,
        isRepayment,
        bank: Bank.YAPI_KREDI,
        categoryId: null,
        installments,
        parentTransactionId: null,
      };
    });
}
