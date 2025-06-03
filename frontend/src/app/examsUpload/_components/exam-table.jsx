import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ExamTable({ exams, title }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
        {title}
      </h2>
      <Table className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        <TableHeader>
          <TableRow>
            <TableHead className="dark:border-gray-700">Tên đề thi</TableHead>
            <TableHead className="dark:border-gray-700">Nội dung</TableHead>
            <TableHead className="dark:border-gray-700">Trạng thái</TableHead>
            <TableHead className="dark:border-gray-700">Ghi chú</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
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
                    href={exam.answerFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-md block border border-gray-300 rounded-md px-3 py-2 text-blue-600 font-medium hover:bg-gray-200 transition max-w-xs dark:border-gray-600 dark:text-blue-400 dark:hover:bg-gray-700"
                  >
                    📄 File đáp án
                  </a>
                  <a
                    href={exam.questionFile}
                    target="_blank"
                    rel="noopener noreferrer"
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
                  {exam.status}
                </Badge>
              </TableCell>
              <TableCell className="dark:text-gray-300">
                {exam.note || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
