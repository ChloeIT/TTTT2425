"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { getExams } from "@/actions/sign-action";

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
import { NavPagination } from "@/components/nav-pagination";

// import SearchBar from "../../../_components/search-bar";
import { SearchBar } from "@/components/search-bar";
import FilterPanel from "../../../_components/filter-department";
import FilterStatus from "../../../_components/filter-status";
import Exam from "./exam";
import ExamAnswer from "./exam-answer";
import ApproveButton from "./approve-button";
import RejectButton from "./reject-button";

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

const ExamList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const query = searchParams.get("query") || "";
  const status = searchParams.get("status");
  const department = searchParams.get("department") || "";
  const month = searchParams.get("month") || "";
  const year = searchParams.get("year") || "";

  const [selectedMonth, setSelectedMonth] = useState(month);
  const [selectedYear, setSelectedYear] = useState(year);
  const [exams, setExams] = useState([]);
  const [totalPage, setTotalPage] = useState(1);

  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [pendingApproveExam, setPendingApproveExam] = useState(null);
  const [pendingRejectExam, setPendingRejectExam] = useState(null);
  
  const refetchExams = async () => {
    const { data, totalPage } = await getExams({
      page,
      query,
      status: status || undefined,
      department,
      month,
      year,
    });
    setExams(data);
    setTotalPage(totalPage);
  };
  useEffect(() => {
    const fetchData = async () => {
      const { data, totalPage } = await getExams({
        page,
        query,
        status: status || undefined,
        department,
        month,
        year,
      });
      setExams(data);
      setTotalPage(totalPage);
    };
    fetchData();
    refetchExams();
  }, [page, query, status, department, month, year]);

  return (
    <>
      {/* Bộ lọc */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex justify-between gap-4">
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

          <FilterPanel
            selectedDepartment={department}
            setSelectedDepartment={(val) => {
              const params = new URLSearchParams(window.location.search);
              val ? params.set("department", val) : params.delete("department");
              params.set("page", "1");
              router.push(`?${params.toString()}`);
            }}
            selectedMonth={selectedMonth}
            setSelectedMonth={(val) => {
              setSelectedMonth(val);
              const params = new URLSearchParams(window.location.search);
              val ? params.set("month", val) : params.delete("month");
              params.set("page", "1");
              router.push(`?${params.toString()}`);
            }}
            selectedYear={selectedYear}
            setSelectedYear={(val) => {
              setSelectedYear(val);
              const params = new URLSearchParams(window.location.search);
              val ? params.set("year", val) : params.delete("year");
              params.set("page", "1");
              router.push(`?${params.toString()}`);
            }}
          />
        </div>

        <div className="mt-1">
          <FilterStatus />
        </div>
      </div>

      {/* Bảng đề thi */}
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 dark:bg-gray-800">
            <TableHead className="text-center">Tên đề thi</TableHead>
            <TableHead className="text-center">Trạng thái</TableHead>
            <TableHead className="text-center">Người soạn đề</TableHead>
            <TableHead className="text-center">Phòng ban</TableHead>
            <TableHead className="text-center">Ngày gửi</TableHead>
            <TableHead className="text-center">Ngày xác nhận</TableHead>
            <TableHead className="text-center">Nội dung</TableHead>
            <TableHead className="text-center">Xác nhận</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {exams.map((exam) => (
            <TableRow key={exam.id}>
              <TableCell>{exam.title}</TableCell>
              <TableCell>
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
              <TableCell>{exam.createdBy?.fullName || "Không rõ"}</TableCell>
              <TableCell>
                {departmentMap[exam.createdBy?.department] || "Không rõ"}
              </TableCell>
              <TableCell>
                {exam.createdAt ? format(new Date(exam.createdAt), "dd/MM/yyyy HH:mm") : ""}
              </TableCell>
              <TableCell>
                {exam.updatedAt ? format(new Date(exam.updatedAt), "dd/MM/yyyy HH:mm") : ""}
              </TableCell>
              <TableCell>
                <div className="flex gap-2 justify-center">
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
              <TableCell>
                {exam.status === "DANG_CHO" ? (
                  <div className="flex gap-2 justify-center">
                    <ApproveButton
                      exam={exam}
                      pendingApproveExam={pendingApproveExam}
                      setPendingApproveExam={setPendingApproveExam}
                      onSuccess={refetchExams}
                    />
                    <RejectButton
                      exam={exam}
                      pendingRejectExam={pendingRejectExam}
                      setPendingRejectExam={setPendingRejectExam}
                      onSuccess={refetchExams}
                    />
                  </div>
                ) : (
                  <div className="h-10" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Exam exam={selectedExam} onClose={() => setSelectedExam(null)} />
      <ExamAnswer exam={selectedAnswer} onClose={() => setSelectedAnswer(null)} />

      {/* Phân trang */}

<div className="py-4">
  <NavPagination totalPage={totalPage} />
</div>

    </>
  );
};

export default ExamList;
