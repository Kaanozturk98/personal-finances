import React from "react";
import SelectInput from "../Inputs/SelectInput";
import { usePathname } from "next/navigation";
import { TableState } from ".";
import { FieldValues } from "react-hook-form";
import { Button } from "../ui/button";

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
    <div className="flex justify-between items-center mt-4">
      <div></div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="rounded-full"
        >
          «
        </Button>
        <span className="text-sm font-medium">Page {currentPage}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="rounded-full"
        >
          »
        </Button>
      </div>
      <div className="flex items-center">
        <SelectInput
          id="rowsPerPage"
          value={rowsPerPage.toString()}
          onChange={handleRowsPerPageChange}
          optionValues={rowsPerPageOptions}
          label="Rows per page"
          additionalClassName="min-w-[80px]"
          clearOption={false}
        />
      </div>
    </div>
  );
};

export default Pagination;
