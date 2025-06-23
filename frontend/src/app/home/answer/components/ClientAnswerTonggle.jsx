"use client";

import { useEffect, useState } from "react";
import { SearchBar } from "@/components/search-bar";
import { getExamsWithDocuments } from "@/actions/document-action";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format, set } from "date-fns";
import { useSearchParams } from "next/navigation";
import { NavPagination } from "@/components/nav-pagination";
import FullScreenPdfViewer from "@/app/home/answer/components/FullScreenPdfViewer";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const departmentMap = {
  MAC_DINH: "Mặc định",
  LY_LUAN_CO_SO: "Lý luận cơ sở",
  NHA_NUOC_PHAP_LUAT: "Nhà nước và pháp luật",
  XAY_DUNG_DANG: "Xây dựng Đảng",
};

const ClientAnswerTonggle = ({ token }) => {
  const [loadingId, setLoadingId] = useState(null);
  const [exams, setExams] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");

  const [totalPage, setTotalPage] = useState(1);
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const currentPage = Number(searchParams.get("page")) || 1;

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [documentType, setDocumentType] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");

  const fetchExams = async () => {
    const { data, totalPage } = await getExamsWithDocuments({
      page: currentPage,
      query,
    });
    setExams(data);
    setTotalPage(totalPage);
  };

  useEffect(() => {
    fetchExams();
  }, [currentPage, query]);

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
            Authorization: `Bearer ${token}`,
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
          setPreviewUrl(fileUrl);
          setPreviewTitle(type === "question" ? "Đề thi" : "Đáp án");
        } else {
          toast.error(
            `Không tìm thấy file ${type === "question" ? "đề thi" : "đáp án"}.`
          );
        }
      } else {
        toast.error(result.message || "Không lấy được file.");
      }
    } catch (err) {
      console.error("Lỗi:", err);
      toast.error("Có lỗi xảy ra khi lấy file.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleRequestAnswerFile = (documentId, type) => {
    setDocumentType(type);
    setSelectedDocumentId(documentId);
    setShowPasswordDialog(true);
  };

  const handleVerifyPasswordAndOpenFile = async () => {
    if (!passwordInput) {
      toast.error("Vui lòng nhập mật khẩu");
      return;
    }

    setLoadingId(`${selectedDocumentId}-answer`);

    try {
      const res = await fetch(
        `http://localhost:5000/documents/verify-password`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            documentId: selectedDocumentId,
            password: passwordInput,
          }),
        }
      );

      const result = await res.json();
      console.log("Password verification result:", result);
      if (res.ok) {
        await handleGetSignedFile(selectedDocumentId, documentType);
        setShowPasswordDialog(false);
        setPasswordInput("");
      } else {
        toast.error(result.message || "Mật khẩu không đúng.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi xác thực mật khẩu.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-y-4 py-4 h-full">
      <div className="px-6 py-4 bg-white dark:bg-gray-800 shadow rounded-md">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Danh sách Đề Thi và Đáp Án
        </h1>
      </div>

      <div className="py-4 flex gap-2 lg:flex-row flex-col items-start lg:items-center">
        <SearchBar placeholder={"Tìm kiếm đề thi..."} isPagination={true} />
      </div>

      <Card>
        <CardContent>
          <Table className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TableHeader>
              <TableRow className="bg-gray-100 dark:bg-gray-800 dark:text-gray-300">
                <TableHead className="text-center min-w-[100px]">
                  Tên đề thi
                </TableHead>
                <TableHead className="text-center min-w-[100px]">
                  Người tạo
                </TableHead>
                <TableHead className="text-center min-w-[100px]">
                  Khoa
                </TableHead>
                <TableHead className="text-center min-w-[100px]">
                  Ngày ký
                </TableHead>
                <TableHead className="text-center min-w-[100px]">
                  Xem Đề thi
                </TableHead>
                <TableHead className="text-center min-w-[100px]">
                  Xem Đáp án
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
                    <TableCell className="text-center font-bold text-blue-800 dark:text-blue-300">
                      {exam?.title || "Không có tên đề thi"}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-700 dark:text-gray-300">
                      {exam?.createdBy?.fullName || "Không rõ"}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-700 dark:text-gray-300">
                      {departmentMap[exam?.createdBy?.department] || "Không rõ"}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-700 dark:text-gray-300">
                      {exam?.document?.createdAt
                        ? format(
                            new Date(exam.document.createdAt),
                            "dd-MM-yyyy HH:mm"
                          )
                        : "Chưa ký"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        className="w-full"
                        variant="default"
                        onClick={() =>
                          handleRequestAnswerFile(
                            exam?.document?.id,
                            "question"
                          )
                        }
                        disabled={
                          loadingId === `${exam?.document?.id}-question`
                        }
                      >
                        {loadingId === `${exam?.document?.id}-question`
                          ? "Đang tải..."
                          : "Xem Đề thi"}
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        className="w-full"
                        variant="secondary"
                        onClick={() =>
                          handleRequestAnswerFile(exam?.document?.id, "answer")
                        }
                        disabled={loadingId === `${exam?.document?.id}-answer`}
                      >
                        {loadingId === `${exam?.document?.id}-answer`
                          ? "Đang tải..."
                          : "Xem Đáp án"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="py-4">
            <NavPagination totalPage={totalPage} />
          </div>
        </CardContent>
      </Card>

      {previewUrl && (
        <FullScreenPdfViewer
          url={previewUrl}
          onClose={() => setPreviewUrl(null)}
        />
      )}

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhập mật khẩu để xem đáp án</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              autoComplete="password"
              type="password"
              placeholder="Nhập mật khẩu..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleVerifyPasswordAndOpenFile}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientAnswerTonggle;
