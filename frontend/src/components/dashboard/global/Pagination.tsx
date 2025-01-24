"use client"
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { PaginationType } from "@/types";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import React from "react";

type Props<T> = {
  pagination: PaginationType<T>;
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange: (pageNumber: number) => void;
};

const CustomPagination = <T,>({
  pagination,
  currentPage = 1,
  itemsPerPage = 20,
  onPageChange,
}: Props<T>) => {
  const pages = [];
  for (let i = 1; i <= Math.ceil(pagination.count / itemsPerPage); i++) {
    pages.push(i);
  }

  const handleNextPage = () => {
    if (currentPage < pages.length) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem className={cn("cursor-pointer select-none")}>
          <Button
            aria-label="Go to previous page"
            disabled={!Boolean(pagination.previous)}
            onClick={handlePrevPage}
            variant={"ghost"}
            size={"default"}
            className={cn("gap-1 pl-2.5")}
          >
            <ChevronLeftIcon className="h-4 w-4" />
            <span>Previous</span>
          </Button>
        </PaginationItem>

        {pages.map((page, idx) => (
          <PaginationItem
            key={idx}
            className={cn(
              currentPage === page &&
                "bg-neutral-100 rounded-md dark:bg-primary-foreground",
              ""
            )}
          >
            <PaginationLink onClick={() => onPageChange(page)}>
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem className="cursor-pointer select-none">
          <Button
            aria-label="Go to next page"
            size="default"
            onClick={handleNextPage}
            disabled={!Boolean(pagination.next)}
            className={cn("gap-1 pr-2.5")}
            variant={"ghost"}
          >
            <span>Next</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default CustomPagination;