"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getSignedExamFiles } from "@/actions/exams-action";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns";

export default function ExamTable({ exams, title }) {
  const [fileUrls, setFileUrls] = useState({});

  // Function to fetch signed URLs using the action
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

  // Fetch signed URLs when the user clicks to view files
  const handleFetchFile = (examId) => {
    if (!fileUrls[examId] || Date.now() > fileUrls[examId].expiresAt) {
      fetchSignedUrls(examId);
    }
  };

  // Refetch exams when a new upload succeeds
  useEffect(() => {
    const handleRefresh = () => {
      // Refetch logic could be implemented here if needed, but for now, rely on parent re-render
      console.log("Exam uploaded, consider refetching if needed");
    };
    window.addEventListener("examUploadSuccess", handleRefresh);
    return () => window.removeEventListener("examUploadSuccess", handleRefresh);
  }, []);

  const getStatusText = (status) => {
    switch (status) {
      case "DANG_CHO":
        return "ĐANG CHỜ";
      case "TU_CHOI":
        return "TỪ CHỐI";
      default:
        return status;
    }
  };

  return (
    <div className="mb-10">
      <Toaster position="top-right" />
      <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
        {title}
      </h2>
      <Table className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 bg-gray-100 border-gray-200">
        <TableHeader>
          <TableRow>
            <TableHead>Tên đề thi</TableHead>
            <TableHead>Nội dung</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tạo</TableHead>
            {title === "Danh sách đề thi bị từ chối" && (
              <TableHead className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 bg-gray-100 border-gray-200">
                Ngày cập nhật
              </TableHead>
            )}
            {title === "Danh sách đề thi bị từ chối" && (
              <TableHead className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 bg-gray-100 border-gray-200">
                Ghi chú
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={title === "Danh sách đề thi bị từ chối" ? 6 : 5}
                className="text-center py-4 text-gray-500 dark:text-gray-400"
              >
                Không có dữ liệu
              </TableCell>
            </TableRow>
          )}
          {exams.map((exam) => (
            <TableRow key={exam.id} className="dark:border-gray-700">
              <TableCell>
                <span className="px-3 text-lg font-bold dark:text-gray-100">
                  {exam.title}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-2">
                  <a
                    href={fileUrls[exam.id]?.answerFile || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!fileUrls[exam.id]?.answerFile) {
                        e.preventDefault();
                        handleFetchFile(exam.id);
                      }
                    }}
                    className="text-md block border border-gray-300 rounded-md px-3 py-2 text-blue-600 font-medium hover:bg-gray-200 transition max-w-xs dark:border-gray-600 dark:text-blue-400 dark:hover:bg-gray-700"
                  >
                    📄 File đáp án
                  </a>
                  <a
                    href={fileUrls[exam.id]?.questionFile || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!fileUrls[exam.id]?.questionFile) {
                        e.preventDefault();
                        handleFetchFile(exam.id);
                      }
                    }}
                    className="text-md block border border-gray-300 rounded-md px-3 py-2 text-blue-600 font-medium hover:bg-gray-200 transition max-w-xs dark:border-gray-600 dark:text-blue-400 dark:hover:bg-gray-700"
                  >
                    📄 File đề thi
                  </a>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    exam.status === "DANG_CHO"
                      ? "secondary"
                      : exam.status === "TU_CHOI"
                      ? "destructive"
                      : "default"
                  }
                  className="text-md font-semibold bg-gray-200 text-gray-800 hover:bg-transparent dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-transparent cursor-default"
                >
                  {getStatusText(exam.status)}
                </Badge>
              </TableCell>
              <TableCell className="dark:text-gray-300">
                {format(exam.createdAt, "dd-MM-yyyy hh:mm")}
              </TableCell>
              {title === "Danh sách đề thi bị từ chối" && (
                <TableCell className="dark:text-gray-300">
                  {format(exam.updatedAt, "dd-MM-yyyy hh:mm")}
                </TableCell>
              )}
              {title === "Danh sách đề thi bị từ chối" && (
                <TableCell className="dark:text-gray-300">
                  {exam.note || "-"}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
