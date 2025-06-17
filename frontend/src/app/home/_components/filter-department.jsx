"use client";
import { useState } from "react";

const FilterPanel = ({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  selectedDepartment,
  setSelectedDepartment,
}) => {
  const months = [
    { value: "", label: "Tất cả tháng" },
    ...Array.from({ length: 12 }, (_, i) => ({
      value: (i + 1).toString().padStart(2, "0"),
      label: `Tháng ${i + 1}`,
    })),
  ];

  const currentYear = new Date().getFullYear();
  const years = [
    { value: "", label: "Tất cả năm" },
    ...Array.from({ length: 10 }, (_, i) => {
      const year = currentYear - i;
      return { value: year.toString(), label: `Năm ${year}` };
    }),
  ];

  const departments = [
    { value: "", label: "Tất cả phòng ban" },
    { value: "MAC_DINH", label: "Mặc định" },
    { value: "LY_LUAN_CO_SO", label: "Lý luận cơ sở" },
    { value: "NHA_NUOC_PHAP_LUAT", label: "Nhà nước và pháp luật" },
    { value: "XAY_DUNG_DANG", label: "Xây dựng Đảng" },
  ];

  return (
    <div className="flex flex-wrap md:flex-nowrap gap-4 mb-4">
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="border rounded px-2 py-1 w-full md:w-auto min-w-[120px]"
      >
        {months.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
        className="border rounded px-2 py-1 w-full md:w-auto min-w-[120px]"
      >
        {years.map((y) => (
          <option key={y.value} value={y.value}>
            {y.label}
          </option>
        ))}
      </select>

      <select
        value={selectedDepartment}
        onChange={(e) => setSelectedDepartment(e.target.value)}
        className="border rounded px-2 py-1 w-full md:w-auto min-w-[150px]"
      >
        {departments.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterPanel;
