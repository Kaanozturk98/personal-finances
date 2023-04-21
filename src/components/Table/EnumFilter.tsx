import React, { useState, useEffect } from "react";
import { IColumnObject } from "./types";

interface EnumFilterProps<T> {
  column: IColumnObject<T>;
  onFilterChange: (key: keyof T, value: string) => void;
  value?: string; // Add this prop
}

const EnumFilter = <T,>({
  column,
  onFilterChange,
  value,
}: EnumFilterProps<T>) => {
  const [selectedValue, setSelectedValue] = useState<string>(value || "");

  useEffect(() => {
    setSelectedValue(value || "");
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(event.target.value);
    onFilterChange(column.key as keyof T, event.target.value);
  };

  return (
    <>
      <label
        htmlFor={`enum-filter-${column.key as string}`}
        className="block mb-1"
      >
        {column.label}
      </label>
      <select
        id={`enum-filter-${column.key as string}`}
        className="select select-bordered w-full min-w-[200px]"
        value={selectedValue}
        onChange={handleChange}
      >
        <option value="">Select</option>
        {column.options?.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </>
  );
};

export default EnumFilter;
