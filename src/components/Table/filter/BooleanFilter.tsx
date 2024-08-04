import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@component/components/ui/select";
import { IColumnObject } from "@component/types";
import { cn } from "@component/lib/utils";

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
    // Convert the string value to a boolean or null
    const newBooleanValue =
      newValue === "true" ? true : newValue === "false" ? false : null;

    setSelectedValue(newValue);
    onFilterChange(column.key as keyof T, newBooleanValue);
  };

  return (
    <div className="space-y-2">
      <Select value={selectedValue || ""} onValueChange={handleChange}>
        <SelectTrigger
          className={cn(
            "w-full min-w-[200px] h-10 border border-gray-300 rounded-md shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:border-primary"
          )}
        >
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{column.label}</SelectLabel>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
            <SelectItem value="none">Any</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default BooleanFilter;
