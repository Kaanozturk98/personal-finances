import React, { useEffect, useState } from "react";
import { IColumnObject } from "@/types";
import SelectInput from "@/components/Inputs/SelectInput";

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
    value !== undefined ? value.toString() : "none"
  );

  useEffect(() => {
    setSelectedValue(value !== undefined ? value.toString() : "none");
  }, [value]);

  const handleChange = (newValue: string) => {
    // Convert the string value to a boolean or null
    const newBooleanValue =
      newValue === "true" ? true : newValue === "false" ? false : null;

    setSelectedValue(newValue);
    onFilterChange(column.key as keyof T, newBooleanValue);
  };

  return (
    <div className="space-y-2">
      <SelectInput
        id={String(column.key)}
        label={column.label}
        value={selectedValue}
        onChange={handleChange}
        boolean={true}
        clearOption={true}
      />
    </div>
  );
};

export default BooleanFilter;
