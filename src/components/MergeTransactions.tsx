import React from "react";
import Form from "./Form";
import { TransactionWithCategory } from "@component/app/transactions/page";
import { IColumnObject } from "@component/types";
import { CardType } from "@prisma/client";

interface MergeTransactionsProps {
  data: TransactionWithCategory[];
  columns: IColumnObject<TransactionWithCategory>[];
  checkedRows: Record<string, boolean>;
}

function MergeTransactions({
  columns,
  checkedRows,
  data,
}: MergeTransactionsProps) {
  const checkedRowsData = data.filter((_row, index) => checkedRows[index]);

  const amount = checkedRowsData.reduce((_amount, row) => {
    if (row.isRepayment) {
      _amount -= Math.abs(row.amount);
    } else {
      _amount += Math.abs(row.amount);
    }

    return _amount;
  }, 0);

  const finalAmount = Math.abs(amount);
  const finalIsRepayment = amount < 0;

  const defaultValues = {
    subTransactionIds: Object.values(checkedRowsData).map((row) => row.id),
    isRepayment: finalIsRepayment,
    amount: finalAmount,
    date: checkedRowsData[0].date, // improve
    cardType: CardType.MIXED,
    currency: checkedRowsData[0].currency,
  };

  return (
    <>
      <Form<any>
        route={"merge-transactions"}
        columns={columns}
        mode="create"
        defaultValues={defaultValues}
        formatPayload={(payload) => {
          payload.installments = parseFloat(payload.installments);
          return payload;
        }}
      />
    </>
  );
}

export default MergeTransactions;
