import React, { useEffect, useState } from "react";
import { IColumnObject } from "@component/types";
import NumberInput from "../../Inputs/NumberInput";

interface NumberFilterProps<T> {
  column: IColumnObject<T>;
  onFilterChange: (key: keyof T, value: number) => void;
  value?: number;
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

  const handleChange = (newValue: number) => {
    const value = newValue ?? null;
    setSelectedValue(value);
    onFilterChange(column.key as keyof T, value as number);
  };

  return (
    <NumberInput
      id={`number-filter-${column.key as string}`}
      value={selectedValue}
      onChange={handleChange}
      min={0}
      label={column.label}
    />
  );
};

export default NumberFilter;
