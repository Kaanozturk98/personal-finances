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
    value ?? null
  );

  useEffect(() => {
    setSelectedValue(value ?? null);
  }, [value]);

  const handleChange = (newValue: number) => {
    const updatedValue = newValue ?? null;
    setSelectedValue(updatedValue);
    onFilterChange(column.key as keyof T, updatedValue as number);
  };

  return (
    <div className="space-y-2">
      <NumberInput
        id={`number-filter-${String(column.key)}`}
        value={selectedValue}
        onChange={handleChange}
        min={0}
        label={column.label}
        additionalClassName="w-full"
      />
    </div>
  );
};

export default NumberFilter;
