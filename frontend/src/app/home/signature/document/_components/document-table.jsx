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
import { getSignedExamFiles } from "@/actions/exams-action";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import FilterPanel from "../../../_components/filter-department";

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
  const [selectedDepartment, setSelectedDepartment] = useState(department);
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedMonth, setSelectedMonth] = useState(month);

  const fetchSignedUrls = async (examId) => {
    const result = await getSignedExamFiles(examId);
    if (result.ok) {
      setFileUrls((prev) => ({
        ...prev,
        [examId]: {
          questionFile: result.data.questionFile,
          answerFile: result.data.answerFile,
          expiresAt: result.data.expiresAt,
        },
      }));
    } else {
      toast.error(result.message || "Không thể tải file");
    }
  };

  const handleDownloadFile = async (url, title, type) => {
    if (!url) {
      toast.error("Không tìm thấy URL file.");
      return;
    }

    const safeTitle = title?.replace(/[^\w\s-]/g, "").replace(/\s+/g, "_") || "file";
    const fileName = `${safeTitle} - ${type === "question" ? "De thi" : "Dap an"}.pdf`;

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
    params.set("page", "1"); // reset trang về 1
    router.push(`?${params.toString()}`);
  };

  const handleDepartmentChange = (val) => {
    setSelectedDepartment(val);
    updateQueryParam("department", val);
  };

  const handleYearChange = (val) => {
    setSelectedYear(val);
    updateQueryParam("year", val);
  };

  const handleMonthChange = (val) => {
    setSelectedMonth(val);
    updateQueryParam("month", val);
  };

  return (
    <>
  
      {/* Bộ lọc */}
      <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
        <SearchBar placeholder="Tìm kiếm đề thi..." isPagination />

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


      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 dark:bg-gray-800">
          {/* <TableHead className="min-w-[120px]">Tên đề thi</TableHead> */}
            <TableHead className="min-w-[120px]">Tên đề thi</TableHead>
            <TableHead className="min-w-[100px]">Trạng thái</TableHead>
            <TableHead className="min-w-[130px]">Người tạo</TableHead>
            <TableHead className="min-w-[130px]">Phòng ban</TableHead>

            <TableHead className="min-w-[130px]">Ngày duyệt</TableHead>
            <TableHead className="min-w-[180px]">File đã ký</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.isArray(documents) && documents.length > 0 ? (
            documents.map((item) => {
              const fileData = fileUrls[item.id] || {};
              return (
                <TableRow key={item.id}>
                     {/* <TableCell>{item.id}</TableCell> */}
                  <TableCell>{item.title}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500 text-white">Đã ký</Badge>
                  </TableCell>
                  <TableCell>{item.createdBy?.fullName || "Không rõ"}</TableCell>
                  <TableCell>
                    {departmentMap[item.createdBy?.department] || "Không rõ"}
                  </TableCell>
                 
                  <TableCell>
                    {item.updatedAt
                      ? format(new Date(item.updatedAt), "dd/MM/yyyy HH:mm")
                      : ""}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="link"
                        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                        onClick={() =>
                          handleDownloadFile(item.questionFile, item.title, "question")
                        }
                      >
                        📄 File đề thi
                      </Button>
                      <Button
                        variant="link"
                        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                        onClick={() =>
                          handleDownloadFile(item.answerFile, item.title, "answer")
                        }
                      >
                        📄 File đáp án
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4">
                Không có dữ liệu
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Phân trang */}
      <div className="py-4">
        <NavPagination totalPage={totalPage} />
      </div>
    </>
  );
};

export default DocumentList;
