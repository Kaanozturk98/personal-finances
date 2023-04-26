import React from "react";
import SelectInput from "../SelectInput";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  rowsPerPage: number;
  setRowsPerPage: (rowsPerPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  rowsPerPage,
  setRowsPerPage,
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleRowsPerPageChange = (value: string) => {
    const newRowsPerPage = parseInt(value, 10);
    setRowsPerPage(newRowsPerPage);
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
