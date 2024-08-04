import React, { useCallback, useState } from "react";
import { FunnelIcon } from "@heroicons/react/24/outline";
import StringFilter from "./StringFilter";
import NumberFilter from "./NumberFilter";
import BooleanFilter from "./BooleanFilter";
import EnumFilter from "./EnumFilter";
import { IColumnObject } from "@component/types";
import DateFilter from "./DateFilter";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import debounce from "lodash/debounce";
import ReferenceFilter from "./ReferenceFilter";
import { TableState } from "..";
import { FieldValues } from "react-hook-form";
import { cn } from "@component/lib/utils";

interface FilterButtonProps<T extends FieldValues> {
  columns: IColumnObject<T>[];
  onFilterChange: (key: keyof T, value: any) => void;
  search: boolean;
  tableState: TableState<T>;
  createStateParams: (state: TableState<T>) => URLSearchParams;
}

const FilterButton = <T extends FieldValues>({
  columns,
  onFilterChange,
  search,
  tableState,
  createStateParams,
}: FilterButtonProps<T>) => {
  const { filter: filterState, searchText } = tableState;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [showFilter, setShowFilter] = useState(false);

  const handleFilterButtonClick = () => {
    setShowFilter(!showFilter);
  };

  const debouncedPush = useCallback(
    debounce(
      (path: string, searchString: string): void =>
        window.history.pushState({}, "", path + "?" + searchString),
      1000
    ),
    [router]
  );

  return (
    <div className="relative inline-block">
      <button
        className={cn(
          "px-3 py-2 h-10 rounded-md transition-colors duration-300",
          "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700",
          "text-gray-900 dark:text-gray-100"
        )}
        onClick={handleFilterButtonClick}
      >
        <FunnelIcon className="w-5 h-5 inline-block mr-1.5 align-middle" />
        <span className="align-middle">Filter</span>
      </button>
      {showFilter && (
        <div className="absolute z-50 mt-2 p-4 bg-white dark:bg-gray-900 shadow-2xl rounded-md border border-gray-200 dark:border-gray-700 flex flex-col space-y-4 w-64">
          {columns.map((column, index) => {
            if (!column.filter) return null; // Corrected to return null if no filter
            switch (column.type) {
              case "string":
                if (search) {
                  return (
                    <StringFilter
                      key={index}
                      column={column}
                      handleSearchChange={(text: string) => {
                        const toBeUpdatedSearchParams =
                          createStateParams(tableState);
                        toBeUpdatedSearchParams.set("searchText", text);
                        debouncedPush(
                          pathname as string,
                          toBeUpdatedSearchParams.toString()
                        );
                      }}
                      value={searchText}
                    />
                  );
                }
                break;
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
              case "reference":
                return (
                  <ReferenceFilter
                    key={index}
                    column={column}
                    onFilterChange={onFilterChange}
                    value={filterState[column.key as keyof T]}
                  />
                );
              default:
                return null;
            }
          })}
        </div>
      )}
    </div>
  );
};

export default FilterButton;
