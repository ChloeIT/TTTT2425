"use client";

import { Button } from "@/components/ui/button";

export const NavPagination = ({ totalPage, currentPage, onPageChange }) => {
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPage) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex justify-center items-center gap-1 py-4">
      {/* Nút "trái" */}
      <Button
        variant="ghost"
        size="icon"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className="w-10 h-10 rounded-full text-white bg-blue-400 hover:bg-blue-500 disabled:opacity-50"
      >
        &lt;
      </Button>

      {/* Các nút số trang */}
      {Array.from({ length: totalPage }, (_, index) => {
        const pageNumber = index + 1;
        const isActive = pageNumber === currentPage;

        return (
          <Button
            key={pageNumber}
            onClick={() => handlePageChange(pageNumber)}
            className={`w-10 h-10 rounded-full ${
              isActive
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                : "bg-blue-100 text-blue-900 hover:bg-blue-200"
            }`}
          >
            {pageNumber}
          </Button>
        );
      })}

      {/* Nút "phải" */}
      <Button
        variant="ghost"
        size="icon"
        disabled={currentPage === totalPage}
        onClick={() => handlePageChange(currentPage + 1)}
        className="w-10 h-10 rounded-full text-white bg-blue-400 hover:bg-blue-500 disabled:opacity-50"
      >
        &gt;
      </Button>
    </div>
  );
};
