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
  RectangleGroupIcon,
} from "@heroicons/react/24/outline";
import CheckboxInput from "../CheckboxInput";
import MergeTransactions from "../MergeTransactions";

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
}: TableProps<T>): React.ReactElement => {
  const [data, setData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<keyof T>(defaultSortBy as keyof T);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(defaultSortOrder);
  const [checkedRows, setCheckedRows] = useState<Record<string, boolean>>({});
  const checkedRowsData = data.filter((_row, index) => checkedRows[index]);

  const handleCheckboxChange = (rowIndex: number, value: boolean) => {
    setCheckedRows((prevCheckedRows) => ({
      ...prevCheckedRows,
      [rowIndex]: value,
    }));
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
    searchParams.set("limit", itemsPerPage.toString());
    searchParams.set("sortBy", String(sortBy));
    searchParams.set("sortOrder", sortOrder);
    if (filter && Object.keys(filter).length > 0) {
      searchParams.set("filter", JSON.stringify(filter));
    }

    const urlString = `/api/${route}?${searchParams.toString()}`;

    fetch(urlString)
      .then((response) => response.json())
      .then(({ data, total }) => {
        setData(data);
        setTotalPages(total === 0 ? 1 : Math.ceil(total / itemsPerPage));
        setLoading(false);
      });
  }, [currentPage, filter, formatData, itemsPerPage, route, sortBy, sortOrder]);

  const formattedData = formatData(data);

  const columnsToRender = columns.filter((column) => !column.hidden);

  const isNotAtleastTwoChecked =
    Object.values(checkedRows).filter((checked) => checked).length < 2;

  const isParentTransactionChecked =
    route === "transactions"
      ? !!Object.values(checkedRowsData).filter(
          (row) => row.subTransactions.length
        ).length
      : false;

  console.log("isParentTransactionChecked", isParentTransactionChecked);
  const mergeBtnDisabled = isNotAtleastTwoChecked || isParentTransactionChecked;

  return (
    <div>
      <div className="flex-col space-y-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            {columns.some((column) => column.filter) && (
              <FilterButton<T>
                columns={columns}
                onFilterChange={handleFilterChange}
                filterState={filter}
              />
            )}
          </div>
          <div>
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
                    <RectangleGroupIcon className="w-5 h-5 inline-block mr-1.5 align-middle" />
                    <span className="align-middle">Merge</span>
                  </button>
                }
              >
                <MergeTransactions
                  data={data as any}
                  columns={columns as any}
                  checkedRows={checkedRows}
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

        <table className="table table-zebra w-full">
          <thead className="relative z-0">
            <tr>
              {checkbox && (
                <th>{/* Empty header for the checkbox column */}</th>
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
                        column.sort && sortBy === column.key ? "underline" : ""
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
                <th className={clsx("text-left w-32")}>
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
              Array(itemsPerPage)
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
                return (
                  <tr key={rowIndex} className="h-12">
                    {checkbox && (
                      <td className="w-10">
                        <CheckboxInput
                          id={`checkbox-${rowIndex}`}
                          checked={checkedRows[rowIndex] || false}
                          onChange={(value) =>
                            handleCheckboxChange(rowIndex, value)
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
                      <td className="py-2 px-3">
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Table;
