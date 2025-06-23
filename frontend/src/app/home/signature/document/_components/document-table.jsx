"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/search-bar";
import { NavPagination } from "@/components/nav-pagination";
import { format } from "date-fns";
import { getSignedExamFiles } from "@/actions/secretary-password-action";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import FilterPanel from "../../../_components/filter-department";
import Notify from "./notify";
import { Eye, EyeOff } from "lucide-react";

const departmentMap = {
  MAC_DINH: "Mặc định",
  LY_LUAN_CO_SO: "Lý luận cơ sở",
  NHA_NUOC_PHAP_LUAT: "Nhà nước và pháp luật",
  XAY_DUNG_DANG: "Xây dựng Đảng",
};

const DocumentList = ({ documents, totalPage }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get("query") || "";
  const department = searchParams.get("department") || "";
  const year = searchParams.get("year") || "";
  const month = searchParams.get("month") || "";

  const [fileUrls, setFileUrls] = useState({});
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const fetchSignedUrls = async (examId) => {
    if (fileUrls[examId]) return fileUrls[examId];

    const result = await getSignedExamFiles(examId);
    if (result.ok) {
      const data = result.data;
      setFileUrls((prev) => ({
        ...prev,
        [examId]: {
          questionFile: data.questionFile,
          answerFile: data.answerFile,
        },
      }));
      return data;
    } else {
      toast.error(result.message || "Không thể lấy link file");
      return null;
    }
  };

  const removeVietnameseTones = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, (m) => (m === "đ" ? "d" : "D"))
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "_")
      .trim();
  };

  const handleDownloadFile = async (examId, title, type) => {
    const fileData = await fetchSignedUrls(examId);
    if (!fileData) return;

    const url = type === "question" ? fileData.questionFile : fileData.answerFile;
    const safeTitle = removeVietnameseTones(title || "file");
    const fileName = `${safeTitle} - ${type === "question" ? "De_thi" : "Dap_an"}.pdf`;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      toast.error("Tải file thất bại.");
      console.error(err);
    }
  };

  const updateQueryParam = (key, val) => {
    const params = new URLSearchParams(window.location.search);
    val ? params.set(key, val) : params.delete(key);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleOpenNotify = (exam) => {
    setSelectedExam(exam);
    setNotifyOpen(true);
  };

  const handleCloseNotify = () => {
    setNotifyOpen(false);
    setSelectedExam(null);
  };

  return (
    <>
      {/* Bộ lọc */}
      <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
        <SearchBar placeholder="Tìm kiếm đề thi..." isPagination />
        <div className="flex flex-wrap gap-2 items-center">
          <FilterPanel
            selectedDepartment={department}
            setSelectedDepartment={(val) => updateQueryParam("department", val)}
            selectedMonth={month}
            setSelectedMonth={(val) => updateQueryParam("month", val)}
            selectedYear={year}
            setSelectedYear={(val) => updateQueryParam("year", val)}
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 dark:bg-gray-800">
            <TableHead className="min-w-[120px]">Tên đề thi</TableHead>
            {/* <TableHead className="min-w-[160px]">Mật khẩu</TableHead> */}
            <TableHead className="min-w-[100px]">Trạng thái</TableHead>
            <TableHead className="min-w-[130px]">Người tạo</TableHead>
            <TableHead className="min-w-[130px]">Phòng ban</TableHead>
            <TableHead className="min-w-[130px]">Ngày duyệt</TableHead>
            <TableHead className="min-w-[180px]">File đã ký</TableHead>
            <TableHead className="min-w-[140px]"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.isArray(documents) && documents.length > 0 ? (
            documents.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.title}</TableCell>

                {/* <TableCell className="flex items-center justify-center gap-2 mt-5">
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
                    <span className="italic text-gray-400">Không có</span>
                  )}
                </TableCell> */}

                <TableCell>
                  <Badge className="bg-green-500 text-white">Đã ký</Badge>
                </TableCell>
                <TableCell>{item.createdBy?.fullName || "Không rõ"}</TableCell>
                <TableCell>
                  {departmentMap[item.createdBy?.department] || "Không rõ"}
                </TableCell>
                <TableCell>
                  {item.document?.createdAt
                    ? format(new Date(item.document.createdAt), "dd/MM/yyyy HH:mm")
                    : ""}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="link"
                      className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                      onClick={() => handleDownloadFile(item.id, item.title, "question")}
                    >
                      📄 File đề thi
                    </Button>
                    <Button
                      variant="link"
                      className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                      onClick={() => handleDownloadFile(item.id, item.title, "answer")}
                    >
                      📄 File đáp án
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleOpenNotify(item)}
                    className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition text-sm"
                  >
                    Gửi mật khẩu đáp án 
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                Không có dữ liệu
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Notify isOpen={notifyOpen} onClose={handleCloseNotify} exam={selectedExam} />
      <div className="py-4">
        <NavPagination totalPage={totalPage} />
      </div>
    </>
  );
};

export default DocumentList;
