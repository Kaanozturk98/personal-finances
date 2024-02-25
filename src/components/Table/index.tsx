"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Pagination from "./Pagination";
import SkeletonRow from "./SkeletonRows";
import TruncatedText from "./TruncatedText";
import clsx from "clsx";
import FilterButton from "./FilterButton";
/* import useDeepCompareEffect from "use-deep-compare-effect"; */
import { DeepPartial, FieldValues } from "react-hook-form";
import { IColumnObject } from "@component/types";
import Form from "../Form";
import Modal from "../Modal";
import { capitalizeFirstLetter } from "@component/utils";
import { PlusIcon, SquaresPlusIcon } from "@heroicons/react/24/outline";
import CheckboxInput from "../CheckboxInput";
import MergeTransactions from "./actions/MergeTransactions";
import BulkUpdate from "./actions/BulkUpdate";
import AutoCategorizeTransactions from "./actions/AutoCategorizeTransactions";
import useHorizontalScroll from "@component/utils/use-horiontal-scroll";

interface TableProps<T extends FieldValues> {
  columns: IColumnObject<T>[];
  route: string;
  formatData: (data: T[]) => string[][];
  defaultItemsPerPage?: number;
  defaultSortBy?: keyof T;
  defaultSortOrder?: "asc" | "desc";
  defaultFilter?: Partial<Record<keyof T, any>>;
  add?: boolean;
  update?: boolean;
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
  update = false,
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
        const rowData = data.find((row) => row.id === id);
        if (rowData) {
          updatedCheckedRows[id] = rowData;
        }
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

  /* useDeepCompareEffect(() => {
    const initialSearchParams = new URLSearchParams();

    if (defaultFilter && Object.keys(defaultFilter).length > 0) {
      initialSearchParams.set("filter", JSON.stringify(defaultFilter));
      router.push(`${pathname}?${initialSearchParams?.toString()}`);
    }
  }, [defaultFilter]); */

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

  const isNotAtleastTwoChecked = checkedRowsData.length < 2;

  const isParentTransactionChecked =
    route === "transactions"
      ? !!Object.values(checkedRowsData).filter(
          (row) => row.subTransactions.length
        ).length
      : false;

  const mergeBtnDisabled = isNotAtleastTwoChecked || isParentTransactionChecked;

