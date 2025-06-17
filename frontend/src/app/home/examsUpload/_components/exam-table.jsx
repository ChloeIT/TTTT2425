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
import { getSignedExamFiles, deleteExam } from "@/actions/exams-action";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
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

export default function ExamTable({ exams, title, userId }) {
  const [fileUrls, setFileUrls] = useState({});
  const router = useRouter();
  const [openDialogId, setOpenDialogId] = useState(null);

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

  const { action: deleteAction, isPending } = useAction();
  const handleDeleteExam = async (examId) => {
    deleteAction(
      {
        fn: deleteExam,
      },
      examId,
      () => {
        toast.success("Đã xóa đề thi thành công");
        router.refresh();
      },
      (error) => {
        toast.error(error.message || "Không thể xóa đề thi");
      }
    );
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
                <div className="flex items-center gap-2">
                  {canDelete(exam) && (
                    <button
                      onClick={() => setOpenDialogId(exam.id)}
                      disabled={isPending}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                  )}
                  <span className="px-3 text-lg font-bold dark:text-gray-100">
                    {exam.title}
                  </span>
                </div>
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
              {openDialogId === exam.id && (
                <AlertDialog open={true} onOpenChange={setOpenDialogId}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận hành động</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa đề thi "{exam.title}"?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setOpenDialogId(null)}>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
