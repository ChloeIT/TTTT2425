"use client";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { ApprovedExamsList, approvedFull, getAllExams, statusChanged } from "@/actions/exams-action";
import { parseToNumber } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import ExamQuestion from "../../sign/sign_exam/_components/exam";
import { Card, CardContent } from "@/components/ui/card";
import { currentUser } from "@/actions/auth-action";

const ExamViewList = ({ page, query, token }) => {
  const [user, setUser] = useState(null)
  const [data, setData] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [inputPassword, setInputPassword] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [examToOpen, setExamToOpen] = useState(null);
  const [openedExamIds, setOpenedExamIds] = useState([]);

  const currentPage = parseToNumber(page, 1);

  useEffect(()=> {
    const getCurrentUser = async()=> {
      const res = await currentUser();
      if(res.data){
        setUser(res.data)
      }
    }
    getCurrentUser()
  },[])

  useEffect(() => {

    const fetchExams = async () => {
      const res = await approvedFull({ page: currentPage, query });
      setData(res.data || []);
    };
    fetchExams();
  }, [currentPage, query, user]);

  const handleOpen = async (exam) => {
    setSelectedExam(exam);
    setInputPassword("");
    setError("");
    setOpen(true);
  };

  const handleCheckPassword = async () => {
    if (!selectedExam) return;

    try {
      // 1. Xác minh mật khẩu
      const res = await fetch("http://localhost:5000/exams/verify-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          examId: selectedExam.id,
          password: inputPassword,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        const status = "DA_THI";
        const changeStatusResult = await statusChanged(
          selectedExam.id.toString(),
          status
        );

        // console.log(changeStatusResult)
        setOpen(false);
        setExamToOpen(selectedExam);
        setOpenedExamIds((prev) => [...prev, selectedExam.id]);
      } else {
        setError(result.error || "Đã xảy ra lỗi");
      }
    } catch (err) {
      setError("Lỗi kết nối tới server");
    }
  };

  const departmentMap = {
    MAC_DINH: "Mặc định",
    LY_LUAN_CO_SO: "Lý luận cơ sở",
    NHA_NUOC_PHAP_LUAT: "Nhà nước và pháp luật",
    XAY_DUNG_DANG: "Xây dựng Đảng",
  };

  return (
    <div className="flex flex-col gap-y-4 py-4 h-full">
      <div className="px-6 py-4 bg-white dark:bg-gray-800 shadow">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Danh sách Đề Thi
        </h1>
      </div>

      <Card>
        <CardContent>
          <Table className="bg-white pt-4 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TableHeader>
              <TableRow className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 bg-gray-100 border-gray-200">
                <TableHead >
                  Tên đề thi
                </TableHead>
                <TableHead >
                  Người tạo
                </TableHead>
                <TableHead >
                  Khoa
                </TableHead>
                <TableHead >
                  Trạng thái
                </TableHead>
                <TableHead >
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 text-gray-500 dark:text-gray-400"
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                data.map((exam) => (
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
                        disabled={openedExamIds.includes(exam.id)}
                      >
                        Mở đề
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>{" "}
      </Card>

      {/* Dialog nhập mật khẩu */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nhập mật khẩu</DialogTitle>
            <DialogDescription>
              Đề thi: <strong>{selectedExam?.title}</strong>
            </DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            placeholder="Nhập mật khẩu đề thi"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          <DialogFooter className="mt-4">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCheckPassword}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Component mở đề thi sau khi xác minh */}
      <ExamQuestion exam={examToOpen} onClose={() => setExamToOpen(null)} />
    </div>
  );
};

export default ExamViewList;