"use client";
import { useDebounceCallback } from "usehooks-ts";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { useUpdateSearchParams } from "@/hooks/use-update-search-param";
import { Input } from "./ui/input";

export const SearchBar = ({
  placeholder,
  isPagination,
  className,
  inputClassName,
  pageCursor = "1",
}) => {
  const { updateSearchParams } = useUpdateSearchParams({
    query: undefined,
    page: undefined,
  });
  const handleSearch = useDebounceCallback((term) => {
    const updatedPage = isPagination ? pageCursor : undefined;
    updateSearchParams({
      page: updatedPage,
      query: term,
    });
  }, 300);
  return (
    <div className={cn("relative lg:w-[400px] w-full", className)}>
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className={cn("pl-8 h-10", inputClassName)}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
};
