"use client";
import React, { useEffect, useState } from "react";
import Pagination from "./Pagination";
import SkeletonRow from "./SkeletonRows";
import TruncatedText from "./TruncatedText";

interface TableProps<T> {
  headers: string[];
  route: string;
  formatData: (data: T[]) => string[][];
  itemsPerPage?: number;
}

const Table = <T,>({
  headers,
  route,
  formatData,
  itemsPerPage = 25,
}: TableProps<T>): React.ReactElement => {
  const [data, setData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    setLoading(true);
    fetch(`/api/${route}?page=${currentPage}&limit=${itemsPerPage}`)
      .then((response) => response.json())
      .then(({ data, total }) => {
        setData(data);
        setTotalPages(Math.ceil(total / itemsPerPage));
      });
    setLoading(false);
  }, [currentPage, formatData, itemsPerPage, route]);

  const formattedData = formatData(data);

  return (
    <>
      <table className="table table-zebra w-full">
        <thead className="relative z-0">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="text-left">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? // Render skeleton rows when loading
              Array(itemsPerPage)
                .fill(null)
                .map((_, index) => (
                  <SkeletonRow key={index} columns={headers.length} />
                ))
            : formattedData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className={`p-2`}>
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
