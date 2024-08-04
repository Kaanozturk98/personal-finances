import React from "react";
import Form from "@component/components/Form";
import { TransactionWithCategory } from "@component/app/transactions/page";
import { IColumnObject } from "@component/types";
import { CardType } from "@prisma/client";

interface MergeTransactionsProps {
  columns: IColumnObject<TransactionWithCategory>[];
  checkedRowsData: TransactionWithCategory[];
}

function MergeTransactions({
  columns,
  checkedRowsData,
}: MergeTransactionsProps) {
  // Calculate the total amount based on the repayment status
  const amount = checkedRowsData.reduce((acc, row) => {
    return row.isRepayment
      ? acc - Math.abs(row.amount)
      : acc + Math.abs(row.amount);
  }, 0);

  const finalAmount = Math.abs(amount);
  const finalIsRepayment = amount < 0;

  // Prepare default values for the form based on the selected transactions
  const defaultValues = {
    description: checkedRowsData[0]?.description || "",
    installments: checkedRowsData[0]?.installments || 0,
    subTransactionIds: checkedRowsData.map((row) => row.id),
    isRepayment: finalIsRepayment,
    amount: finalAmount,
    date: checkedRowsData[0]?.date || "",
    cardType: CardType.MIXED,
    currency: checkedRowsData[0]?.currency || "",
  };

  return (
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
  );
}

export default MergeTransactions;
