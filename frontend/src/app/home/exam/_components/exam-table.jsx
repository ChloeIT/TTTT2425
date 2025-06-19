"use client";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
export default function ExamTable({setOpen, data, setSelectedExam, setInputPassword, setError }) {

    const handleOpen = (exam) => {
        setSelectedExam(exam);
        setInputPassword("");
        setError("");
        setOpen(true);
    };

    const departmentMap = {
        MAC_DINH: "Mặc định",
        LY_LUAN_CO_SO: "Lý luận cơ sở",
        NHA_NUOC_PHAP_LUAT: "Nhà nước và pháp luật",
        XAY_DUNG_DANG: "Xây dựng Đảng",
    };

  

  return (
    <>
          <Card>
        <CardContent>
          <Table className="bg-white pt-4 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TableHeader>
              <TableRow className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 bg-gray-100 border-gray-200">
                <TableHead className="text-center min-w-[90px]">
                  Tên đề thi
                </TableHead>
                <TableHead className="text-center min-w-[90px]">
                  Người tạo
                </TableHead>
                <TableHead className="text-center min-w-[90px]">Khoa</TableHead>
                <TableHead className="text-center min-w-[90px]">
                  Trạng thái
                </TableHead>
                <TableHead className="text-center min-w-[90px]">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data && data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 text-gray-500 dark:text-gray-400"
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                data && data.map((exam) => (
                  <TableRow
                    key={exam.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <TableCell className="text-center font-bold text-blue-800">
                      {exam.title}
                    </TableCell>
                    <TableCell className="text-center">
                      {exam.createdBy?.fullName || "Không rõ"}
                    </TableCell>
                    <TableCell className="text-center">
                      {departmentMap[exam.createdBy?.department] || "Không rõ"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="default"
                        className={
                          {
                            DA_DUYET:
                              "bg-green-500 text-white dark:bg-green-600",
                            DA_THI: "bg-blue-500 text-white dark:bg-blue-600",
                          }[exam.status] ||
                          "bg-gray-400 text-white dark:bg-gray-600"
                        }
                      >
                        {exam.status === "DA_DUYET" ? "Đã duyệt" : "Đã thi"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        onClick={() => handleOpen(exam)}
                        disabled={exam.attemptCount >= 3}
                      >
                        Mở đề ({exam.attemptCount || 0}/3)
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
