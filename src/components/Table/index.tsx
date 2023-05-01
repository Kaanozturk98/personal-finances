"use client";
import React, { useEffect, useState } from "react";
import Pagination from "./Pagination";
import SkeletonRow from "./SkeletonRows";
import TruncatedText from "./TruncatedText";
import clsx from "clsx";
import FilterButton from "./FilterButton";
import useDeepCompareEffect from "use-deep-compare-effect";
import { DeepPartial, FieldValues } from "react-hook-form";
import { IColumnObject } from "@component/types";
import Form from "../Form";
import Modal from "../Modal";
import { capitalizeFirstLetter } from "@component/utils";
import {
  PencilSquareIcon,
  PlusIcon,
  SquaresPlusIcon,
} from "@heroicons/react/24/outline";
import CheckboxInput from "../CheckboxInput";
import MergeTransactions from "./actions/MergeTransactions";
import BulkUpdate from "./actions/BulkUpdate";
import AutoCategorizeTransactions from "./actions/AutoCategorizeTransactions";

interface TableProps<T extends FieldValues> {
  columns: IColumnObject<T>[];
  route: string;
  formatData: (data: T[]) => string[][];
  itemsPerPage?: number;
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
  itemsPerPage = 20,
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
  const [data, setData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(itemsPerPage);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<keyof T>(defaultSortBy as keyof T);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(defaultSortOrder);

  const [checkedRows, setCheckedRows] = useState<Record<string, T>>({});
  const checkedRowsData = Object.values(checkedRows);
  const isAllRowsChecked =
    data.length > 0 && data.length === Object.keys(checkedRows).length;
  const isSomeRowsChecked =
    Object.keys(checkedRows).length > 0 && !isAllRowsChecked;

  const [searchText, setSearchText] = useState<string>("");

  const [fetchKey, setFetchKey] = useState<number>(0);

  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

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

  const [filter, setFilter] =
    useState<Partial<Record<keyof T, any>>>(defaultFilter);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleHeaderClick = (column: IColumnObject<T>) => {
    if (!column.sort) return;

    if (column.key === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column.key as keyof T);
      setSortOrder("asc");
    }
  };

  const handleFilterChange = (key: keyof T, value: any) => {
    setFilter((prevFilter) => {
      const updatedFilter = { ...prevFilter };
      if (value || value === false) {
        updatedFilter[key] = value;
      } else {
        delete updatedFilter[key];
      }
      // Trigger data fetching here with the updated filter
      return updatedFilter;
    });
  };

  useDeepCompareEffect(() => {
    setFilter(defaultFilter);
  }, [defaultFilter]);

  useEffect(() => {
    setLoading(true);

    const searchParams = new URLSearchParams();
    searchParams.set("page", currentPage.toString());
    searchParams.set("limit", perPage.toString());
    searchParams.set("sortBy", String(sortBy));
    searchParams.set("sortOrder", sortOrder);
    if (filter && Object.keys(filter).length > 0) {
      searchParams.set("filter", JSON.stringify(filter));
    }
    if (search && searchKey && searchText.trim() !== "") {
      searchParams.set("searchKey", String(searchKey));
      searchParams.set("searchText", searchText);
    }

    const urlString = `/api/${route}?${searchParams.toString()}`;

    fetch(urlString)
      .then((response) => response.json())
      .then(({ data, total }) => {
        setData(data);
        setTotalPages(total === 0 ? 1 : Math.ceil(total / perPage));
        setLoading(false);
      });
  }, [
    currentPage,
    filter,
    perPage,
    route,
    searchKey,
    search,
    searchText,
    sortBy,
    sortOrder,
    fetchKey,
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
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4">
            {columns.some((column) => column.filter) && (
              <FilterButton<T>
                columns={columns}
                onFilterChange={handleFilterChange}
                filterState={filter}
                handleSearchChange={handleSearchChange}
                searchText={searchText}
              />
            )}
          </div>
          <div className="flex space-x-4 items-center">
            <span
              className="tooltip tooltip-bottom cursor-pointer"
              data-tip={`${checkedRowsData
                .map((row) => row[searchKey])
                .join("***|||***")}`}
            >
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-base-300 text-base-content">
                {checkedRowsData.length} row
                {checkedRowsData.length !== 1 ? "s" : ""} selected
              </span>
            </span>
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
                      "px-3 py-2 bg-base-300 hover:bg-base-200 text-base-content rounded-md h-10"
                    )}
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
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-compact table-zebra w-full">
            <thead className="relative z-0">
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
                {update && (
                  <th className={clsx("text-left w-32 sticky-column")}>
                    <div className="inline-flex items-center w-full space-x-2">
                      Actions
                    </div>
                  </th>
                )}
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
                      columns={
                        update
                          ? columnsToRender.length + (checkbox ? 2 : 1)
                          : columnsToRender.length + (checkbox ? 1 : 0)
                      }
                    />
                  ))
              ) : data.length > 0 ? (
                formattedData.map((row, rowIndex) => {
                  const defaultValues = {} as DeepPartial<T>;
                  if (update) {
                    columns.forEach((column, columnIndex) => {
                      (defaultValues as any)[column.key as keyof T] =
                        row[columnIndex];
                    });
                  }
                  const objectId = data[rowIndex].id;
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
                      {update && (
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
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={
                      update
                        ? columnsToRender.length + (checkbox ? 2 : 1)
                        : columnsToRender.length + (checkbox ? 1 : 0)
                    }
                    className="text-center py-4 text-base-content text-opacity-50"
                  >
                    🥺 No data available
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
        onPageChange={handlePageChange}
        rowsPerPage={perPage}
        setRowsPerPage={setPerPage}
      />
    </div>
  );
};

export default Table;
