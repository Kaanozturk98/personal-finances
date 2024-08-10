import React from "react";
import { IColumnObject } from "@/types";
import CheckboxInput from "../Inputs/CheckboxInput";

import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

interface TableHeaderProps<T> {
  columnsToRender: IColumnObject<T>[];
  checkbox: boolean;
  isAllRowsChecked: boolean;
  isSomeRowsChecked: boolean;
  handleGeneralCheckboxChange: () => void;
  handleHeaderClick: (column: IColumnObject<T>) => void;
  sortBy: keyof T | string;
  sortOrder: "asc" | "desc";
}

const TableHeader = <T extends {}>({
  columnsToRender,
  checkbox,
  isAllRowsChecked,
  isSomeRowsChecked,
  handleGeneralCheckboxChange,
  handleHeaderClick,
  sortBy,
  sortOrder,
}: TableHeaderProps<T>) => {
  return (
    <thead>
      <tr>
        {checkbox && (
          <th className="p-4">
            <CheckboxInput
              id={`checkbox-all`}
              checked={isSomeRowsChecked ? "indeterminate" : isAllRowsChecked}
              onChange={handleGeneralCheckboxChange}
              label=""
            />
          </th>
        )}
        {columnsToRender.map((column, index) => (
          <th
            key={index}
            className={cn(
              "px-4 py-2 text-left text-sm font-medium",
              column.sort && "cursor-pointer",
              sortBy === column.key && "text-primary"
            )}
            onClick={column.sort ? () => handleHeaderClick(column) : undefined}
          >
            <div className="flex items-center space-x-2">
              <span>{column.label}</span>
              {column.sort &&
                sortBy === column.key &&
                (sortOrder === "asc" ? (
                  <ArrowUpIcon className="w-4 h-4" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4" />
                ))}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;
