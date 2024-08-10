import React, { useState, useEffect } from "react";
import { IColumnObject } from "@/types";
import SelectInput from "@/components/Inputs/SelectInput";

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
  const [selectedValue, setSelectedValue] = useState<string>(value || "none");

  useEffect(() => {
    setSelectedValue(value || "none");
  }, [value]);

  const handleChange = (newValue: string) => {
    setSelectedValue(newValue);
    onFilterChange(column.key as keyof T, newValue === "none" ? "" : newValue);
  };

  return (
    <div className="space-y-2">
      <SelectInput
        id={String(column.key)}
        label={column.label}
        value={selectedValue}
        onChange={handleChange}
        optionValues={column.options}
        clearOption={true}
      />
    </div>
  );
};

export default EnumFilter;
