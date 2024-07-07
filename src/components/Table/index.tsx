"use client";
import { usePathname, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Pagination from "./Pagination";
import { FieldValues } from "react-hook-form";
import { IColumnObject } from "@component/types";
import useHorizontalScroll from "@component/utils/use-horiontal-scroll";
import TableBody from "./TableBody";
import TableHeader from "./TableHeader";
import TableActions from "./TableActions";
import { usePushStateListener } from "@component/hooks/usePushStateListener";

interface TableProps<T extends FieldValues> {
  columns: IColumnObject<T>[];
  route: string;
  formatData: (data: T[]) => string[][];
  defaultItemsPerPage?: number;
  defaultSortBy?: keyof T;
  defaultSortOrder?: "asc" | "desc";
  defaultFilter?: Partial<Record<keyof T, any>>;
  add?: boolean;
  checkbox?: boolean;
  search?: boolean;
  searchKey?: keyof T;
  bulkUpdate?: boolean;
  formatPayload?: (data: Partial<T>) => Partial<T>;
}

export interface TableState<T extends FieldValues> {
  currentPage: number;
  perPage: number;
  sortBy: keyof T | string;
  sortOrder: "asc" | "desc";
  searchText: string;
  filter: Partial<Record<keyof T, any>>;
}

const Table = <T extends FieldValues>({
  columns,
  route,
  formatData,
  defaultItemsPerPage = 20,
  defaultSortBy = columns[0].key,
  defaultSortOrder = "asc",
  defaultFilter = {},
  add = false,
  checkbox = true,
  search = false,
  searchKey = "name",
  bulkUpdate = false,
  formatPayload = (data: Partial<T>) => data,
}: TableProps<T>): React.ReactElement => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<T[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkedRows, setCheckedRows] = useState<Record<string, T>>({});
  const [fetchKey, setFetchKey] = useState<number>(0);

  const [tableState, setTableState] = useState({
    currentPage: Number(searchParams?.get("page")) || 1,
    perPage: Number(searchParams?.get("limit")) || defaultItemsPerPage,
    sortBy: (searchParams?.get("sortBy") as keyof T) || String(defaultSortBy),
    sortOrder:
      (searchParams?.get("sortOrder") as "asc" | "desc") || defaultSortOrder,
    searchText: searchParams?.get("searchText") || "",
    filter:
      ((searchParams?.get("filter") &&
        JSON.parse(searchParams.get("filter") as string)) as Partial<
        Record<keyof T, any>
      >) || defaultFilter,
  });

  const { currentPage, perPage, sortBy, sortOrder, searchText, filter } =
    tableState;

  const checkedRowsData = Object.values(checkedRows);
  const isAllRowsChecked =
    data.length > 0 && data.length === Object.keys(checkedRows).length;
  const isSomeRowsChecked =
    Object.keys(checkedRows).length > 0 && !isAllRowsChecked;

  const scrollRef = useRef<HTMLDivElement>(null);
  useHorizontalScroll(scrollRef);

  const fetchData = () => {
    setLoading(true);

    console.log("fetchData", tableState);

    const { currentPage, perPage, sortBy, sortOrder, searchText, filter } =
      tableState;

    const liveSearchParams = new URLSearchParams();
    liveSearchParams.set("page", String(currentPage));
    liveSearchParams.set("limit", String(perPage));
    liveSearchParams.set("sortBy", String(sortBy));
    liveSearchParams.set("sortOrder", sortOrder);
    if (filter && Object.keys(filter).length > 0) {
      liveSearchParams.set("filter", JSON.stringify(filter));
    }
    if (search && searchKey && searchText.trim() !== "") {
      liveSearchParams.set("searchKey", String(searchKey));
      liveSearchParams.set("searchText", searchText);
    }

    const urlString = `/api/${route}?${liveSearchParams.toString()}`;

    fetch(urlString)
      .then((response) => response.json())
      .then(({ data, total }) => {
        setData(data);
        setTotalPages(total === 0 ? 1 : Math.ceil(total / perPage));
        setLoading(false);
      });
  };

  usePushStateListener((newUrl) => {
    const url = new URL(newUrl, window.location.origin);
    const params = url.searchParams;

    setTableState((prevState) => ({
      currentPage:
        Number(params.get("page")) ||
        (prevState.currentPage === 1 ? 1 : defaultItemsPerPage),
      perPage:
        Number(params.get("limit")) ||
        (prevState.perPage === defaultItemsPerPage
          ? defaultItemsPerPage
          : defaultItemsPerPage),
      sortBy:
        (params.get("sortBy") as keyof T) ||
        (prevState.sortBy === String(defaultSortBy)
          ? String(defaultSortBy)
          : prevState.sortBy),
      sortOrder:
        (params.get("sortOrder") as "asc" | "desc") ||
        (prevState.sortOrder === defaultSortOrder
          ? defaultSortOrder
          : prevState.sortOrder),
      searchText:
        params.get("searchText") ||
        (prevState.searchText === "" ? "" : prevState.searchText),
      filter: params.get("filter")
        ? (JSON.parse(params.get("filter") as string) as Partial<
            Record<keyof T, any>
          >)
        : prevState.filter === defaultFilter
        ? defaultFilter
        : prevState.filter,
    }));

    console.log("tableState", tableState);
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, tableState]);

  const createStateParams = (state: TableState<T>): URLSearchParams => {
    const params = new URLSearchParams();

    if (state.currentPage !== 1)
      params.set("currentPage", String(state.currentPage));
    if (state.perPage !== defaultItemsPerPage)
      params.set("perPage", String(state.perPage));
    if (state.sortBy !== String(defaultSortBy))
      params.set("sortBy", String(state.sortBy));
    if (state.sortOrder !== defaultSortOrder)
      params.set("sortOrder", state.sortOrder);
    if (state.searchText.trim() !== "")
      params.set("searchText", state.searchText);
    if (JSON.stringify(state.filter) !== JSON.stringify(defaultFilter))
      params.set("filter", JSON.stringify(state.filter));

    return params;
  };

  const handleCheckboxChange = (id: string, value: boolean) => {
    setCheckedRows((prevCheckedRows) => {
      const updatedCheckedRows = { ...prevCheckedRows };
      if (value) {
        const rowData = data.find((row) => row.id.toString() === id);
        if (rowData) {
          updatedCheckedRows[id] = rowData;
        } else console.log("no data found");
      } else {
        delete updatedCheckedRows[id];
      }
      return updatedCheckedRows;
    });
  };

  const handleGeneralCheckboxChange = () => {
    if (isAllRowsChecked) {
      setCheckedRows({});
    } else {
      const newCheckedRows: Record<string, T> = {};
      data.forEach((row) => {
        newCheckedRows[row.id] = row;
      });
      setCheckedRows(newCheckedRows);
    }
  };

  const handleHeaderClick = (column: IColumnObject<T>) => {
    if (!column.sort) return;

    const toBeUpdatedSearchParams = createStateParams(tableState);

    console.log(
      "toBeUpdatedSearchParams",
      toBeUpdatedSearchParams.get("sortBy")
    );

    if (column.key === sortBy) {
      toBeUpdatedSearchParams.set(
        "sortOrder",
        sortOrder === "asc" ? "desc" : "asc"
      );
    } else {
      toBeUpdatedSearchParams.set("sortBy", (column.key as string).toString());
      toBeUpdatedSearchParams.set("sortOrder", "asc");
    }

    window.history.pushState(
      {},
      "",
      pathname + "?" + toBeUpdatedSearchParams.toString()
    );
  };

  const handleFilterChange = (key: keyof T, value: any) => {
    // Create a new instance of URLSearchParams based on the current searchParams
    const toBeUpdatedSearchParams = createStateParams(tableState);

    // Create a new filter object with the updated values
    const updatedFilter = { ...filter, [key]: value };

    // If the value is falsy and not explicitly false, delete the key from the updated filter
    if (!value && value !== false) {
      delete updatedFilter[key];
    }

    // Set the updated filter object in the search params
    toBeUpdatedSearchParams.set("filter", JSON.stringify(updatedFilter));

    // Navigate to the updated search params without re-triggering a fetch in the useEffect
    window.history.pushState(
      {},
      "",
      pathname + "?" + toBeUpdatedSearchParams.toString()
    );
  };

  const formattedData = formatData(data);

  const columnsToRender = columns.filter((column) => !column.hidden);

  return (
    <div>
      <div className="flex-col space-y-4">
        <TableActions<T>
          columns={columns}
          handleFilterChange={handleFilterChange}
          checkedRowsData={checkedRowsData}
          bulkUpdate={bulkUpdate}
          add={add}
          route={route}
          searchKey={searchKey}
          fetchKey={fetchKey}
          setFetchKey={setFetchKey}
          setCheckedRows={setCheckedRows}
          tableState={tableState}
          createStateParams={createStateParams}
          formatPayload={formatPayload}
        />

        <div className="overflow-x-auto" ref={scrollRef}>
          <table className="table table-compact table-zebra w-full">
            <TableHeader
              columnsToRender={columnsToRender}
              checkbox={checkbox}
              isAllRowsChecked={isAllRowsChecked}
              isSomeRowsChecked={isSomeRowsChecked}
              handleGeneralCheckboxChange={handleGeneralCheckboxChange}
              handleHeaderClick={handleHeaderClick}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
            <TableBody
              loading={loading}
              perPage={perPage}
              formattedData={formattedData}
              columnsToRender={columnsToRender}
              checkbox={checkbox}
              checkedRows={checkedRows}
              handleCheckboxChange={handleCheckboxChange}
            />
          </table>
        </div>
      </div>

      <Pagination<T>
        totalPages={totalPages}
        tableState={tableState}
        createStateParams={createStateParams}
      />
    </div>
  );
};

export default Table;
