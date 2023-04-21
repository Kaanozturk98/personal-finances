"use client";
import React, { useEffect, useState } from "react";
import Pagination from "./Pagination";
import SkeletonRow from "./SkeletonRows";
import TruncatedText from "./TruncatedText";
import clsx from "clsx";
import { IColumnObject } from "./types";

interface TableProps<T> {
  columns: IColumnObject<T>[];
  route: string;
  formatData: (data: T[]) => string[][];
  itemsPerPage?: number;
  defaultSortBy?: keyof T;
  defaultSortOrder?: "asc" | "desc";
}

const Table = <T,>({
  columns,
  route,
  formatData,
  itemsPerPage = 25,
  defaultSortBy = columns[0].key,
  defaultSortOrder = "asc",
}: TableProps<T>): React.ReactElement => {
  const [data, setData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<keyof T>(defaultSortBy as keyof T);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(defaultSortOrder);

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

  useEffect(() => {
    setLoading(true);
    fetch(
      `/api/${route}?page=${currentPage}&limit=${itemsPerPage}&sortBy=${String(
        sortBy
      )}&sortOrder=${sortOrder}`
    )
      .then((response) => response.json())
      .then(({ data, total }) => {
        setData(data);
        setTotalPages(Math.ceil(total / itemsPerPage));
        setLoading(false);
      });
  }, [currentPage, formatData, itemsPerPage, route, sortBy, sortOrder]);

  const formattedData = formatData(data);

  return (
    <>
      <table className="table table-zebra w-full">
        <thead className="relative z-0">
          <tr>
            {columns.map((column, index) => (
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
          </tr>
        </thead>
        <tbody>
          {loading || formattedData.length === 0
            ? // Render skeleton rows when loading
              Array(itemsPerPage)
                .fill(null)
                .map((_, index) => (
                  <SkeletonRow key={index} columns={columns.length} />
                ))
            : formattedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="h-12">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="p-2">
                      <TruncatedText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </>
  );
};

export default Table;
