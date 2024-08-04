import React, { useEffect, useState } from "react";
import AutocompleteInput from "@component/components/Inputs/AutocompleteInput"; // Ensure you are using the correct input component
import { IColumnObject } from "@component/types";

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
    <div className="space-y-2">
      <AutocompleteInput
        id={`reference-filter-${String(column.key)}`}
        label={column.label}
        value={selectedValue}
        onChange={handleChange}
        fetchUrl={column.fetchUrl as string}
        additionalClassName="w-full"
      />
    </div>
  );
};

export default ReferenceFilter;
