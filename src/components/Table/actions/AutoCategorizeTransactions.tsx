import React from "react";
import useToast from "@/components/Toast";
import { TagIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    try {
      const response = await fetch(`/api/auto-categorize-transactions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(data.message, "success");
        if (onSuccess) onSuccess();
      } else {
        showToast(data.message || "Failed to auto-categorize", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("An error occurred during categorization", "error");
    }
  };

  return (
    <Button
      size={"sm"}
      variant={"outline"}
      onClick={handleClick}
      disabled={checkedRowsData.length < 1}
    >
      <TagIcon className="w-5 h-5 mr-1.5" />
      Auto Categorize
    </Button>
  );
};

export default AutoCategorizeTransactions;
