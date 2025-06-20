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
import toast from "react-hot-toast";
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
import { getSignedExamFiles, deleteExam } from "@/actions/exams-action";
import { useAction } from "@/hooks/use-action";

export default function ExamView({
  exams,
  totalPage,
  page,
  query,
  department,
  userId,
  examsRejectedByMe = [],
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fileUrls, setFileUrls] = useState({});
  const [openDialogId, setOpenDialogId] = useState(null);

  const { action: deleteAction, isPending } = useAction();

  const getStatusText = (status) => {
    switch (status) {
      case "DANG_CHO":
        return "ĐANG CHỜ";
      default:
        return status;
    }
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

  const handleDeleteExam = async (examId) => {
    deleteAction(
      { fn: deleteExam },
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

  const canDelete = (exam) => userId === exam.createdById;

  const renderFileLinks = (examId) => (
    <div className="flex flex-col gap-2">
      <a
        href={fileUrls[examId]?.answerFile || "#"}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          if (!fileUrls[examId]?.answerFile) {
            e.preventDefault();
            handleFetchFile(examId);
          }
        }}
        className="text-md block border border-gray-300 rounded-md px-3 py-2 text-blue-600 font-medium hover:bg-gray-200 transition max-w-xs dark:border-gray-600 dark:text-blue-400 dark:hover:bg-gray-700"
      >
        📄 File đáp án
      </a>
      <a
        href={fileUrls[examId]?.questionFile || "#"}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          if (!fileUrls[examId]?.questionFile) {
            e.preventDefault();
            handleFetchFile(examId);
          }
        }}
        className="text-md block border border-gray-300 rounded-md px-3 py-2 text-blue-600 font-medium hover:bg-gray-200 transition max-w-xs dark:border-gray-600 dark:text-blue-400 dark:hover:bg-gray-700"
      >
        📄 File đề thi
      </a>
    </div>
  );

  const renderDeleteDialog = (exam) =>
    openDialogId === exam.id && (
      <AlertDialog open={true} onOpenChange={setOpenDialogId}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá</AlertDialogTitle>
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
    );

  return (
    <div className="mb-10">
      <Toaster position="top-right" />

      {/* Đang chờ duyệt */}
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
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-gray-500 dark:text-gray-400">
                Không có dữ liệu
              </TableCell>
            </TableRow>
          ) : (
            exams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell>
                  <span className="px-3 text-lg font-bold dark:text-gray-100">{exam.title}</span>
                </TableCell>
                <TableCell className="dark:text-gray-300">
                  {exam.createdBy?.fullName || "Không xác định"}
                </TableCell>
                <TableCell>{renderFileLinks(exam.id)}</TableCell>
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
                  {renderDeleteDialog(exam)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="py-4">
        <NavPagination totalPage={totalPage} currentPage={page} onPageChange={handlePageChange} />
      </div>

      {/* Đề bị từ chối */}
      {examsRejectedByMe.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
            Đề thi bị từ chối
          </h2>
          <Table className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 bg-gray-100 border-gray-200">
            <TableHeader>
              <TableRow>
                <TableHead>Tên đề thi</TableHead>
                <TableHead>Người tạo</TableHead>
                <TableHead>Tệp đính kèm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Ngày cập nhật</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {examsRejectedByMe.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>
                    <span className="px-3 text-lg font-bold dark:text-gray-100">{exam.title}</span>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">
                    {exam.createdBy?.fullName || "Không xác định"}
                  </TableCell>
                  <TableCell>{renderFileLinks(exam.id)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="destructive"
                      className="text-md font-semibold bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200 cursor-default"
                    >
                      TỪ CHỐI
                    </Badge>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">
                    {new Date(exam.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="dark:text-gray-300">
                    {new Date(exam.updatedAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="dark:text-gray-300">
                    {exam.note || "-"}
                  </TableCell>
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
                    {renderDeleteDialog(exam)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
