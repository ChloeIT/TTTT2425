"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";

import { useSearchParams, usePathname, useRouter } from "next/navigation";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePagination } from "@/hooks/use-pagination";
import { Button } from "./ui/button";

const ITEMS_TO_DISPLAY = 5;
const PaginationArrow = ({ direction, onClick, isDisabled }) => {
  const isLeft = direction === "left";

  return (
    <Button
      onClick={onClick}
      aria-disabled={isDisabled}
      disabled={isDisabled}
      variant={"blue"}
      size={"icon"}
    >
      {isLeft ? (
        <ChevronLeft className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </Button>
  );
};
export const NavPagination = ({ totalPage }) => {
  const searchParams = useSearchParams();
  const currentPage = searchParams.get("page")
    ? Number(searchParams.get("page"))
    : 1;
  const router = useRouter();
  const pathname = usePathname();
  const { data: items } = usePagination(totalPage, currentPage);

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPage;
  const getPrevious = () => {
    const params = new URLSearchParams(searchParams);
    params.set("page", `${currentPage - 1}`);
    router.replace(`${pathname}?${params.toString()}`);
  };
  const getNext = () => {
    const params = new URLSearchParams(searchParams);
    params.set("page", `${currentPage + 1}`);
    router.replace(`${pathname}?${params.toString()}`);
  };
  const getPage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", `${page}`);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationArrow
            direction="left"
            isDisabled={!hasPrevious}
            onClick={getPrevious}
          />
        </PaginationItem>
        {items.length <= ITEMS_TO_DISPLAY &&
          items.map(({ page, active }) => {
            return (
              <PaginationItem key={page}>
                <Button
                  size={"icon"}
                  variant={active ? "purple" : "blue"}
                  onClick={() => getPage(page)}
                >
                  {page}
                </Button>
              </PaginationItem>
            );
          })}
        {items.length > ITEMS_TO_DISPLAY && (
          <>
            <PaginationItem>
              <Button
                size={"icon"}
                variant={items[0].active ? "purple" : "blue"}
                onClick={() => getPage(items[0].page)}
              >
                {items[0].page}
              </Button>
            </PaginationItem>
            {currentPage - 2 >= items[1].page && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            {items
              .slice(
                Math.max(currentPage - 2, 1),
                Math.min(currentPage + 1, items[items.length - 2].page)
              )
              .map(({ page, active }) => {
                return (
                  <PaginationItem key={page}>
                    <Button
                      size={"icon"}
                      variant={active ? "purple" : "blue"}
                      onClick={() => getPage(page)}
                    >
                      {page}
                    </Button>
                  </PaginationItem>
                );
              })}
            {currentPage + 2 < items[items.length - 1].page && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <Button
                size={"icon"}
                variant={items[items.length - 1].active ? "purple" : "blue"}
                onClick={() => getPage(items[items.length - 1].page)}
              >
                {items[items.length - 1].page}
              </Button>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationArrow
            direction="right"
            isDisabled={!hasNext}
            onClick={getNext}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
