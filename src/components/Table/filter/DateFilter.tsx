import React, { useState, useEffect } from "react";
import { IColumnObject } from "@component/types";
import DateInput from "../../Inputs/DateInput";
import { cn } from "@component/lib/utils";

interface DateFilterProps<T> {
  column: IColumnObject<T>;
  onFilterChange: (key: keyof T, value: { from: string; to: string }) => void;
  value?: { from: string; to: string };
}

const DateFilter = <T,>({
  column,
  onFilterChange,
  value,
}: DateFilterProps<T>) => {
  const [fromDate, setFromDate] = useState(value?.from || "");
  const [toDate, setToDate] = useState(value?.to || "");

  useEffect(() => {
    setFromDate(value?.from || "");
    setToDate(value?.to || "");
  }, [value]);

  const handleDateChange = (type: "from" | "to", value: string) => {
    if (type === "from") {
      setFromDate(value);
    } else {
      setToDate(value);
    }

    const updatedValue = {
      from: type === "from" ? value : fromDate,
      to: type === "to" ? value : toDate,
    };

    onFilterChange(column.key as keyof T, updatedValue);
  };

  return (
    <div
      className={cn(
        "flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0"
      )}
    >
      <DateInput
        id={`from-${column.key as string}`}
        label="From"
        value={fromDate}
        onChange={(value: string) => handleDateChange("from", value)}
        additionalClassName="w-full md:w-auto"
      />
      <DateInput
        id={`to-${column.key as string}`}
        label="To"
        value={toDate}
        onChange={(value: string) => handleDateChange("to", value)}
        additionalClassName="w-full md:w-auto"
      />
    </div>
  );
};

export default DateFilter;
