// frontend/src/app/home/examsUpload/_components/exam-table.jsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getSignedExamFiles, deleteExam } from "@/actions/exams-action";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAction } from "@/hooks/use-action";
import { Input } from "@/components/ui/input";
import ClientPagination from "./pagination";

const LIMIT = 3;

export default function ExamTable({ exams, title, userId }) {
  const [fileUrls, setFileUrls] = useState({});
  const [openDialogId, setOpenDialogId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");
  const isRejectedTable = title === "Danh sách đề thi bị từ chối";

  // Filter exams based on query
  const filteredExams = useMemo(() => {
    if (!query) return exams;
    return exams.filter((exam) =>
      exam.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [exams, query]);

  // Calculate pagination
  const totalPage = Math.ceil(filteredExams.length / LIMIT);
  const paginatedExams = useMemo(() => {
    const start = (currentPage - 1) * LIMIT;
    return filteredExams.slice(start, start + LIMIT);
  }, [filteredExams, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPage) {
      setCurrentPage(newPage);
    }
  };

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

  const handleFetchFile = (examId) => {
    if (!fileUrls[examId] || Date.now() > fileUrls[examId].expiresAt) {
      fetchSignedUrls(examId);
    }
  };

  const { action: deleteAction, isPending } = useAction();
  const handleDeleteExam = async (examId) => {
    try {
      await deleteExam(examId);
      toast.success("Đã xóa đề thi thành công");
      if (paginatedExams.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      toast.error(error.message || "Không thể xóa đề thi");
    }
  };

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

  const canDelete = (exam) => {
    return (
      title === "Danh sách đề thi đang chờ duyệt" ||
      (title === "Danh sách đề thi bị từ chối" && userId === exam.createdById)
    );
  };

  return (
    <div className="mb-10">
      <Toaster position="top-right" />
      <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
        {title}
      </h2>
      <div className="py-4 flex gap-2 lg:flex-row flex-col items-start lg:items-center">
        <Input
          placeholder="Tìm kiếm đề thi theo tiêu đề..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-sm"
        />
      </div>
      <Table className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 bg-gray-100 border-gray-200">
        <TableHeader>
          <TableRow className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 bg-gray-100 border-gray-200">
            <TableHead className="min-w-[165px] text-center">
              Tên đề thi
            </TableHead>
            <TableHead className="min-w-[135px] text-center">
              Nội dung
            </TableHead>
            <TableHead className="min-w-[90px] text-center">
              Trạng thái
            </TableHead>
            <TableHead className="min-w-[100px] text-center">
              Ngày tạo
            </TableHead>
            {isRejectedTable && (
              <TableHead className="min-w-[100px] text-center">
                Ngày cập nhật
              </TableHead>
            )}
            {isRejectedTable && (
              <TableHead className="min-w-[130px] text-center">
                Ghi chú
              </TableHead>
            )}
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedExams.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={isRejectedTable ? 7 : 5}
                className="text-center py-4 text-gray-500 dark:text-gray-400"
              >
                Không có dữ liệu
              </TableCell>
            </TableRow>
          )}
          {paginatedExams.map((exam) => (
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
                {format(new Date(exam.createdAt), "dd-MM-yyyy HH:mm")}
              </TableCell>
              {isRejectedTable && (
                <TableCell className="dark:text-gray-300">
                  {format(new Date(exam.updatedAt), "dd-MM-yyyy HH:mm")}
                </TableCell>
              )}
              {isRejectedTable && (
                <TableCell className="dark:text-gray-300">
                  {exam.note || "-"}
                </TableCell>
              )}
              <TableCell className="text-center">
                {canDelete(exam) && (
                  <Button
                    className="bg-red-100 text-red-700 hover:bg-red-200"
                    disabled={isPending}
                    onClick={() => setOpenDialogId(exam.id)}
                  >
                    Xoá đề thi
                  </Button>
                )}
                {openDialogId === exam.id && (
                  <AlertDialog open={true} onOpenChange={setOpenDialogId}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xoá</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc chắn muốn xóa đề thi "{exam.title}"?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          onClick={() => setOpenDialogId(null)}
                        >
                          Huỷ bỏ
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            handleDeleteExam(exam.id);
                            setOpenDialogId(null);
                          }}
                          disabled={isPending}
                        >
                          Xác nhận
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {filteredExams.length === 0 && (
        <div className="my-4 text-muted-foreground flex justify-center">
          Không có dữ liệu...
        </div>
      )}
      {totalPage > 1 && (
        <ClientPagination
          currentPage={currentPage}
          totalPage={totalPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
