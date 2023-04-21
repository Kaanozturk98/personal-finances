import React, { useEffect, useState } from "react";
import { IColumnObject } from "./types";

interface NumberFilterProps<T> {
  column: IColumnObject<T>;
  onFilterChange: (key: keyof T, value: number) => void;
  value?: number; // Add this prop
}

const NumberFilter = <T,>({
  column,
  onFilterChange,
  value,
}: NumberFilterProps<T>) => {
  const [selectedValue, setSelectedValue] = useState<number | null>(
    value || null
  );

  useEffect(() => {
    setSelectedValue(value || null);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : null;
    setSelectedValue(value);
    onFilterChange(column.key as keyof T, value as number);
  };

  return (
    <>
      <label
        htmlFor={`number-filter-${column.key as string}`}
        className="block mb-1"
      >
        {column.label}
      </label>
      <input
        id={`number-filter-${column.key as string}`}
        type="number"
        className="input input-bordered w-full min-w-[200px]"
        value={selectedValue as number}
        onChange={handleChange}
      />
    </>
  );
};

export default NumberFilter;
