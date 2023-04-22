import React, { useState, useEffect } from "react";
import { IColumnObject } from "./types";
import TextInput from "../TextInput";

interface StringFilterProps<T> {
  column: IColumnObject<T>;
  onFilterChange: (key: keyof T, value: string) => void;
  value?: string;
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

  const handleInputChange = (newValue: string) => {
    setSelectedValue(newValue);
    onFilterChange(column.key as keyof T, newValue);
  };

  return (
    <TextInput
      id={`filter-${column.key as string}`}
      label={column.label} // Pass the label
      placeholder={`Filter by ${column.label}`}
      value={selectedValue}
      onChange={handleInputChange}
    />
  );
};

export default StringFilter;
