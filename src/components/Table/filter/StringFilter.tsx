import React, { useState, useEffect } from "react";
import { IColumnObject } from "@component/types";
import TextInput from "../../TextInput";

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
    <TextInput
      id={`filter-${column.key as string}`}
      label={column.label} // Pass the label
      placeholder={`Search by ${column.label}`}
      value={selectedValue}
      onChange={handleInputChange}
    />
  );
};

export default StringFilter;
