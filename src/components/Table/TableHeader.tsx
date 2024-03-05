// TableHeader.tsx
import React from "react";
import clsx from "clsx";
import { IColumnObject } from "@component/types";
import CheckboxInput from "../Inputs/CheckboxInput";

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
          <th>
            <CheckboxInput
              id={`checkbox-all`}
              checked={isAllRowsChecked}
              indeterminate={isSomeRowsChecked}
              onChange={handleGeneralCheckboxChange}
              label=""
            />
          </th>
        )}
        {columnsToRender.map((column, index) => (
          <th
            key={index}
            className={clsx("text-left", column.sort ? "cursor-pointer" : "")}
            onClick={column.sort ? () => handleHeaderClick(column) : undefined}
          >
            <div className="inline-flex items-center w-full space-x-2">
              <span
                className={clsx(
                  column.sort && sortBy === column.key ? "underline" : ""
                )}
              >
                {column.label}
              </span>
              {column.sort && sortBy === column.key && (
                <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
              )}
            </div>
          </th>
        ))}
        {/* Additional header cells for update actions, etc. */}
      </tr>
    </thead>
  );
};

export default TableHeader;
