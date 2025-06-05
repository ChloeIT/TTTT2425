"use client";

import { useState } from "react";
import ExamAnswer from "./exam-answer";
import Exam from "./exam";
import ApproveButton from "./approve-button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";



const ExamList = ({ exams, totalPage, currentPage }) => {
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [pendingApproveExam, setPendingApproveExam] = useState(null);

  
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
    DA_THI: "Đã thi",
    TU_CHOI: "Từ chối",
  };

  const filteredExams =
    filterStatus === "ALL"
      ? exams
      : exams.filter((exam) => exam.status === filterStatus);

 
      
      
      

  return (
    <>
      {/* Bộ lọc trạng thái */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={filterStatus === "ALL" ? "default" : "outline"}
          onClick={() => setFilterStatus("ALL")}
        >
          Tất cả
        </Button>
        <Button
          variant={filterStatus === "DANG_CHO" ? "default" : "outline"}
          onClick={() => setFilterStatus("DANG_CHO")}
        >
          Đang chờ
        </Button>
        <Button
          variant={filterStatus === "DA_DUYET" ? "default" : "outline"}
          onClick={() => setFilterStatus("DA_DUYET")}
        >
          Đã duyệt
        </Button>
        <Button
          variant={filterStatus === "DA_THI" ? "default" : "outline"}
          onClick={() => setFilterStatus("DA_THI")}
        >
          Đã thi
        </Button>
        <Button
          variant={filterStatus === "TU_CHOI" ? "default" : "outline"}
          onClick={() => setFilterStatus("TU_CHOI")}
        >
          Từ chối
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Tiêu đề</TableHead>
            <TableHead className="text-center">Trạng thái</TableHead>
            <TableHead className="text-center">Người tạo</TableHead>
            <TableHead className="text-center">Ngày tạo</TableHead>
            <TableHead className="text-center">Ngày cập nhật</TableHead>
            <TableHead className="text-center"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredExams.map((exam) => (
            <TableRow key={exam.id}>
              <TableCell>{exam.id}</TableCell>
              <TableCell>{exam.title}</TableCell>
              <TableCell className="text-center">
                {statusMap[exam.status] || exam.status}
              </TableCell>
              <TableCell className="text-center">
                {exam.createdBy?.username || "Không rõ"}
              </TableCell>
              <TableCell className="text-center">{formatDate(exam.createdAt)}</TableCell>
              <TableCell className="text-center">{formatDate(exam.updatedAt)}</TableCell>
              <TableCell className="flex flex-col items-center gap-2">
  <div className="flex gap-2">
    <Button
      variant={selectedExam?.id === exam.id ? "secondary" : "default"}
      onClick={() =>
        setSelectedExam(selectedExam?.id === exam.id ? null : exam)
      }
    >
      {selectedExam?.id === exam.id ? "Đóng đề thi" : "Mở đề thi"}
    </Button>

    <Button
      variant={selectedAnswer?.id === exam.id ? "secondary" : "default"}
      onClick={() =>
        setSelectedAnswer(selectedAnswer?.id === exam.id ? null : exam)
      }
    >
      {selectedAnswer?.id === exam.id ? "Đóng đáp án" : "Mở đáp án"}
    </Button>

    {exam.status === "DANG_CHO" && (
  <ApproveButton
    exam={exam}
    pendingApproveExam={pendingApproveExam}
    setPendingApproveExam={setPendingApproveExam}
  />
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
    </>
  );
};

export default ExamList;
