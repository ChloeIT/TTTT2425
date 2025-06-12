// components/SearchBar.jsx
"use client";

import { Input } from "@/components/ui/input";

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="mb-4">
      <Input
        type="text"
        placeholder="Tìm kiếm tên đề thi..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full max-w-sm"
        autoComplete="off"
      />
    </div>
  );
};

export default SearchBar;
