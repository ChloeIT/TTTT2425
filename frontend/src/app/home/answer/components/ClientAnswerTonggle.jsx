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
import { format } from "date-fns";

const departmentMap = {
  MAC_DINH: "Mặc định",
  LY_LUAN_CO_SO: "Lý luận cơ sở",
  NHA_NUOC_PHAP_LUAT: "Nhà nước và pháp luật",
  XAY_DUNG_DANG: "Xây dựng Đảng",
};

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
 console.log("examWithFile", examWithFile) ;
  return ( 
    <div className="flex flex-col gap-y-4 py-4 h-full">
      <div className="px-6 py-4 bg-white dark:bg-gray-800 shadow rounded-md">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Danh sách Đề Thi và Đáp Án
        </h1>
      </div>

      <Card>
        <CardContent>
          <Table className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TableHeader>
              <TableRow className="bg-gray-100 dark:bg-gray-800 dark:text-gray-300">
                <TableHead className="text-center">Tên đề thi</TableHead>
                <TableHead className="text-center">Người tạo</TableHead>
                <TableHead className="text-center">Khoa</TableHead>
                <TableHead className="text-center">Ngày ký</TableHead>
                <TableHead className="text-center">Xem Đề thi</TableHead>
                <TableHead className="text-center">Xem Đáp án</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {examWithFile.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-4 text-gray-500 dark:text-gray-400"
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                examWithFile.map((document) => (
                  <TableRow
                    key={document?.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <TableCell className="text-center font-bold text-blue-800 dark:text-blue-300">
                      {document?.exam?.title || "Không có tên đề thi"}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-700 dark:text-gray-300">
                      {document?.exam?.createdBy?.fullName || "Không rõ"}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-700 dark:text-gray-300">
                      {departmentMap[document?.exam?.createdBy?.department] || "Không rõ"}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-700 dark:text-gray-300">
                      {format(document?.createdAt, "dd-MM-yyyy hh:mm")}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        className="w-full"
                        variant="default"
                        onClick={() => handleGetSignedFile(document?.id, "question")}
                        disabled={loadingId === `${document?.id}-question`}
                      >
                        {loadingId === `${document.id}-question`
                          ? "Đang tải..."
                          : "Xem Đề thi"}
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        className="w-full"
                        variant="secondary"
                        onClick={() => handleGetSignedFile(document?.id, "answer")}
                        disabled={loadingId === `${document.id}-answer`}
                      >
                        {loadingId === `${document.id}-answer`
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
