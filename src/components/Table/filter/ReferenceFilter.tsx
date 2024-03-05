import AutocompleteInput from "@component/components/Inputs/AutocompleteInput";
import SelectInput from "@component/components/Inputs/SelectInput";
import { IColumnObject } from "@component/types";
import React, { useEffect, useState } from "react";

interface ReferenceFilterProps<T> {
  column: IColumnObject<T>;
  onFilterChange: (key: keyof T, value: string) => void;
  value?: string;
}

const ReferenceFilter = <T,>({
  column,
  onFilterChange,
  value,
}: ReferenceFilterProps<T>) => {
  const [selectedValue, setSelectedValue] = useState<string>(value || "");

  useEffect(() => {
    setSelectedValue(value || "");
  }, [value]);

  const handleChange = (newValue: string) => {
    setSelectedValue(newValue);
    onFilterChange(column.key as keyof T, newValue);
  };

  return (
    <AutocompleteInput
      id={`reference-filter-${column.key as string}`}
      label={column.label}
      value={selectedValue}
      onChange={handleChange}
      fetchUrl={column.fetchUrl as string}
    />
  );
};

export default ReferenceFilter;
