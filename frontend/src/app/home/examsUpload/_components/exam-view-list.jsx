"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "react-hot-toast";
import { NavPagination } from "@/components/nav-pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { getSignedExamFiles, deleteExam } from "@/actions/exams-action";
import toast from "react-hot-toast";
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

export default function ExamView({
  exams,
  totalPage,
  page,
  query,
  department,
  userId,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fileUrls, setFileUrls] = useState({});
  const [openDialogId, setOpenDialogId] = useState(null);

  const getStatusText = (status) => {
    switch (status) {
      case "DANG_CHO":
        return "ĐANG CHỜ";
      default:
        return status;
    }
  };

  const handleSearch = (val) => {
    const params = new URLSearchParams(window.location.search);
    params.set("query", val);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    if (query) params.set("query", query);
    router.push(`?${params.toString()}`);
  };

  const handleFetchFile = async (examId) => {
    if (!fileUrls[examId] || Date.now() > fileUrls[examId]?.expiresAt) {
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

  const canDelete = (exam) => {
    return userId === exam.createdById;
  };

  return (
    <div className="mb-10">
      <Toaster position="top-right" />
      <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-6">
        Danh sách đề thi đang chờ duyệt
      </h2>
      <Table className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 bg-gray-100 border-gray-200">
        <TableHeader>
          <TableRow>
            <TableHead>Tên đề thi</TableHead>
            <TableHead>Người tạo</TableHead>
            <TableHead>Tệp đính kèm</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tạo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-4 text-gray-500 dark:text-gray-400"
              >
                Không có dữ liệu
              </TableCell>
            </TableRow>
          ) : (
            exams.map((exam) => (
              <TableRow key={exam.id} className="dark:border-gray-700">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="px-3 text-lg font-bold dark:text-gray-100">
                      {exam.title}
                    </span>
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
                  </div>
                </TableCell>
                <TableCell className="dark:text-gray-300">
                  {exam.createdBy?.fullName || "Không xác định"}
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
                    variant="secondary"
                    className="text-md font-semibold bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 cursor-default"
                  >
                    {getStatusText(exam.status)}
                  </Badge>
                </TableCell>
                <TableCell className="dark:text-gray-300">
                  {new Date(exam.createdAt).toLocaleString()}
                </TableCell>
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
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="py-4">
        <NavPagination
          totalPage={totalPage}
          currentPage={page}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
