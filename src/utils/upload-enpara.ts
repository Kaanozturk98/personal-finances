import { AnyArray, TransactionCreate } from "@component/types";
import { Bank, CardType, Currency } from "@prisma/client";
import { parseDate, areDatesInSameMonth } from ".";

const dateMatchRegex = (cardType: CardType) =>
  cardType === CardType.DEBIT ? /^\d{2}\/\d{2}\/\d{2}/ : /^\d{2}\/\d{2}\/\d{4}/;

export function parseAmount(amountString: string) {
  const normalizedAmount = amountString.replace(/\./g, "").replace(/,/g, ".");
  return parseFloat(normalizedAmount);
}

export function extractCreditCardTransactions(
  rows: string[],
  cardType: CardType,
  pdfDate: Date
): TransactionCreate[] {
  const transactions = rows.map((line) => {
    /* if (line.includes("GETİR") || true) {
      console.log("line", line);
    } */
    // Extract date
    const dateMatch = line.match(dateMatchRegex(cardType));
    let date: Date = new Date(0);
    if (dateMatch) {
      date = parseDate(dateMatch[0], cardType);
      //
      line = line.replace(dateMatch[0], "");
    }

    // Extract amount and currency
    const amountAndCurrencyRegex = /\s(\d{1,3}\.{0,1})*\d{1,3},\d{2}\sTL$/;
    // /\s(?:[$]|)[+-]?[0-9]{1,3}(?:[0-9]*(?:[.,][0-9]{2})?|(?:.[0-9]{3})*(?:\,[0-9]{1,2})?)\s*TL$/;
    const amountAndCurrencyMatch = line.match(amountAndCurrencyRegex);
    let amount: number = -1;
    let currency: Currency = "TL";
    if (amountAndCurrencyMatch) {
      const amountAndCurrency =
        amountAndCurrencyMatch && amountAndCurrencyMatch[0].trim();
      amount = parseAmount(amountAndCurrency.split(" ")[0]);
      currency = amountAndCurrency.split(" ")[1] as Currency;
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

    // Assign the correct date to the transactions with installments
    if (installments > 1 && !areDatesInSameMonth(date, pdfDate)) date = pdfDate;

    return {
      date,
      description,
      installments,
      amount,
      currency,
      cardType,
      categoryId: null,
      parentTransactionId: null,
      isRepayment,
      bank: Bank.ENPARA,
    };
  });

  return transactions;
}

export function extractDebitCardTransactions(
  rows: string[][],
  cardType: CardType
): TransactionCreate[] {
  const transactions = rows.map((line) => {
    if (line.length === 1) {
      let stringLine = line[0];
      // Extract date
      const dateEl = (stringLine.match(dateMatchRegex(cardType)) || [
        "01/01/1970",
      ])[0];
      const date = parseDate(dateEl, cardType);
      stringLine = stringLine.replace(dateEl, "");

      // Extract currency
      const [currency] = stringLine.split(" ").slice(-1);

      // Extract amount
      stringLine = stringLine.split(currency)[0].trim();
      let [amountEl] = stringLine.split(" ").slice(-1);

      // Workarounds for when there is an one liner incoming transaction
      // If amountEl includes ',' more than one time
      if (amountEl.split(",").length - 1 > 1) {
        amountEl = amountEl.split(",").slice(-2).join(",");
      }
      // Remove any chars other than digit, comma and dot from the string
      [amountEl] = amountEl.match(/\d((?=([.,]\d|\d)).)*/) || ["-1"];

      const amount = parseAmount(amountEl);
      stringLine = stringLine.replace(amountEl, "");
      stringLine = stringLine.trim();

      // Extract isRepayment
      const isRepayment = !stringLine.endsWith("-");
      if (!isRepayment) {
        stringLine = stringLine.slice(0, -1);
      }

      // Extract description
      // Only description left from the initial string
      const description = stringLine.trim();

      return {
        date,
        description,
        installments: 1,
        amount,
        currency: currency as Currency,
        cardType,
        categoryId: null,
        parentTransactionId: null,
        isRepayment,
        bank: Bank.ENPARA,
      };
    } else {
      const dateEl = line.shift() || "";
      const date = parseDate(dateEl, cardType);

      // Extract amount and currency
      let amountsAndCurrencyEl: string = line.pop() || "";
      const currency = amountsAndCurrencyEl.split(" ").pop() || "";

      // Extract isRepayment
      const isRepayment = !amountsAndCurrencyEl.trim().startsWith("-");
      if (!isRepayment) {
        amountsAndCurrencyEl = amountsAndCurrencyEl.replace("-", "");
      }

      //
      const amount = parseAmount(
        amountsAndCurrencyEl.split(currency)[0].trim()
      );

      // Extract description
      const description = line.join(" ");

      return {
        date,
        description,
        installments: 1,
        amount,
        currency: currency as Currency,
        cardType,
        categoryId: null,
        parentTransactionId: null,
        isRepayment,
        bank: Bank.ENPARA,
      };
    }
  });

  return transactions;
}

export function extractTransactions(
  rows: string[] | string[][],
  cardType: CardType,
  pdfDate: Date
): TransactionCreate[] {
  let transactions: TransactionCreate[] = [];
  switch (cardType) {
    case CardType.CREDIT:
      transactions = extractCreditCardTransactions(
        rows as string[],
        cardType,
        pdfDate
      );
      break;

    case CardType.DEBIT:
      transactions = extractDebitCardTransactions(rows as string[][], cardType);
      break;
  }

  return transactions;
}

export function transformCreditCardPdfText(
  pdfText: string,
  cardType: CardType
): string[] {
  let tmp: any = pdfText.split("İşlem tarihiAçıklamaTaksitTutar\n");
  tmp.shift();

  tmp = tmp.map((page: any, index: number) => {
    // console.log("page", page);
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
        !rows[index + 1].match(/\)[0-9]+\/[0-9]+\s/i) &&
        !rows[index + 1].match(dateMatchRegex(cardType))
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
    // console.log("rows", rows);

    return rows;
  });
  tmp = tmp.flat();

  // Workarounds
  const transactionsToFilter = new Set([
    "Ödeme - Otomatik tahsilat",
    "Bir önceki ekstre bakiyeniz",
  ]);
  tmp = tmp.filter((e: any) => !transactionsToFilter.has(e));

  return tmp;
}

