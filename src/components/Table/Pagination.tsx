import React from "react";
import SelectInput from "../Inputs/SelectInput";
import { usePathname } from "next/navigation";
import { TableState } from ".";
import { FieldValues } from "react-hook-form";
import { Button } from "../ui/button";
import Modal from "../Modal";

interface PaginationProps<T extends FieldValues> {
  totalPages: number;
  tableState: TableState<T>;
  createStateParams: (state: TableState<T>) => URLSearchParams;
  checkedRowsData: T[];
  searchKey: keyof T;
}

const Pagination = <T extends FieldValues>({
  totalPages,
  tableState,
  createStateParams,
  checkedRowsData,
  searchKey,
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
    <div className="flex justify-between items-center">
      <Modal
        title="Selected Transactions"
        trigger={
          <Button
            size="xs"
            variant={checkedRowsData.length ? "outline" : "ghost"}
            disabled={checkedRowsData.length === 0}
            className="text-muted-foreground text-sm"
          >
            {checkedRowsData.length} row(s) selected
          </Button>
        }
        disabled={checkedRowsData.length === 0}
      >
        <ul className="list-disc pl-5 space-y-1">
          {checkedRowsData.map((row) => (
            <li key={row.id}>{row[searchKey]}</li>
          ))}
        </ul>
      </Modal>

      <div className="flex items-center space-x-8 text-muted-foreground">
        <SelectInput
          id="rowsPerPage"
          value={rowsPerPage.toString()}
          onChange={handleRowsPerPageChange}
          optionValues={rowsPerPageOptions}
          label="Rows per page"
          labelPosition="left"
          additionalClassName="min-w-[100px] h-8"
          clearOption={false}
        />

        <div className="flex items-center space-x-1">
          <span className="text-sm px-2">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            size="xs"
            variant={"outline"}
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            «
          </Button>

          <Button
            size="xs"
            variant={"outline"}
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            »
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
