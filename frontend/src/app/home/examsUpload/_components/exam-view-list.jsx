// frontend/src/app/home/examsUpload/_components/exam-view-list.jsx
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
import { Toaster } from "react-hot-toast";
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
import { useRouter, useSearchParams } from "next/navigation";
import { NavPagination } from "@/components/nav-pagination";
import { SearchBar } from "@/components/search-bar";
import { Input } from "@/components/ui/input";
import ClientPagination from "./pagination";

const LIMIT = 10;

export default function ExamView({
  exams,
  totalPage,
  page,
  query,
  userId,
  examsRejectedByMe = [],
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fileUrls, setFileUrls] = useState({});
  const [openDialogId, setOpenDialogId] = useState(null);
  const { action: deleteAction, isPending } = useAction();
  const [rejectedPage, setRejectedPage] = useState(1);
  const [rejectedQuery, setRejectedQuery] = useState("");

  // Filter rejected exams based on rejectedQuery
  const filteredRejectedExams = useMemo(() => {
    if (!rejectedQuery) return examsRejectedByMe;
    return examsRejectedByMe.filter((exam) =>
      exam.title.toLowerCase().includes(rejectedQuery.toLowerCase())
    );
  }, [examsRejectedByMe, rejectedQuery]);

  // Paginate rejected exams
  const totalPageRejected = Math.ceil(filteredRejectedExams.length / LIMIT);
  const paginatedRejectedExams = useMemo(() => {
    const start = (rejectedPage - 1) * LIMIT;
    return filteredRejectedExams.slice(start, start + LIMIT);
  }, [filteredRejectedExams, rejectedPage]);

  const handlePageChange = (newPage, isRejected = false) => {
    if (isRejected) {
      if (newPage >= 1 && newPage <= totalPageRejected) {
        setRejectedPage(newPage);
      }
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      if (query) params.set("query", query);
      router.push(`?${params.toString()}`);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "DANG_CHO":
        return "ĐANG CHỜ";
      default:
        return status;
    }
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

  const handleDeleteExam = async (examId, isRejected = false) => {
    deleteAction(
      { fn: deleteExam },
      examId,
      () => {
        toast.success("Đã xóa đề thi thành công");
        if (
          isRejected &&
          paginatedRejectedExams.length === 1 &&
          rejectedPage > 1
        ) {
          setRejectedPage(rejectedPage - 1);
        }
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

  const renderDeleteDialog = (exam, isRejected = false) =>
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
                handleDeleteExam(exam.id, isRejected);
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
      <div className="py-4 flex gap-2 lg:flex-row flex-col items-start lg:items-center">
        <SearchBar
          placeholder="Tìm kiếm đề thi theo tiêu đề..."
          searchParam="query"
        />
      </div>
      <div className="w-full overflow-x-auto">
        <Table className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 bg-gray-100 border-gray-200">
          <TableHeader>
            <TableRow className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 bg-gray-100 border-gray-200">
              <TableHead className="min-w-[165px] text-center">
                Tên đề thi
              </TableHead>
              <TableHead className="min-w-[130px] text-center">
                Người tạo
              </TableHead>
              <TableHead className="min-w-[135px] text-center">
                Tệp đính kèm
              </TableHead>
              <TableHead className="min-w-[110px] text-center">
                Trạng thái
              </TableHead>
              <TableHead className="min-w-[100px] text-center">
                Ngày tạo
              </TableHead>
              <TableHead className="min-w-[120px] text-center">
                Hành động
              </TableHead>
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
                <TableRow key={exam.id}>
                  <TableCell>
                    <span className="px-3 text-lg font-bold dark:text-gray-100">
                      {exam.title}
                    </span>
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
      </div>
      {exams.length === 0 && (
        <div className="my-4 text-muted-foreground flex justify-center">
          Không có dữ liệu...
        </div>
      )}
      {totalPage > 1 && (
        <div className="py-4">
          <NavPagination
            totalPage={totalPage}
            currentPage={page}
            onPageChange={(newPage) => handlePageChange(newPage)}
          />
        </div>
      )}

      {/* Đề bị từ chối */}
      {examsRejectedByMe.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
            Đề thi bị từ chối
          </h2>
          <div className="py-4 flex gap-2 lg:flex-row flex-col items-start lg:items-center">
            <Input
              placeholder="Tìm kiếm đề thi theo tiêu đề..."
              value={rejectedQuery}
              onChange={(e) => {
                setRejectedQuery(e.target.value);
                setRejectedPage(1);
              }}
              className="max-w-sm"
            />
          </div>
          <div className="w-full overflow-x-auto">
            <Table className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 bg-gray-100 border-gray-200">
              <TableHeader>
                <TableRow className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 bg-gray-100 border-gray-200">
                  <TableHead className="min-w-[165px] text-center">
                    Tên đề thi
                  </TableHead>
                  <TableHead className="min-w-[130px] text-center">
                    Người tạo
                  </TableHead>
                  <TableHead className="min-w-[135px] text-center">
                    Tệp đính kèm
                  </TableHead>
                  <TableHead className="min-w-[90px] text-center">
                    Trạng thái
                  </TableHead>
                  <TableHead className="min-w-[100px] text-center">
                    Ngày tạo
                  </TableHead>
                  <TableHead className="min-w-[100px] text-center">
                    Ngày cập nhật
                  </TableHead>
                  <TableHead className="min-w-[130px] text-center">
                    Ghi chú
                  </TableHead>
                  <TableHead className="min-w-[100px] text-center">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRejectedExams.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-4 text-gray-500 dark:text-gray-400"
                    >
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRejectedExams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell>
                        <span className="px-3 text-lg font-bold dark:text-gray-100">
                          {exam.title}
                        </span>
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
                        {renderDeleteDialog(exam, true)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {filteredRejectedExams.length === 0 && (
            <div className="my-4 text-muted-foreground flex justify-center">
              Không có dữ liệu...
            </div>
          )}
          {totalPageRejected > 1 && (
            <ClientPagination
              currentPage={rejectedPage}
              totalPage={totalPageRejected}
              onPageChange={(newPage) => handlePageChange(newPage, true)}
            />
          )}
        </div>
      )}
    </div>
  );
}
