import React from "react";

const PaginatedData = ({ totalPages, currentPage, setCurrentPage }) => {
  const renderPagination = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

    return pages.map((page, index) =>
      page === "..." ? (
        <li key={index} className="page-item disabled">
          <span className="page-link">...</span>
        </li>
      ) : (
        <li
          key={page}
          className={`page-item ${currentPage === page ? "active" : ""}`}
        >
          <button className="page-link" onClick={() => setCurrentPage(page)}>
            {page}
          </button>
        </li>
      )
    );
  };

  return (
    <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 my-3">
      <button
        className="btn btn-outline-secondary"
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        style={
          currentPage === 1 ? {} : { background: "#505050", color: "white" }
        }
      >
        ⬅ Prev
      </button>

      <ul className="pagination mb-0">{renderPagination()}</ul>

      <button
        className="btn btn-outline-secondary"
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        style={
          currentPage === totalPages
            ? {}
            : { background: "#505050", color: "white" }
        }
      >
        Next ➡
      </button>
    </div>
  );
};

export default PaginatedData;
