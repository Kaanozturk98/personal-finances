// DateFilter.tsx
import React, { useState, useEffect } from "react";
import { IColumnObject } from "@component/types";
import DateInput from "../../Inputs/DateInput";

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
    <div className="flex space-x-2">
      <DateInput
        id={`from-${column.key as string}`}
        label="From"
        value={fromDate}
        onChange={(value: string) => handleDateChange("from", value)}
      />
      <DateInput
        id={`to-${column.key as string}`}
        label="To"
        value={toDate}
        onChange={(value: string) => handleDateChange("to", value)}
      />
    </div>
  );
};

export default DateFilter;
