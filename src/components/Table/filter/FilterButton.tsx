import React, { useCallback } from "react";
import { FunnelIcon } from "@heroicons/react/24/outline";
import StringFilter from "./StringFilter";
import NumberFilter from "./NumberFilter";
import BooleanFilter from "./BooleanFilter";
import EnumFilter from "./EnumFilter";
import { IColumnObject } from "@/types";
import DateFilter from "./DateFilter";
import { usePathname } from "next/navigation";
import debounce from "lodash/debounce";
import ReferenceFilter from "./ReferenceFilter";
import { TableState } from "..";
import { FieldValues } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const pathname = usePathname();

  const debouncedPush = useCallback(
    debounce(
      (path: string, searchString: string): void =>
        window.history.pushState({}, "", path + "?" + searchString),
      1000
    ),
    []
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size={"sm"} variant={"outline"}>
          <FunnelIcon className="w-5 h-5 inline-block mr-1.5 align-middle" />
          <span className="align-middle">Filter</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-4 shadow-2xl rounded-md border flex flex-col space-y-4 w-auto"
        align="start"
      >
        {columns.map((column, index) => {
          if (!column.filter) return null;
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
      </PopoverContent>
    </Popover>
  );
};

export default FilterButton;
