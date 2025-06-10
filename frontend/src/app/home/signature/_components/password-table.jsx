"use client";

import React, { useState } from "react";
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

const PasswordList = ({ passwords }) => {
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  if (!passwords || passwords.length === 0) {
    return <p>Không có mật khẩu đề thi nào.</p>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
        !selectedDepartment || exam.createdBy?.department === selectedDepartment
    );

  return (
    <>
      {/* Thanh tìm kiếm + Bộ lọc tháng, năm, phòng ban */}
      <div className="flex flex-wrap justify-between gap-4 mb-4">
        <div className="flex-1 min-w-[250px]">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
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
      <Table>
        <TableHeader>
          <TableRow className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 bg-gray-100 border-gray-20">
            <TableHead>Tên đề thi</TableHead>
            <TableHead>Mật khẩu</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="min-w-[150px]">Họ tên người tạo đề</TableHead>
            <TableHead>Email người tạo đề</TableHead>
            <TableHead>Phòng ban</TableHead>
            <TableHead>Ngày gửi</TableHead>
            <TableHead>Ngày duyệt</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPassword.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.title}</TableCell>
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
              <TableCell>{item.createdBy?.email || "Không rõ"}</TableCell>
              <TableCell>
                {departmentMap[item.createdBy?.department] || "Không rõ"}
              </TableCell>
              <TableCell>{formatDate(item.createdAt)}</TableCell>
              <TableCell>{formatDate(item.updatedAt)}</TableCell>
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