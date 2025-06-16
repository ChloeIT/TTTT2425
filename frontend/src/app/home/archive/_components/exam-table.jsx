"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
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
import { format } from "date-fns";
import { NavPagination } from "@/components/nav-pagination";

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

const ExamList = ({
  exams,
  totalPage,
  currentPage,
  token,
  searchQuery: initialSearchQuery,
  selectedDepartment: initialDepartment,
  selectedMonth: initialMonth,
  selectedYear: initialYear,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fileUrls, setFileUrls] = useState({});
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || "");
  const [selectedMonth, setSelectedMonth] = useState(initialMonth || "");
  const [selectedYear, setSelectedYear] = useState(initialYear || "");
  const [selectedDepartment, setSelectedDepartment] = useState(
    initialDepartment || ""
  );

  useEffect(() => {
    setSearchQuery(initialSearchQuery || "");
    setSelectedMonth(initialMonth || "");
    setSelectedYear(initialYear || "");
    setSelectedDepartment(initialDepartment || "");
  }, [initialSearchQuery, initialMonth, initialYear, initialDepartment]);

  const fetchSignedUrls = async (examId) => {
    const result = await getFile(examId);
    if (result.ok) {
      setFileUrls((prev) => ({
        ...prev,
        [examId]: {
          questionFile: result.data.questionFile,
          answerFile: result.data.answerFile,
          expiresAt: result.data.expiresAt,
        },
      }));
    }
  };

  const handleFetchFile = (examId) => {
    if (!fileUrls[examId] || Date.now() > fileUrls[examId].expiresAt) {
      fetchSignedUrls(examId);
    }
  };

  const handleDownload = async (examId, fileType) => {
    const result = await getFile(examId);
    if (result.ok) {
      const { questionFile, answerFile, expiresAt } = result.data;
      const url = fileType === "question" ? questionFile : answerFile;
      if (url) {
        try {
          const currentTime = Date.now();
          if (expiresAt && currentTime > expiresAt) {
            alert("Liên kết đã hết hạn. Vui lòng thử lại.");
            return;
          }
          const response = await fetch(url, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
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
        } catch (error) {
          alert("Không thể tải file. Vui lòng thử lại hoặc kiểm tra kết nối.");
        }
      } else {
        alert("Không tìm thấy file để tải.");
      }
    } else {
      alert(`Lỗi: ${result.message}`);
    }
  };

  const currentTime = new Date();
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

  const handleSearch = (val) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("query", val);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleFilterChange = (type, val) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set(type, val);
    else params.delete(type);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex justify-between gap-4">
          <div className="flex-1 min-w-[250px]">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={handleSearch}
            />
          </div>
          <FilterPanel
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={(val) =>
              handleFilterChange("department", val)
            }
            selectedMonth={selectedMonth}
            setSelectedMonth={(val) => handleFilterChange("month", val)}
            selectedYear={selectedYear}
            setSelectedYear={(val) => handleFilterChange("year", val)}
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
            const updatedAt = new Date(exam.updatedAt);
            const timeDiffMs = currentTime - updatedAt;
            const isWithin24Hours = timeDiffMs < 24 * 60 * 60 * 1000;
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
                  {format(exam.updatedAt, "dd-MM-yyyy hh:mm")}
                </TableCell>
                <TableCell className="text-center text-black dark:text-gray-400">
                  <div className="flex flex-col justify-center items-center gap-2">
                    {isWithin24Hours && (
                      <Button variant="outline" disabled className="w-[90px]">
                        Chưa đủ 24h
                      </Button>
                    )}
                    {!isWithin24Hours && (
                      <Button
                        variant="outline"
                        onClick={() => handleDownload(exam.id, "question")}
                      >
                        📄Tải đề thi
                      </Button>
                    )}
                    {!isWithin24Hours && (
                      <Button
                        variant="outline"
                        onClick={() => handleDownload(exam.id, "answer")}
                      >
                        📝Tải đáp án
                      </Button>
                    )}
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
                            className="w-[120px]"
                          >
                            Đã được đăng tải
                          </Button>
                        ) : (
                          <UploadExamButton
                            exam={exam}
                            pendingUploadExam={null} // Adjust as needed
                            setPendingUploadExam={() => {}} // Adjust as needed
                          />
                        )}
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

      <div className="py-4">
        <NavPagination
          totalPage={totalPage}
          currentPage={currentPage}
          onPageChange={(newPage) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", newPage);
            router.push(`?${params.toString()}`);
          }}
        />
      </div>
    </>
  );
};

export default ExamList;
