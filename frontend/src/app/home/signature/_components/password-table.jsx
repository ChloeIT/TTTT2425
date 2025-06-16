"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff } from "lucide-react";
import Notify from "./notify";

// import SearchBar from "../../_components/search-bar";
import { SearchBar } from "@/components/search-bar";
import FilterPanel from "../../_components/filter-department";
import { NavPagination } from "@/components/nav-pagination";
import { format } from "date-fns";

const PasswordList = ({ passwords, totalPage }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get("query") || "";
  const department = searchParams.get("department") || "";
  const month = searchParams.get("month") || "";
  const year = searchParams.get("year") || "";

  const [notifyOpen, setNotifyOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const statusMap = {
    DA_DUYET: "Đã duyệt",
  };

  const departmentMap = {
    MAC_DINH: "Mặc định",
    LY_LUAN_CO_SO: "Lý luận cơ sở",
    NHA_NUOC_PHAP_LUAT: "Nhà nước và pháp luật",
    XAY_DUNG_DANG: "Xây dựng Đảng",
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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

  return (
    <>
      {/* Bộ lọc */}
      <div className="flex flex-wrap justify-between gap-4 mb-4">
        <div className="flex-1 min-w-[250px]">
          {/* <SearchBar
            searchQuery={query}
            setSearchQuery={(val) => {
              const params = new URLSearchParams(window.location.search);
              params.set("query", val);
              params.set("page", "1");
              router.push(`?${params.toString()}`);
            }}
          /> */}
           <SearchBar
                  placeholder="Tìm kiếm đề thi..."
                  isPagination
            />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <FilterPanel
            selectedDepartment={department}
            setSelectedDepartment={(val) => {
              const params = new URLSearchParams(window.location.search);
              val ? params.set("department", val) : params.delete("department");
              params.set("page", "1");
              router.push(`?${params.toString()}`);
            }}
            selectedMonth={month}
            setSelectedMonth={(val) => {
              const params = new URLSearchParams(window.location.search);
              val ? params.set("month", val) : params.delete("month");
              params.set("page", "1");
              router.push(`?${params.toString()}`);
            }}
            selectedYear={year}
            setSelectedYear={(val) => {
              const params = new URLSearchParams(window.location.search);
              val ? params.set("year", val) : params.delete("year");
              params.set("page", "1");
              router.push(`?${params.toString()}`);
            }}
          />
        </div>
      </div>

      {/* Bảng hiển thị mật khẩu */}
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 dark:bg-gray-800">
            <TableHead className="min-w-[90px]">Tên đề thi</TableHead>
            <TableHead className="min-w-[80px]">Mật khẩu</TableHead>
            <TableHead className="min-w-[90px]">Trạng thái</TableHead>
            <TableHead className="min-w-[90px]">Người tạo</TableHead>
            <TableHead className="min-w-[90px]">Phòng ban</TableHead>
            <TableHead className="min-w-[90px]">Ngày gửi</TableHead>
            <TableHead className="min-w-[100px]">Ngày duyệt</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {passwords.map((item) => (
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
                <Badge className="bg-green-500 text-white">
                  {statusMap[item.status] || item.status}
                </Badge>
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
                  className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition min-w-[110px]"
                >
                  Gửi thông báo
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Phân trang */}
      <div className="py-4">
        <NavPagination totalPage={totalPage} />
      </div>

      {/* Modal */}
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
