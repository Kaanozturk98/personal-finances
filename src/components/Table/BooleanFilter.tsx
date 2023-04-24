import React, { useState, useEffect } from "react";
import SelectInput from "../SelectInput";
import { IColumnObject } from "@component/types";

interface BooleanFilterProps<T> {
  column: IColumnObject<T>;
  onFilterChange: (key: keyof T, value: boolean | null) => void;
  value?: boolean;
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

  const handleChange = (newValue: string) => {
    // Update this function to receive a string value
    const newBooleanValue =
      newValue === "true" ? true : newValue === "false" ? false : null;

    setSelectedValue(newValue);
    onFilterChange(column.key as keyof T, newBooleanValue);
  };

  return (
    <SelectInput
      id={`boolean-filter-${column.key as string}`}
      value={selectedValue}
      onChange={handleChange}
      boolean
      label={column.label}
    />
  );
};

export default BooleanFilter;
