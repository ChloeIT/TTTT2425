"use client";

import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ClientPagination = ({ currentPage, totalPage, onPageChange }) => {
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPage, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  const renderPaginationItems = () => {
    const items = [];

    if (startPage > 1) {
      items.push(
        <PaginationItem key="start-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <Button
            size="icon"
            variant={currentPage === i ? "purple" : "blue"}
            onClick={() => onPageChange(i)}
          >
            {i}
          </Button>
        </PaginationItem>
      );
    }

    if (endPage < totalPage) {
      items.push(
        <PaginationItem key="end-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <Pagination className="py-4">
      <PaginationContent>
        <PaginationItem>
          <Button
            onClick={() => onPageChange(currentPage - 1)}
            aria-disabled={currentPage === 1}
            disabled={currentPage === 1}
            variant="blue"
            size="icon"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </PaginationItem>
        {renderPaginationItems()}
        <PaginationItem>
          <Button
            onClick={() => onPageChange(currentPage + 1)}
            aria-disabled={currentPage === totalPage}
            disabled={currentPage === totalPage}
            variant="blue"
            size="icon"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default ClientPagination;
