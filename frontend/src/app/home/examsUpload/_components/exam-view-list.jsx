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
import { SearchBar } from "@/components/search-bar";
import { NavPagination } from "@/components/nav-pagination";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getExamsWithDeanRole, getSignedExamFiles } from "@/actions/exams-action";
import toast from "react-hot-toast";

export default function ExamView({ department }) {
  const [exams, setExams] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [fileUrls, setFileUrls] = useState({});
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const query = searchParams.get("query") || "";

  const fetchData = async () => {
    const result = await getExamsWithDeanRole({
      page,
      query,
      department,
    });

    setExams(result.data || []);
    setTotalPage(result.totalPage || 1);
  };

  useEffect(() => {
    fetchData();
    const handleUploadSuccess = () => {
      fetchData();
    };
    window.addEventListener("examUploadSuccess", handleUploadSuccess);
    return () => window.removeEventListener("examUploadSuccess", handleUploadSuccess);
  }, [page, query, department]);

  const getStatusText = (status) => {
    switch (status) {
      case "DANG_CHO":
        return "ĐANG CHỜ";
      case "TU_CHOI":
        return "TỪ CHỐI";
      case "DA_DUYET":
        return "ĐÃ DUYỆT";
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

  return (
    <div className="mb-10">
      <Toaster position="top-right" />
      <SearchBar placeholder="Tìm kiếm đề thi..." isPagination />
      <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-6">
        Danh sách đề thi đang chờ duyệt
      </h2>

      <Table className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 bg-gray-100 border-gray-200">
        <TableHeader>
          <TableRow>
            <TableHead>Tên đề thi</TableHead>
            <TableHead>Phòng ban</TableHead>
            <TableHead>Tệp đính kèm</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tạo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-gray-500 dark:text-gray-400">
                Không có dữ liệu
              </TableCell>
            </TableRow>
          ) : (
            exams.map((exam) => (
              <TableRow key={exam.id} className="dark:border-gray-700">
                <TableCell>
                  <span className="px-3 text-lg font-bold dark:text-gray-100">
                    {exam.title}
                  </span>
                </TableCell>
                <TableCell className="dark:text-gray-300">
                  {exam.createdBy.department}
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
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="py-4">
        <NavPagination totalPage={totalPage} />
      </div>
    </div>
  );
}
