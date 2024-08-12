import React, { useState, useEffect, useMemo } from "react";
import { IColumnObject } from "@/types";
import DateRangeInput from "@/components/Inputs/DateRangeInput";
import { cn } from "@/lib/utils";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";

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
  const today = useMemo(() => new Date(), []);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    value
      ? {
          from: value.from ? new Date(value.from) : addDays(today, -30),
          to: value.to ? new Date(value.to) : today,
        }
      : {
          from: addDays(today, -30),
          to: today,
        }
  );

  useEffect(() => {
    if (value) {
      setDateRange({
        from: value.from ? new Date(value.from) : addDays(today, -30),
        to: value.to ? new Date(value.to) : today,
      });
    }
  }, [today, value]);

  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range);

    const updatedValue = {
      from: range?.from ? range.from.toISOString().split("T")[0] : "",
      to: range?.to ? range.to.toISOString().split("T")[0] : "",
    };

    onFilterChange(column.key as keyof T, updatedValue);
  };

  return (
    <div
      className={cn(
        "flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0"
      )}
    >
      <DateRangeInput
        id={`date-range-${column.key as string}`}
        label="Date Range"
        value={dateRange}
        onChange={handleDateChange}
        additionalClassName="w-full md:w-auto"
      />
    </div>
  );
};

export default DateFilter;
