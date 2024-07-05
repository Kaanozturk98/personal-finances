import { Bank, CardType, Currency } from "@prisma/client";
import { TransactionCreate } from "@component/types";
import { parseDate } from ".";
import { parseAmount } from "./upload-enpara";

export function processExcelFile(rows: string[][]): TransactionCreate[] {
  // Define the transactions to filter out as a constant
  const transactionsToFilter = new Set([
    "Önceki Dönem TL Hesap Özeti Borcu",
    "ÖDEME-İNTERNET BANKACILIĞI",
  ]);

  // Skip the header and filter out unwanted transactions
  return rows
    .slice(11)
    .filter(
      (row) =>
        !transactionsToFilter.has(row[1].trim()) &&
        row.some((cell) => cell.trim() !== "")
    )
    .map((row) => {
      let date = parseDate(row[0], CardType.CREDIT);
      const description = row[5];
      const amount = parseAmount(String(row[6]));
      const isRepayment = !String(row[6]).startsWith("-");
      const installments = 1;

      return {
        date,
        description,
        amount,
        currency: Currency.TL,
        cardType: CardType.DEBIT,
        isRepayment,
        bank: Bank.YAPI_KREDI,
        categoryId: null,
        installments,
        parentTransactionId: null,
      };
    });
}
