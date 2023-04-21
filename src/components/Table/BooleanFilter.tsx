import React, { useState, useEffect } from "react";
import { IColumnObject } from "./types";

interface BooleanFilterProps<T> {
  column: IColumnObject<T>;
  onFilterChange: (key: keyof T, value: boolean | null) => void;
  value?: boolean; // Add this prop
}

const BooleanFilter = <T,>({
  column,
  onFilterChange,
  value,
}: BooleanFilterProps<T>) => {
  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    value !== undefined ? value.toString() : ""
  );

  useEffect(() => {
    setSelectedValue(value !== undefined ? value.toString() : "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue =
      e.target.value === "true"
        ? true
        : e.target.value === "false"
        ? false
        : null;

    setSelectedValue(e.target.value);
    onFilterChange(column.key as keyof T, newValue);
  };

  return (
    <>
      <label
        htmlFor={`boolean-filter-${column.key as string}`}
        className="block mb-1"
      >
        {column.label}
      </label>
      <select
        id={`boolean-filter-${column.key as string}`}
        className="select select-bordered w-full min-w-[200px]"
        value={selectedValue}
        onChange={handleChange}
      >
        <option value="">Select</option>
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
    </>
  );
};

export default BooleanFilter;
