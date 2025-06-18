"use client";
import { useEffect, useState } from "react";
import {
  ApprovedExamsList,
  approvedFull,
  getAllExams,
  statusChanged,
} from "@/actions/exams-action";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { currentUser } from "@/actions/auth-action";
import { NavPagination } from "@/components/nav-pagination";
import { useSearchParams } from "next/navigation";
import FullScreenPdfViewer from "@/app/home/answer/components/FullScreenPdfViewer";

const ExamViewList = ({ query, token }) => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [inputPassword, setInputPassword] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [openedExamIds, setOpenedExamIds] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");

  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const currentPage = parseToNumber(page, 1);

  useEffect(() => {
    const getCurrentUser = async () => {
      const res = await currentUser();
      if (res.data) {
        setUser(res.data);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchExams = async () => {
      const { data, totalPage } = await approvedFull({
        page,
        query
      });
      setData(data);
      console.log(data)
      setTotalPage(totalPage);
    };
    fetchExams();
  }, [currentPage, query, user, page]);

  const handleOpen = (exam) => {
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
      if (!res.ok) {
        setError(result.error || "Đã xảy ra lỗi");
        return;
      }

      // 2. Cập nhật trạng thái sang DA_THI
      await statusChanged(selectedExam.id.toString(), "DA_THI");

      // 3. Gọi API lấy signed URL
      const fileRes = await fetch(`http://localhost:5000/exams/${selectedExam.id}/files`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const fileData = await fileRes.json();
      if (!fileRes.ok || !fileData?.data?.questionFile) {
        setError("Không lấy được file đề thi.");
        return;
      }

      // 4. Hiển thị PDF fullscreen
      setPreviewUrl(fileData.data.questionFile);
      setPreviewTitle(selectedExam.title);
      setOpenedExamIds((prev) => [...prev, selectedExam.id]);
      setOpen(false);
      setData((prevData) =>
        prevData.map((exam) =>
          exam.id === selectedExam.id
            ? {
                ...exam,
                attemptCount: Math.min((exam.attemptCount || 0) + 1, 3),
                status: "DA_THI",
              }
            : exam
        )
      );
    } catch (err) {
      console.error(err);
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
                <TableHead className="text-center min-w-[90px]">Tên đề thi</TableHead>
                <TableHead className="text-center min-w-[90px]">Người tạo</TableHead>
                <TableHead className="text-center min-w-[90px]">Khoa</TableHead>
                <TableHead className="text-center min-w-[90px]">Trạng thái</TableHead>
                <TableHead className="text-center min-w-[90px]">Thao tác</TableHead>
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
                        className={{
                          DA_DUYET: "bg-green-500 text-white dark:bg-green-600",
                          DA_THI: "bg-blue-500 text-white dark:bg-blue-600",
                        }[exam.status] || "bg-gray-400 text-white dark:bg-gray-600"}
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
                        Mở đề
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
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

      <div className="py-4">
        <NavPagination totalPage={totalPage} />
      </div>

      {/* PDF Viewer */}
      {previewUrl && (
        <FullScreenPdfViewer
          url={previewUrl}
          title={previewTitle}
          onClose={() => setPreviewUrl(null)}
        />
      )}
    </div>
  );
};

export default ExamViewList;
