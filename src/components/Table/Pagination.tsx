import React from "react";
import SelectInput from "../Inputs/SelectInput";
import { usePathname } from "next/navigation";
import { TableState } from ".";
import { FieldValues } from "react-hook-form";

interface PaginationProps<T extends FieldValues> {
  totalPages: number;
  tableState: TableState<T>;
  createStateParams: (state: TableState<T>) => URLSearchParams;
}

const Pagination = <T extends FieldValues>({
  totalPages,
  tableState,
  createStateParams,
}: PaginationProps<T>) => {
  const { currentPage, perPage: rowsPerPage } = tableState;

  const pathname = usePathname();

  const handlePrevious = () => {
    if (currentPage > 1) {
      const toBeUpdatedSearchParams = createStateParams(tableState);
      toBeUpdatedSearchParams.set("page", (currentPage - 1).toString());

      window.history.pushState(
        {},
        "",
        pathname + "?" + toBeUpdatedSearchParams.toString()
      );
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      const toBeUpdatedSearchParams = createStateParams(tableState);
      toBeUpdatedSearchParams.set("page", (currentPage + 1).toString());

      window.history.pushState(
        {},
        "",
        pathname + "?" + toBeUpdatedSearchParams.toString()
      );
    }
  };

  const handleRowsPerPageChange = (value: string) => {
    const newRowsPerPage = parseInt(value, 10);
    const toBeUpdatedSearchParams = createStateParams(tableState);
    toBeUpdatedSearchParams.set("limit", newRowsPerPage.toString());

    window.history.pushState(
      {},
      "",
      pathname + "?" + toBeUpdatedSearchParams.toString()
    );
  };

  const rowsPerPageOptions = ["10", "20", "30", "50", "100", "200"];

  return (
    <div className="flex justify-between mt-4">
      <div></div>
      <div className="btn-group flex items-center">
        <button
          className={`btn ${currentPage === 1 ? "btn-disabled" : "btn-base"}`}
          onClick={handlePrevious}
        >
          «
        </button>
        <button className="btn btn-base pointer-events-none">
          Page {currentPage}
        </button>
        <button
          className={`btn ${
            currentPage === totalPages ? "btn-disabled" : "btn-base"
          }`}
          onClick={handleNext}
        >
          »
        </button>
      </div>
      <div className="flex items-center">
        <SelectInput
          id="rowsPerPage"
          value={rowsPerPage.toString()}
          onChange={handleRowsPerPageChange}
          optionValues={rowsPerPageOptions}
          label=""
          additionalClassName="min-w-min"
          clearOption={false}
        />
      </div>
    </div>
  );
};

export default Pagination;
