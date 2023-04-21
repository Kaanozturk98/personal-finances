import React, { useState, useEffect } from "react";
import { IColumnObject } from "./types";

interface StringFilterProps<T> {
  column: IColumnObject<T>;
  onFilterChange: (key: keyof T, value: string) => void;
  value?: string; // Add this prop
}

const StringFilter = <T,>({
  column,
  onFilterChange,
  value,
}: StringFilterProps<T>) => {
  const [selectedValue, setSelectedValue] = useState<string>(value || "");

  useEffect(() => {
    setSelectedValue(value || "");
  }, [value]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value);
    onFilterChange(column.key as keyof T, event.target.value);
  };

  return (
    <>
      <label
        htmlFor={`filter-${column.key as string}`}
        className="block text-sm mb-1"
      >
        {column.label}
      </label>
      <input
        id={`filter-${column.key as string}`}
        type="text"
        className="input input-bordered w-full min-w-[200px]"
        placeholder={`Filter by ${column.label}`}
        value={selectedValue}
        onChange={handleInputChange}
      />
    </>
  );
};

export default StringFilter;
