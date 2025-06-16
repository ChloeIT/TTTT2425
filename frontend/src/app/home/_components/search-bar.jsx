"use client";

import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  const [tempQuery, setTempQuery] = useState(searchQuery);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearchQuery(tempQuery); // Chỉ cập nhật sau 500ms không gõ nữa
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [tempQuery]);

  useEffect(() => {
    setTempQuery(searchQuery);
  }, [searchQuery]);

  return (
    <div className="mb-4">
      <Input
        type="text"
        placeholder="Tìm kiếm tên đề thi..."
        value={tempQuery}
        onChange={(e) => setTempQuery(e.target.value)}
        className="w-full max-w-sm"
        autoComplete="off"
      />
    </div>
  );
};

export default SearchBar;
