import React from "react";
import { IColumnObject } from "@component/types";
import CheckboxInput from "../Inputs/CheckboxInput";

import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { cn } from "@component/lib/utils";

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
    <thead className="bg-gray-100 dark:bg-gray-800">
      <tr className="h-12 border-b border-gray-200 dark:border-gray-700">
        {checkbox && (
          <th className="w-10 px-3 py-2 text-left">
            <CheckboxInput
              id={`checkbox-all`}
              checked={isAllRowsChecked}
              indeterminate={isSomeRowsChecked}
              onChange={handleGeneralCheckboxChange}
              label=""
              additionalClassName="text-primary focus:ring-primary focus:border-primary"
            />
          </th>
        )}
        {columnsToRender.map((column, index) => (
          <th
            key={index}
            className={cn(
              "px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300",
              column.sort && "cursor-pointer select-none",
              sortBy === column.key && "text-primary"
            )}
            onClick={column.sort ? () => handleHeaderClick(column) : undefined}
            aria-sort={
              sortBy === column.key
                ? sortOrder === "asc"
                  ? "ascending"
                  : "descending"
                : "none"
            }
            role={column.sort ? "button" : "columnheader"}
            tabIndex={column.sort ? 0 : undefined}
          >
            <div className="inline-flex items-center space-x-2">
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
        {/* Additional header cells for update actions, etc. */}
      </tr>
    </thead>
  );
};

export default TableHeader;
