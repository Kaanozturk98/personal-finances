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
      <Select value={selectedValue} onValueChange={handleChange}>
        <SelectTrigger
          className={cn(
            "w-full min-w-[200px] h-10 border border-gray-300 rounded-md shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:border-primary"
          )}
        >
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{column.label}</SelectLabel>
            <SelectItem value="none">Any</SelectItem>
            {column.options!.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default EnumFilter;
