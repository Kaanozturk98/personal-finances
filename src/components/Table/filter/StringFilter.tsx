import React, { useState, useEffect } from "react";
import { IColumnObject } from "@component/types";
import TextInput from "@component/components/Inputs/TextInput";

interface StringFilterProps<T> {
  column: IColumnObject<T>;
  handleSearchChange: (text: string) => void;
  value?: string;
}

const StringFilter = <T,>({
  column,
  handleSearchChange,
  value,
}: StringFilterProps<T>) => {
  const [selectedValue, setSelectedValue] = useState<string>(value || "");

  useEffect(() => {
    setSelectedValue(value || "");
  }, [value]);

  const handleInputChange = (newValue: string) => {
    setSelectedValue(newValue);
    handleSearchChange(newValue);
  };

  return (
    <div className="space-y-2">
      <TextInput
        id={`filter-${String(column.key)}`}
        label={column.label}
        placeholder={`Search by ${column.label}`}
        value={selectedValue}
        onChange={handleInputChange}
        additionalClassName="w-full"
      />
    </div>
  );
};

export default StringFilter;
