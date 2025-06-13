"use client";

import { useState } from "react";
import UploadExamButton from "./upload-exam-button";
import SearchBar from "../../_components/search-bar";
import FilterPanel from "../../_components/filter-department";
import { getFile } from "@/actions/archive-action";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ExamList = ({ exams, totalPage, currentPage, token }) => {
  const [pendingUploadExam, setPendingUploadExam] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  if (!exams || exams.length === 0) return <p>Không có đề thi nào.</p>;

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
    DANG_CHO: "Đang chờ",
    DA_DUYET: "Đã duyệt",
    TU_CHOI: "Đã từ chối",
    DA_THI: "Đã thi",
  };
  const departmentMap = {
    MAC_DINH: "Mặc định",
    LY_LUAN_CO_SO: "Lý luận cơ sở",
    NHA_NUOC_PHAP_LUAT: "Nhà nước và pháp luật",
    XAY_DUNG_DANG: "Xây dựng Đảng",
  };

  const filteredExams = exams
    .filter((exam) =>
      exam.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((exam) => {
      const date = new Date(exam.updatedAt);
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

  const handleDownload = async (examId, fileType) => {
    const result = await getFile(examId);
    console.log("getFile result:", result); // Log full result for debugging
    if (result.ok) {
      const { questionFile, answerFile, expiresAt } = result.data;
      const url = fileType === "question" ? questionFile : answerFile;
      console.log("Download URL:", url); // Confirm URL
      if (url) {
        try {
          const currentTime = Date.now();
          if (expiresAt && currentTime > expiresAt) {
            console.log("URL has expired");
            alert("Liên kết đã hết hạn. Vui lòng thử lại.");
            return;
          }

          // Use fetch to download as blob
          const response = await fetch(url, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`, // Use prop token
            },
          });
          if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = `${examId}_${
            fileType === "question" ? "question" : "answer"
          }.pdf`;
          link.rel = "noopener noreferrer";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
          console.log("Download successful for:", url);
        } catch (error) {
          console.error("Download failed:", error);
          alert("Không thể tải file. Vui lòng thử lại hoặc kiểm tra kết nối.");
        }
      } else {
        console.log("No URL available for download");
        alert("Không tìm thấy file để tải.");
      }
    } else {
      console.log("Download failed:", result.message);
      alert(`Lỗi: ${result.message}`);
    }
  };

  // Current time for 24-hour check
  const currentTime = new Date();

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

      <Table>
        <TableHeader>
          <TableRow className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 bg-gray-100 border-gray-200">
            <TableHead className="min-w-[150px] text-center">
              Tên đề thi
            </TableHead>
            <TableHead className="min-w-[130px] text-center">
              Họ tên người tạo
            </TableHead>
            <TableHead className="min-w-[130px] text-center">
              Phòng ban
            </TableHead>
            <TableHead className="min-w-[120px] text-center">
              Ngày thi
            </TableHead>
            <TableHead className="text-center">Tải về</TableHead>
            <TableHead className="text-center">Đăng tải</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="dark:border-gray-700">
          {filteredExams.map((exam) => {
            // Check if less than 24 hours have passed since updatedAt
            const updatedAt = new Date(exam.updatedAt);
            const timeDiffMs = currentTime - updatedAt;
            const isWithin24Hours = timeDiffMs < 24 * 60 * 60 * 1000; // 24 hours in milliseconds

            // Check if a document is already uploaded
            const hasDocument = !!exam.document;

            return (
              <TableRow key={exam.id} className="min-h-[100px]">
                <TableCell className="text-center py-4 font-bold text-blue-800 dark:text-gray-400">
                  {exam.title}
                </TableCell>
                <TableCell className="text-center text-black dark:text-gray-400">
                  {exam.createdBy?.fullName || "Không rõ"}
                </TableCell>
                <TableCell className="text-center text-black dark:text-gray-400">
                  {departmentMap[exam.createdBy?.department] ||
                    exam.createdBy?.department ||
                    "Không rõ"}
                </TableCell>
                <TableCell className="text-center text-black dark:text-gray-400">
                  {formatDate(exam.updatedAt)}
                </TableCell>
                <TableCell className="text-center text-black dark:text-gray-400">
                  <div className="flex flex-col justify-center items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleDownload(exam.id, "question")}
                    >
                      📄Tải đề thi
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDownload(exam.id, "answer")}
                    >
                      📝Tải đáp án
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-center text-gray-600 dark:text-gray-400">
                  <div className="flex flex-wrap justify-center items-center gap-2">
                    {exam.status === "DA_THI" ? (
                      <>
                        {isWithin24Hours ? (
                          <Button
                            variant="outline"
                            disabled
                            className="w-[90px]"
                          >
                            Chưa đủ 24h
                          </Button>
                        ) : hasDocument ? (
                          <Button
                            variant="outline"
                            disabled
                            className="w-[90px]"
                          >
                            Đã được đăng tải
                          </Button>
                        ) : (
                          <UploadExamButton
                            exam={exam}
                            pendingUploadExam={pendingUploadExam}
                            setPendingUploadExam={setPendingUploadExam}
                          />
                        )}
                        {/* Uncomment if needed */}
                        {/* <UploadAnswerButton
                          exam={exam}
                          pendingUploadAnswer={pendingUploadAnswer}
                          setPendingUploadAnswer={setPendingUploadAnswer}
                        /> */}
                      </>
                    ) : (
                      <div className="w-[90px] h-10" />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

export default ExamList;
