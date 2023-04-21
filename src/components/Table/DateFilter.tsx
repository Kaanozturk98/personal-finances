import React, { useState, useEffect } from "react";
import { IColumnObject } from "./types";

interface DateFilterProps<T> {
  column: IColumnObject<T>;
  onFilterChange: (key: keyof T, value: { from: string; to: string }) => void;
  value?: { from: string; to: string }; // Add this prop
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
      <div className="flex-1">
        <label className="block">From</label>
        <input
          type="date"
          className="input input-bordered w-full"
          value={fromDate}
          onChange={(e) => handleDateChange("from", e.target.value)}
        />
      </div>
      <div className="flex-1">
        <label className="block">To</label>
        <input
          type="date"
          className="input input-bordered w-full"
          value={toDate}
          onChange={(e) => handleDateChange("to", e.target.value)}
        />
      </div>
    </div>
  );
};

export default DateFilter;