  return (
    <div>
      <div className="flex-col space-y-4">
        <div className="flex justify-between items-center mb-4 sticky top-0 z-20 pt-2 pb-1.5 backdrop-blur-lg before:absolute before:inset-0 before:bg-gradient-to-b before:from-gray-600 before:to-transparent before:z-[-1]">
          <div className="flex space-x-4">
            {columns.some((column) => column.filter) && (
              <FilterButton<T>
                columns={columns}
                onFilterChange={handleFilterChange}
                filterState={filter}
                search
                searchText={searchText}
              />
            )}
          </div>

          <div className="flex space-x-4 items-center">
            <Modal
              title="Selected Transactions"
              trigger={
                <button
                  className={clsx(
                    "px-3 py-2 text-base-content rounded-md h-10 transition-all duration-300 shadow-sm",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-accent",
                    "disabled:btn-disabled",
                    checkedRowsData.length === 0
                      ? "hidden"
                      : "bg-transparent hover:bg-base-200"
                  )}
                  disabled={checkedRowsData.length === 0}
                  type="button"
                >
                  {checkedRowsData.length} selected
                </button>
              }
              disabled={checkedRowsData.length === 0}
            >
              <ul className="list-disc pl-5 space-y-1">
                {checkedRowsData.map((row) => (
                  <li key={row.id}>{row[searchKey]}</li>
                ))}
              </ul>
            </Modal>

            {bulkUpdate && (
              <BulkUpdate<T>
                columns={columns}
                checkedRowsData={checkedRowsData}
                route={`cud-${route}`}
                onSuccess={() => {
                  setFetchKey(fetchKey + 1);
                  setCheckedRows({});
                }}
              />
            )}
            {route === "transactions" && (
              <AutoCategorizeTransactions<T>
                checkedRowsData={checkedRowsData}
                onSuccess={() => {
                  setFetchKey(fetchKey + 1);
                  setCheckedRows({});
                }}
              />
            )}
            {route === "transactions" && (
              <Modal
                title={`Merge ${capitalizeFirstLetter(route)}`}
                disabled={mergeBtnDisabled}
                trigger={
                  <button
                    className={clsx(
                      "px-3 py-2 bg-base-300 hover:bg-base-200 text-base-content rounded-md h-10 transition-all duration-300",
                      "disabled:btn-disabled"
                    )}
                    disabled={mergeBtnDisabled}
                  >
                    <SquaresPlusIcon className="w-5 h-5 inline-block mr-1.5 align-middle" />
                    <span className="align-middle">Merge</span>
                  </button>
                }
              >
                <MergeTransactions
                  columns={columns as any}
                  checkedRowsData={checkedRowsData as any}
                />
              </Modal>
            )}
            {add && (
              <Modal
                title={`Add ${capitalizeFirstLetter(route)}`}
                trigger={
                  <button className="px-3 py-2 bg-base-300 hover:bg-base-200 text-base-content rounded-md h-10">
                    <PlusIcon className="w-5 h-5 inline-block mr-1.5 align-middle" />
                    <span className="align-middle">Add</span>
                  </button>
                }
              >
                <Form<T> route={`cud-${route}`} columns={columns} />
              </Modal>
            )}
            {
              // if delete is enabled, add a delete selected button here
            }
          </div>
        </div>

        <div className="overflow-x-auto" ref={scrollRef}>
          <table className="table table-compact table-zebra w-full">
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
                    className={clsx(
                      "text-left",
                      column.sort ? "cursor-pointer" : ""
                    )}
                    onClick={
                      column.sort ? () => handleHeaderClick(column) : undefined
                    }
                  >
                    <div className="inline-flex items-center w-full space-x-2">
                      <span
                        className={clsx(
                          column.sort && sortBy === column.key
                            ? "underline"
                            : ""
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
                {/* {update && (
                  <th className={clsx("text-left w-32 sticky-column")}>
                    <div className="inline-flex items-center w-full space-x-2">
                      Actions
                    </div>
                  </th>
                )} */}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Render skeleton rows here...
                Array(perPage)
                  .fill(null)
                  .map((_, index) => (
                    <SkeletonRow
                      key={index}
                      columns={columnsToRender.length + (checkbox ? 1 : 0)}
                    />
                  ))
              ) : formattedData.length > 0 ? (
                formattedData.map((row, rowIndex) => {
                  const defaultValues = {} as DeepPartial<T>;
                  if (update) {
                    columns.forEach((column, columnIndex) => {
                      (defaultValues as any)[column.key as keyof T] =
                        row[columnIndex];
                    });
                  }
                  const objectId = data[rowIndex]["id"];
                  return (
                    <tr key={rowIndex} className="h-12">
                      {checkbox && (
                        <td className="w-10">
                          <CheckboxInput
                            id={`checkbox-${rowIndex}`}
                            checked={!!checkedRows[objectId]}
                            onChange={(value) =>
                              handleCheckboxChange(objectId, value)
                            }
                            label=""
                          />
                        </td>
                      )}
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="py-2 px-3">
                          <TruncatedText text={cell} />
                        </td>
                      ))}
                      {/* {update && (
                        <td className="py-2 px-3 sticky-column">
                          <Modal
                            title={`Update ${capitalizeFirstLetter(route)}`}
                            trigger={
                              <button className="px-3 py-2 bg-base-300 hover:bg-base-200 text-base-content rounded-md">
                                <PencilSquareIcon className="w-5 h-5 inline-block mr-1.5 align-middle" />
                                <span className="align-middle">Update</span>
                              </button>
                            }
                          >
                            <Form<T>
                              route={`cud-${route}`}
                              columns={columns}
                              defaultValues={defaultValues}
                              onSuccess={() => setFetchKey(fetchKey + 1)}
                            />
                          </Modal>
                        </td>
                      )} */}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={columnsToRender.length + (checkbox ? 1 : 0)}
                    className="text-center py-4 text-base-content text-opacity-50"
                  >
                    Nothing to see here 🍃
                  </td>
                </tr>
              )}
            </tbody>
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
