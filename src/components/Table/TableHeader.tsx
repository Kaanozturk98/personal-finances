import React from "react";
import { IColumnObject } from "@/types";
import CheckboxInput from "../Inputs/CheckboxInput";

import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
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
    <thead>
      <tr>
        {checkbox && (
          <th className="p-2">
            <CheckboxInput
              id={`checkbox-all`}
              checked={isSomeRowsChecked ? "indeterminate" : isAllRowsChecked}
              onChange={handleGeneralCheckboxChange}
              label=""
            />
          </th>
        )}
        {columnsToRender.map((column, index) => (
          <th key={index}>
            <div className={cn("text-left text-sm font-medium")}>
              {column.sort ? (
                <Button
                  variant={"ghost"}
                  className="p-2"
                  onClick={() => handleHeaderClick(column)}
                >
                  <span>{column.label}</span>
                  {sortBy === column.key &&
                    (sortOrder === "asc" ? (
                      <ArrowUpIcon className="w-3 h-3 ml-2" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3 ml-2" />
                    ))}
                </Button>
              ) : (
                <span className="p-2">{column.label}</span>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;
