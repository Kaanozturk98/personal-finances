interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
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

  return (
    <div className="btn-group flex justify-center space-x-2 mt-4">
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
  );
};

export default Pagination;
