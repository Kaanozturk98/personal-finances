import { TransactionCreate } from "@component/types";
import { CardType } from "@prisma/client";
import crypto from "crypto";

export function parseAmount(amountString: string) {
  const normalizedAmount = amountString.replace(/\./g, "").replace(/,/g, ".");
  return parseFloat(normalizedAmount);
}

export function extractTransactions(
  rows: string[],
  cardType: CardType
): TransactionCreate[] {
  const transactions = rows.map((line) => {
    // Extract date
    const dateMatch = line.match(/^\d{2}\/\d{2}\/\d{4}/);
    let date: Date = new Date(0);
    if (dateMatch) {
      const [day, month, year] = dateMatch[0].split("/");
      Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0);
      date = new Date(
        Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0)
      );
      //
      line = line.replace(dateMatch[0], "");
    }

    // Extract amount and currency
    const amountAndCurrencyRegex =
      /\s(?:[$]|)[+-]?[0-9]{1,3}(?:[0-9]*(?:[.,][0-9]{2})?|(?:.[0-9]{3})*(?:\,[0-9]{1,2})?)\s*TL$/;
    const amountAndCurrencyMatch = line.match(amountAndCurrencyRegex);
    let amount: number = -1;
    let currency: "TL" = "TL";
    if (amountAndCurrencyMatch) {
      const amountAndCurrency =
        amountAndCurrencyMatch && amountAndCurrencyMatch[0].trim();
      amount = parseAmount(amountAndCurrency.split(" ")[0]);
      currency = amountAndCurrency.split(" ")[1] as "TL";
      //
      line = line.replace(amountAndCurrencyMatch[0], "");
    }

    // Extract installments
    const installmentsRegex = /(\d+)\/(\d+)$/;
    const installmentsMatch = line.match(installmentsRegex);
    const installments = installmentsMatch
      ? parseInt(installmentsMatch[2], 10)
      : 1;
    if (installmentsMatch) {
      //
      line = line.replace(installmentsMatch[0], "");
    }

    // Extract is repayment
    const isRepayment = line.slice(-1) === "-";
    if (isRepayment) line = line.replace(/.$/, "");

    // Extract description
    // Only description left from the initial string
    const description = line.trim();

    return {
      date,
      description,
      installments,
      amount,
      currency,
      cardType,
      categoryId: null,
      isRepayment,
    };
  });

  return transactions;
}

export function extractCreditCardTransactions(pdfText: string): string[] {
  let tmp: any = pdfText.split("İşlem tarihiAçıklamaTaksitTutar\n");

  tmp.shift();
  tmp = tmp.map((page: any, index: number) => {
    let rows: string[] = page.split("\n");
    // Remove the upper redundant rows
    rows = rows.filter((row) => !row.includes("Enpara.com Cep"));
    if (index === 0) rows.splice(0, 1);

    // Remove middle
    rows = rows.filter((row) => !row.includes("Faiz oranı"));
    // Installments are parsed in a new line
    // Merge them to the line before
    const installmentRowIndexes: number[] = [];
    rows = rows.map((row, index) => {
      if (
        index !== rows.length - 1 &&
        rows[index + 1].match(/[0-9]+\/[0-9]+\s/i) &&
        !rows[index + 1].match(/\)[0-9]+\/[0-9]+\s/i)
      ) {
        installmentRowIndexes.push(index + 1);
        return row.concat(" ", rows[index + 1]);
      }
      return row;
    });
    rows = rows.filter((_row, index) => !installmentRowIndexes.includes(index));
    rows = rows.map((row) => {
      if (row.match(/\)[0-9]+\/[0-9]+\s/i)) {
        const arr = row.split(")");
        row = arr[0].concat(") ", arr[1]);
      }
      return row;
    });
    rows = rows.filter(
      (row) => !row.includes("sanal kredi kartınızla yapılan işlemler")
    );

    // Remove the lower redundant rows
    const paginationRegex = /Sayfa [0-9]+ \/ [0-9]+/i;
    let divider = 0;
    if (index === tmp.length - 1) {
      divider = rows.findIndex((e) => e.match("Aylık alışveriş"));
      rows.splice(divider);
      // This happens when the last page actually includes no transactions thus no table header.
      // This can done more robustly if the page splitting logic focuses on pagination lines.
      if (rows.some((row) => row.match(paginationRegex))) {
        divider = rows.findIndex((e) => e.match(paginationRegex));
        rows.splice(divider);
      }
    } else {
      divider = rows.findIndex((e) => e.match(paginationRegex));
      rows.splice(divider);
    }

    rows = rows.filter(
      (row) =>
        !(
          row.includes("QNB Finansbank A.Ş. Büyük") ||
          row.includes("Ticaret sicil no :") ||
          row.includes("Seri-Sıra no :")
        )
    );

    return rows;
  });
  tmp = tmp.flat();

  return tmp;
}

export function transformPdfText(pdfText: string): {
  rows: string[];
  cardType: CardType;
} {
  const cardType = pdfText.includes("\n\nEkstre tarihi")
    ? CardType.CREDIT
    : CardType.DEBIT;

  let rows: string[] = [];
  switch (cardType) {
    case CardType.CREDIT:
      rows = extractCreditCardTransactions(pdfText);
      break;

    case CardType.DEBIT:
      break;
  }

  return { rows, cardType };
}

export function cleanPdfText(pdfText: string) {
  return pdfText
    .replaceAll("\x00", "ö")
    .replaceAll("\b", "Ö")
    .replaceAll("\x01", "Ö")
    .replaceAll("\x02", "ü")
    .replaceAll("\x03", "ğ")
    .replaceAll("\x04", "İ")
    .replaceAll("\x05", "ş")
    .replaceAll("\x06", "ç")
    .replaceAll("\x07", "ö")
    .replaceAll("\x10", "Ç")
    .replaceAll("\x11", "ş")
    .replaceAll("\x12", "ü")
    .replaceAll("\x13", "Ç")
    .replaceAll("\x14", "Ş")
    .replaceAll("\x15", "İ")
    .replaceAll("\x17", "Ü");
}

// In-memory storage for the counter
export const fingerprintCounter: { [key: string]: number } = {};

export function generateFingerprint(transaction: TransactionCreate): string {
  // Get the current time
  const currentTime = new Date();

  // Round the current time to the nearest minute
  const roundedCurrentTime = new Date(
    currentTime.getFullYear(),
    currentTime.getMonth(),
    currentTime.getDate(),
    currentTime.getHours(),
    currentTime.getMinutes()
  );

  // Generate a key for the current minute
  const counterKey = roundedCurrentTime.toISOString();

  // Increment the counter for the current minute or initialize it with 1
  fingerprintCounter[counterKey] = (fingerprintCounter[counterKey] || 0) + 1;
  const counterValue = fingerprintCounter[counterKey];

  const data = [
    transaction.description,
    transaction.amount.toFixed(2),
    transaction.date.toISOString(),
    transaction.categoryId || "",
    transaction.installments,
    transaction.cardType,
    transaction.currency,
    transaction.isRepayment,
    counterValue, // Include the counter value in the fingerprint generation
  ].join("|");

  const hash = crypto.createHash("md5").update(data).digest("hex");
  return hash;
}
