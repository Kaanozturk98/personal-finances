import React from "react";
import { TransactionWithCategory } from "@component/app/transactions/page";
import useToast from "@component/components/Toast";
import { TagIcon } from "@heroicons/react/24/outline";

interface AutoCategorizeTransactionsProps<T> {
  checkedRowsData: T[];
  onSuccess?: () => void;
}

const AutoCategorizeTransactions = <T,>({
  checkedRowsData,
  onSuccess,
}: AutoCategorizeTransactionsProps<T>) => {
  const showToast = useToast();

  const payload = {
    transactions: checkedRowsData,
  };

  const handleClick = async () => {
    await fetch(`/api/auto-categorize-transactions`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then(({ message }) => {
        onSuccess && onSuccess();
        showToast(message, "success");
      })
      .catch((error) => console.error(error));
  };

  return (
    <button
      className="px-3 py-2 bg-base-300 hover:bg-base-200 text-base-content rounded-md h-10"
      type="button"
      onClick={handleClick}
    >
      <TagIcon className="w-5 h-5 inline-block mr-1.5 align-middle" />
      <span className="align-middle">Auto Categorize</span>
    </button>
  );
};

export default AutoCategorizeTransactions;
