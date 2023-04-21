import React, { useState } from "react";
import { FunnelIcon } from "@heroicons/react/24/outline";
import StringFilter from "./StringFilter";
import NumberFilter from "./NumberFilter";
import BooleanFilter from "./BooleanFilter";
import EnumFilter from "./EnumFilter";
import { IColumnObject } from "./types";
import DateFilter from "./DateFilter";

interface FilterButtonProps<T> {
  columns: IColumnObject<T>[];
  onFilterChange: (key: keyof T, value: any) => void;
  filterState: Partial<Record<keyof T, any>>; // Add this prop
}

const FilterButton = <T,>({
  columns,
  onFilterChange,
  filterState,
}: FilterButtonProps<T>) => {
  const [showFilter, setShowFilter] = useState(false);

  const handleFilterButtonClick = () => {
    setShowFilter(!showFilter);
  };

  return (
    <div className="relative inline-block">
      <button
        className="px-3 py-2 bg-base-300 hover:bg-base-200 text-base-content rounded-md"
        onClick={handleFilterButtonClick}
      >
        <FunnelIcon className="w-5 h-5 inline-block mr-1.5 align-middle" />
        <span className="align-middle">Filter</span>
      </button>
      {showFilter && (
        <div className="absolute z-10 mt-2 p-4 bg-base-200 shadow-2xl rounded border border-content flex flex-col space-y-4">
          {/* Map through columns and render different filter components */}
          {columns.map((column, index) => {
            if (!column.filter) return;
            switch (column.type) {
              case "string":
                return (
                  <StringFilter
                    key={index}
                    column={column}
                    onFilterChange={onFilterChange}
                    value={filterState[column.key as keyof T]}
                  />
                );
              case "number":
                return (
                  <NumberFilter
                    key={index}
                    column={column}
                    onFilterChange={onFilterChange}
                    value={filterState[column.key as keyof T]}
                  />
                );
              case "boolean":
                return (
                  <BooleanFilter
                    key={index}
                    column={column}
                    onFilterChange={onFilterChange}
                    value={filterState[column.key as keyof T]}
                  />
                );
              case "enum":
                return (
                  <EnumFilter
                    key={index}
                    column={column}
                    onFilterChange={onFilterChange}
                    value={filterState[column.key as keyof T]}
                  />
                );
              case "date":
                return (
                  <DateFilter
                    key={index}
                    column={column}
                    onFilterChange={onFilterChange}
                    value={filterState[column.key as keyof T]}
                  />
                );
            }
          })}
        </div>
      )}
    </div>
  );
};

export default FilterButton;
