"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Pagination from "./Pagination";
import { FieldValues } from "react-hook-form";
import { IColumnObject } from "@component/types";
import useHorizontalScroll from "@component/utils/use-horiontal-scroll";
import TableBody from "./TableBody";
import TableHeader from "./TableHeader";
import TableActions from "./TableActions";

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
}: TableProps<T>): React.ReactElement => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<T[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkedRows, setCheckedRows] = useState<Record<string, T>>({});
  const [fetchKey, setFetchKey] = useState<number>(0);

  const currentPage = Number(searchParams?.get("page")) || 1;
  const perPage = Number(searchParams?.get("limit")) || defaultItemsPerPage;
  const sortBy =
    (searchParams?.get("sortBy") as keyof T) || String(defaultSortBy);
  const sortOrder =
    (searchParams?.get("sortOrder") as "asc" | "desc") || defaultSortOrder;
  const searchText = searchParams?.get("searchText") || "";
  const filterString = searchParams?.get("filter");
  const filter =
    ((filterString && JSON.parse(filterString)) as Partial<
      Record<keyof T, any>
    >) || defaultFilter;

  const checkedRowsData = Object.values(checkedRows);
  const isAllRowsChecked =
    data.length > 0 && data.length === Object.keys(checkedRows).length;
  const isSomeRowsChecked =
    Object.keys(checkedRows).length > 0 && !isAllRowsChecked;

  const scrollRef = useRef<HTMLDivElement>(null);
  useHorizontalScroll(scrollRef);

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

    const toBeUpdatedSearchParams = !searchParams
      ? new URLSearchParams()
      : new URLSearchParams(searchParams.toString());

    if (column.key === sortBy) {
      toBeUpdatedSearchParams.set(
        "sortOrder",
        sortOrder === "asc" ? "desc" : "asc"
      );
    } else {
      toBeUpdatedSearchParams.set("sortBy", (column.key as string).toString());
      toBeUpdatedSearchParams.set("sortOrder", "asc");
    }

    router.push(`${pathname}?${toBeUpdatedSearchParams?.toString()}`);
  };

  const handleFilterChange = (key: keyof T, value: any) => {
    // Create a new instance of URLSearchParams based on the current searchParams
    const toBeUpdatedSearchParams = !searchParams
      ? new URLSearchParams()
      : new URLSearchParams(searchParams.toString());

    // Create a new filter object with the updated values
    const updatedFilter = { ...filter, [key]: value };

    // If the value is falsy and not explicitly false, delete the key from the updated filter
    if (!value && value !== false) {
      delete updatedFilter[key];
    }

    // Set the updated filter object in the search params
    toBeUpdatedSearchParams.set("filter", JSON.stringify(updatedFilter));

    // Navigate to the updated search params without re-triggering a fetch in the useEffect
    router.push(`${pathname}?${toBeUpdatedSearchParams.toString()}`);
  };

  useEffect(() => {
    setLoading(true);

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

    const urlString = `/api/${route}?${liveSearchParams?.toString()}`;

    fetch(urlString)
      .then((response) => response.json())
      .then(({ data, total }) => {
        setData(data);
        setTotalPages(total === 0 ? 1 : Math.ceil(total / perPage));
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pathname,
    perPage,
    route,
    router,
    searchParams,
    fetchKey,
    searchKey,
    search,
    currentPage,
    sortBy,
    sortOrder,
    searchText,
    defaultItemsPerPage,
    defaultSortBy,
    defaultSortOrder,
    /* filter, */
  ]);

  const formattedData = formatData(data);

  const columnsToRender = columns.filter((column) => !column.hidden);

  return (
    <div>
      <div className="flex-col space-y-4">
        <TableActions<T>
          columns={columns}
          filterState={filter}
          searchText={searchText}
          handleFilterChange={handleFilterChange}
          checkedRowsData={Object.values(checkedRows)}
          bulkUpdate={bulkUpdate}
          add={add}
          route={route}
          searchKey={searchKey}
          fetchKey={fetchKey}
          setFetchKey={setFetchKey}
          setCheckedRows={setCheckedRows}
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={perPage}
      />
    </div>
  );
};

export default Table;
