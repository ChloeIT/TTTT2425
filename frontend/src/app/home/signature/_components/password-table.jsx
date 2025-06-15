"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff } from "lucide-react";
import Notify from "./notify";

import SearchBar from "../../_components/search-bar";
import FilterPanel from "../../_components/filter-department";
import { format } from "date-fns";

const PasswordList = ({ passwords }) => {
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedMonth, selectedYear, selectedDepartment]);

  if (!passwords || passwords.length === 0) {
    return <p>Không có mật khẩu đề thi nào.</p>;
  }

  const statusMap = {
    DA_DUYET: "Đã duyệt",
  };

  const departmentMap = {
    MAC_DINH: "Mặc định",
    LY_LUAN_CO_SO: "Lý luận cơ sở",
    NHA_NUOC_PHAP_LUAT: "Nhà nước và pháp luật",
    XAY_DUNG_DANG: "Xây dựng Đảng",
  };

  const handleOpenNotify = (exam) => {
    setSelectedExam(exam);
    setNotifyOpen(true);
  };

  const handleCloseNotify = () => {
    setNotifyOpen(false);
    setSelectedExam(null);
  };

  const handleSendNotification = (message) => {
    alert(
      `Gửi thông báo cho đề thi "${selectedExam.title}" với nội dung:\n${message}`
    );
    handleCloseNotify();
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredPassword = passwords
    .filter((exam) =>
      exam.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((exam) => {
      const date = new Date(exam.createdAt);
      const monthMatches =
        !selectedMonth ||
        (date.getMonth() + 1).toString().padStart(2, "0") === selectedMonth;
      const yearMatches =
        !selectedYear || date.getFullYear().toString() === selectedYear;
      return monthMatches && yearMatches;
    })
    .filter(
      (exam) =>
        !selectedDepartment ||
        exam.createdBy?.department === selectedDepartment
    );

  const totalPages = Math.ceil(filteredPassword.length / itemsPerPage);
  const paginatedData = filteredPassword.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      {/* Thanh tìm kiếm + Bộ lọc tháng, năm, phòng ban */}
      <div className="flex flex-wrap justify-between gap-4 mb-4">
        <div className="flex-1 min-w-[250px]">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <FilterPanel
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={setSelectedDepartment}
          />
        </div>
      </div>

      {/* Bảng hiển thị mật khẩu */}
      <Table>
        <TableHeader>
          <TableRow className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 bg-gray-100 border-gray-20">
            <TableHead>Tên đề thi</TableHead>
            <TableHead>Mật khẩu</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="min-w-[150px]">Họ tên người tạo đề</TableHead>
            <TableHead>Phòng ban</TableHead>
            <TableHead>Ngày gửi</TableHead>
            <TableHead>Ngày duyệt</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="text-left">{item.title}</TableCell>
              <TableCell className="flex items-center gap-2">
                {item.decryptedPassword ? (
                  <>
                    <span>
                      {visiblePasswords[item.id]
                        ? item.decryptedPassword
                        : "••••••••"}
                    </span>
                    <button
                      onClick={() => togglePasswordVisibility(item.id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {visiblePasswords[item.id] ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                {item.status === "DA_DUYET" ? (
                  <Badge className="bg-green-500 text-white">
                    {statusMap[item.status]}
                  </Badge>
                ) : (
                  item.status
                )}
              </TableCell>
              <TableCell>{item.createdBy?.fullName || "Không rõ"}</TableCell>
              <TableCell>
                {departmentMap[item.createdBy?.department] || "Không rõ"}
              </TableCell>
              <TableCell>
                {item.createdAt
                  ? format(new Date(item.createdAt), "dd/MM/yyyy HH:mm")
                  : ""}
              </TableCell>
              <TableCell>
                {item.updatedAt
                  ? format(new Date(item.updatedAt), "dd/MM/yyyy HH:mm")
                  : ""}
              </TableCell>
              <TableCell>
                <button
                  onClick={() => handleOpenNotify(item)}
                  className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                >
                  Gửi thông báo
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Điều hướng phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center mt-4 gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Trang trước
          </button>
          <span>
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) =>
                prev < totalPages ? prev + 1 : prev
              )
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Trang sau
          </button>
        </div>
      )}

      {/* Modal gửi thông báo */}
      <Notify
        isOpen={notifyOpen}
        onClose={handleCloseNotify}
        onSend={handleSendNotification}
        exam={selectedExam}
      />
    </>
  );
};

export default PasswordList;
