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

  // Inside your component
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        className="px-3 py-2 bg-base-300 hover:bg-base-200 text-base-content rounded-md h-10"
        onClick={handleFilterButtonClick}
      >
        <FunnelIcon className="w-5 h-5 inline-block mr-1.5 align-middle" />
        <span className="align-middle">Filter</span>
      </button>
      {showFilter && (
        <div className="absolute z-50 mt-2 p-4 bg-base-200 shadow-2xl rounded border border-content flex flex-col space-y-4">
          {/* Map through columns and render different filter components */}
          {columns.map((column, index) => {
            if (!column.filter) return;
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
            }
          })}
        </div>
      )}
    </div>
  );
};

export default FilterButton;