function parseBalances(text: string) {
  const tryRegex = /Vadesiz TL--([\d.,]+)TL/;
  const usdRegex = /Vadesiz USD--([\d.,]+)USD/;
  const eurRegex = /Vadesiz EUR--([\d.,]+)EUR/;
  const goldRegex = /Altın--([\d.,]+)gr\./;

  const parseCurrencyValue = (regex: RegExp) => {
    const match = regex.exec(text);
    return match ? parseFloat(match[1].replace(",", ".")) : 0.0;
  };

  const balances: AnyArray = [
    {
      name: "Turkish Lira",
      shortName: "TRY",
      quantity: parseCurrencyValue(tryRegex),
      valuationInTRY: 1,
      assetCategory: "CURRENCY",
    },
    {
      name: "US Dollar",
      shortName: "USD",
      quantity: parseCurrencyValue(usdRegex),
      valuationInUSD: 1,
      assetCategory: "CURRENCY",
    },
    {
      name: "Euro",
      shortName: "EUR",
      quantity: parseCurrencyValue(eurRegex),
      assetCategory: "CURRENCY",
    },
    {
      name: "Gold(gr.)",
      shortName: "GAU",
      quantity: parseCurrencyValue(goldRegex),
      assetCategory: "COMMODITY",
    },
  ];

  return balances;
}

export function transformDebitCardPdfText(
  pdfText: string,
  cardType: CardType
): { rows: string[]; balances: AnyArray } {
  let tmp: any[] = pdfText.split("TarihAçıklamaTutarBakiye\n");

  const firstPart = tmp.shift();
  const balances = parseBalances(firstPart);

  tmp = tmp.map((page: any) => {
    const cells: string[] = page.split("\n");
    // Create rows
    const dateIndexes: number[] = [];
    cells.forEach((cell, index) => {
      if (cell.match(dateMatchRegex(cardType))) {
        dateIndexes.push(index);
      }
    });
    let rows = dateIndexes.map((dateIndex, i) =>
      dateIndex !== dateIndexes.length - 1
        ? cells.slice(dateIndex, dateIndexes[i + 1])
        : []
    );

    rows = rows.map((row) => {
      if (row.some((cell) => cell.match(/\d\dSayfa\//i))) {
        const divider = row.findIndex((e) => e.match(/\d\dSayfa\//i));
        row = row.slice(0, divider);
      }

      return row;
    });

    return rows;
  });

  tmp = tmp.flat();

  // Define the set of transactions to filter
  const transactionsToFilter = new Set([
    "Alış/Satış",
    "Enpara.com kredi kartı",
    "Ödeme, Talimatlı kredi kartı ödemesi",
    "itibarıyla QNB Finansbank dışından gelen yabancı para transferi (SWIFT) ücreti",
  ]);

  // Existing code
  tmp = tmp.filter((e: string[]) => e.length);
  // Remove if any of the rows arrays don't include a date
  tmp = tmp.filter((e: string[]) =>
    e.some((k) => k.match(dateMatchRegex(cardType)))
  );

  // Refactored filter condition using transactionsToFilter set
  tmp = tmp.filter(
    (e: string[]) =>
      !e.some((k) =>
        Array.from(transactionsToFilter).some((filterItem) =>
          k.includes(filterItem)
        )
      )
  );

  return { rows: tmp, balances };
}

export function transformPdfText(pdfText: string): {
  rows: string[];
  cardType: CardType;
  pdfDate: Date;
  balances: AnyArray | null;
} {
  const cardType = pdfText.includes("\n\nEkstre tarihi")
    ? CardType.CREDIT
    : CardType.DEBIT;

  const cuttOffDate = parseDate(
    pdfText
      .split("\n")
      .filter((e) => e)[0]
      .replace("Ekstre tarihi", ""),
    cardType
  );

  const pdfDate = new Date(cuttOffDate.setMonth(cuttOffDate.getMonth() - 1));

  let rows: string[] = [];
  let balances: AnyArray | null = null;
  switch (cardType) {
    case CardType.CREDIT:
      rows = transformCreditCardPdfText(pdfText, cardType);
      break;

    case CardType.DEBIT:
      const { rows: tmpRows, balances: tmpBalances } =
        transformDebitCardPdfText(pdfText, cardType);
      rows = tmpRows;
      balances = tmpBalances;
      break;
  }

  return { rows, cardType, pdfDate, balances };
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
