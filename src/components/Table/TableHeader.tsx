import React from "react";
import { IColumnObject } from "@/types";
import CheckboxInput from "../Inputs/CheckboxInput";

import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { Button } from "../ui/button";

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
    <thead className="[&_tr]:border-b">
      <tr>
        {checkbox && (
          <th className="px-2 py-1">
            <CheckboxInput
              id={`checkbox-all`}
              checked={isSomeRowsChecked ? "indeterminate" : isAllRowsChecked}
              onChange={handleGeneralCheckboxChange}
            />
          </th>
        )}
        {columnsToRender.map((column, index) => (
          <th key={index} className="px-2 py-1">
            <div className={"text-left flex items-center"}>
              {column.sort ? (
                <Button
                  variant={"ghost"}
                  className="p-2 -ml-2"
                  onClick={() => handleHeaderClick(column)}
                >
                  <span className={"text-xs font-medium text-muted-foreground"}>
                    {column.label}
                  </span>
                  {sortBy === column.key &&
                    (sortOrder === "asc" ? (
                      <ArrowUpIcon className="w-3 h-3 ml-2" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3 ml-2" />
                    ))}
                </Button>
              ) : (
                <span
                  className={
                    "text-xs font-medium p-2 text-muted-foreground -ml-2"
                  }
                >
                  {column.label}
                </span>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;
