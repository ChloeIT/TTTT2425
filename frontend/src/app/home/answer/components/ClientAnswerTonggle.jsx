"use client";

import { useState } from "react";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const ClientAnswerTonggle = ({ data }) => {
  const [loadingId, setLoadingId] = useState(null);
  const examWithFile = data.filter((exam) => exam.questionFile);

  const handleGetSignedFile = async (documentId, type) => {
    setLoadingId(`${documentId}-${type}`);
    try {
      const res = await fetch(
        `http://localhost:5000/documents/${documentId}/signed-files`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const result = await res.json();
      if (res.ok && result.data) {
        const fileUrl =
          type === "question"
            ? result.data.questionFile
            : result.data.answerFile;
        if (fileUrl) {
          window.open(fileUrl, "_blank");
        } else {
          alert(`Không tìm thấy file ${type === "question" ? "đề thi" : "đáp án"}.`);
        }
      } else {
        alert(result.message || "Không lấy được file.");
      }
    } catch (err) {
      console.error("Lỗi:", err);
      alert("Có lỗi xảy ra khi lấy file.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-y-4 py-4 h-full">
      <div className="px-6 py-4 bg-white dark:bg-gray-800 shadow rounded-md">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Danh sách Đề Thi
        </h1>
      </div>

      <Card>
        <CardContent>
          <Table className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Tên đề thi</TableHead>
                <TableHead className="text-center">Ngày ký</TableHead>
                <TableHead className="text-center">Xem Đề thi</TableHead>
                <TableHead className="text-center">Xem Đáp án</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {examWithFile.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-4 text-gray-500 dark:text-gray-400"
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                examWithFile.map((exam) => (
                  <TableRow
                    key={exam.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <TableCell className="text-center font-bold text-blue-800 dark:text-blue-300">
                      {exam.exam?.title || "Không có tên đề thi"}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-700 dark:text-gray-300">
                      {new Intl.DateTimeFormat("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Asia/Ho_Chi_Minh",
                      }).format(new Date(exam.createdAt))}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        className="w-full"
                        variant="default"
                        onClick={() => handleGetSignedFile(exam.id, "question")}
                        disabled={loadingId === `${exam.id}-question`}
                      >
                        {loadingId === `${exam.id}-question`
                          ? "Đang tải..."
                          : "Xem Đề thi"}
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        className="w-full"
                        variant="secondary"
                        onClick={() => handleGetSignedFile(exam.id, "answer")}
                        disabled={loadingId === `${exam.id}-answer`}
                      >
                        {loadingId === `${exam.id}-answer`
                          ? "Đang tải..."
                          : "Xem Đáp án"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientAnswerTonggle;
