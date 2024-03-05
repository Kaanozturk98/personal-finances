// EnumFilter.tsx
import React, { useState, useEffect } from "react";
import { IColumnObject } from "@component/types";
import SelectInput from "../../Inputs/SelectInput";

interface EnumFilterProps<T> {
  column: IColumnObject<T>;
  onFilterChange: (key: keyof T, value: string) => void;
  value?: string;
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

  const handleChange = (newValue: string) => {
    setSelectedValue(newValue);
    onFilterChange(column.key as keyof T, newValue);
  };

  return (
    <SelectInput
      id={`enum-filter-${column.key as string}`}
      optionValues={column.options}
      value={selectedValue}
      onChange={handleChange}
      label={column.label}
    />
  );
};

export default EnumFilter;
