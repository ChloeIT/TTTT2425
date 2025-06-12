"use client";

import { useState } from "react";
import ExamAnswer from "./exam-answer";
import Exam from "./exam";
import ApproveButton from "./approve-button";
import RejectButton from "./reject-button";
import SearchBar from "../../../_components/search-bar";
import FilterPanel from "../../../_components/filter-department";
import { format } from "date-fns";
import { useEffect } from "react";
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

const ExamList = ({ exams }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [filterStatus, setFilterStatus] = useState("DANG_CHO");
  const [pendingApproveExam, setPendingApproveExam] = useState(null);
  const [pendingRejectExam, setPendingRejectExam] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const itemsPerPage = 10;

  if (!exams || exams.length === 0) return <p>Không có đề thi nào.</p>;

  const statusMap = {
    DANG_CHO: "Đang chờ",
    DA_DUYET: "Đã duyệt",
    TU_CHOI: "Đã từ chối",
    DA_THI: "Đã thi"
  };

  const departmentMap = {
    MAC_DINH: "Mặc định",
    LY_LUAN_CO_SO: "Lý luận cơ sở",
    NHA_NUOC_PHAP_LUAT: "Nhà nước và pháp luật",
    XAY_DUNG_DANG: "Xây dựng Đảng",
  };

  // === Lọc dữ liệu trước ===
  const filteredExams = exams
    .filter((exam) =>
      filterStatus === "ALL" ? true : exam.status === filterStatus
    )
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
    useEffect(() => {
      setCurrentPage(1);
    }, [searchQuery, filterStatus, selectedMonth, selectedYear, selectedDepartment]);
  // === Phân trang trên dữ liệu đã lọc ===
  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentExams = filteredExams.slice(startIndex, startIndex + itemsPerPage);
    
  return (
    <>
      {/* Thanh tìm kiếm + Bộ lọc */}
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

      {/* Bộ lọc trạng thái */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "ALL", label: "Tất cả" },
          { key: "DANG_CHO", label: "Đang chờ" },
          { key: "DA_DUYET", label: "Đã duyệt" },
          { key: "TU_CHOI", label: "Đã từ chối" },
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant={filterStatus === key ? "default" : "outline"}
            onClick={() => {
              setFilterStatus(key);
              setCurrentPage(1); // Reset về trang 1 khi thay đổi lọc
            }}
          >
            {label}
          </Button>
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 bg-gray-100 border-gray-200">
            <TableHead className="min-w-[100px] text-center">Tên đề thi</TableHead>
            <TableHead className="min-w-[80px] text-center">Trạng thái</TableHead>
            <TableHead className="min-w-[130px] text-center">Người soạn đề</TableHead>
            {/* <TableHead className="text-center">Email người tạo</TableHead> */}
            <TableHead className="min-w-[130px] text-center">Phòng ban</TableHead>
            <TableHead className="text-center">Ngày gửi</TableHead>
            <TableHead className="min-w-[120px] text-center">Ngày xác nhận</TableHead>
            <TableHead className="text-center">Nội dung</TableHead>
            <TableHead className="text-center">Xác nhận</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="dark:border-gray-700">
          {currentExams.map((exam) => (
            <TableRow key={exam.id} className="min-h-[100px]">
              <TableCell className="text-left py-4 text-gray-500 dark:text-gray-400">{exam.title}</TableCell>
              <TableCell className="text-center text-gray-600 dark:text-gray-400">
                <Badge
                  className={{
                    DANG_CHO: "bg-yellow-500 text-white",
                    DA_DUYET: "bg-green-500 text-white",
                    TU_CHOI: "bg-red-500 text-white",
                  }[exam.status] || "bg-gray-400 text-white"}
                >
                  {statusMap[exam.status] || exam.status}
                </Badge>
              </TableCell>
              <TableCell className="text-center text-gray-600 dark:text-gray-400">
                {exam.createdBy?.fullName || "Không rõ"}
              </TableCell>
              {/* <TableCell className="text-center text-gray-600 dark:text-gray-400">
                {exam.createdBy?.email || "Không rõ"}
              </TableCell> */}
              <TableCell className="text-center text-gray-600 dark:text-gray-400">
                {departmentMap[exam.createdBy?.department] || exam.createdBy?.department || "Không rõ"}
              </TableCell>
              <TableCell className="text-center text-gray-600 dark:text-gray-400">
                {exam.createdAt ? format(new Date(exam.createdAt), "dd/MM/yyyy HH:mm") : ""}
              </TableCell>
              <TableCell className="text-center text-gray-600 dark:text-gray-400">
                {exam.updatedAt ? format(new Date(exam.updatedAt), "dd/MM/yyyy HH:mm") : ""}
              </TableCell>
              <TableCell className="text-center text-gray-600 dark:text-gray-400">
                <div className="flex flex-wrap justify-center items-center gap-2">
                  <Button
                    variant={selectedExam?.id === exam.id ? "default" : "outline"}
                    onClick={() => setSelectedExam(selectedExam?.id === exam.id ? null : exam)}
                  >
                    {selectedExam?.id === exam.id ? "Đóng đề thi" : "Đề thi"}
                  </Button>
                  <Button
                    variant={selectedAnswer?.id === exam.id ? "default" : "outline"}
                    onClick={() => setSelectedAnswer(selectedAnswer?.id === exam.id ? null : exam)}
                  >
                    {selectedAnswer?.id === exam.id ? "Đóng đáp án" : "Đáp án"}
                  </Button>
                </div>
              </TableCell>
              <TableCell className="text-center text-gray-600 dark:text-gray-400">
                <div className="flex flex-wrap justify-center items-center gap-2">
                  {exam.status === "DANG_CHO" ? (
                    <>
                      <ApproveButton
                        exam={exam}
                        pendingApproveExam={pendingApproveExam}
                        setPendingApproveExam={setPendingApproveExam}
                      />
                      <RejectButton
                        exam={exam}
                        pendingRejectExam={pendingRejectExam}
                        setPendingRejectExam={setPendingRejectExam}
                      />
                    </>
                  ) : (
                    <>
                      <div className="w-[90px] h-10" />
                      <div className="w-[90px] h-10" />
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal xem đề thi */}
      <Exam exam={selectedExam} onClose={() => setSelectedExam(null)} />
      {/* Modal xem đáp án */}
      <ExamAnswer exam={selectedAnswer} onClose={() => setSelectedAnswer(null)} />

      {/* Dieu huong phan trang*/}
      <div className="flex justify-end items-center mt-4 gap-2">
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Trang trước
        </Button>
       <span>
  {totalPages === 0 ? "Trang 0 / 0" : `Trang ${currentPage} / ${totalPages}`}
</span>

        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Trang sau
        </Button>
      </div>
    </>
  );
};

export default ExamList;