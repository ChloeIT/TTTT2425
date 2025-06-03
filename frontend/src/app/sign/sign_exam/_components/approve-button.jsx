"use client";

import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { signDocument, approveExam } from "@/actions/sign-action";
import { approveExamSchema, signExamSchema } from "@/schemas/sign.schema";

const ApproveButton = ({ exam, pendingApproveExam, setPendingApproveExam }) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignAllFiles = async () => {
    setLoading(true);
    try {
      // Validate password trước khi approve
      const approveValidation = approveExamSchema.safeParse({ password });
      if (!approveValidation.success) {
        const errors = approveValidation.error.format();
        const errorMessage = errors.password?._errors?.[0] || "Mật khẩu không hợp lệ";
        toast.error(errorMessage);
        setLoading(false);
        return;
      }

      let resultQ = null;
      let resultA = null;

      if (exam.questionFile) {
        // Validate dữ liệu signDocument theo signExamSchema trước
        const signQValidation = signExamSchema.safeParse({
          pdfUrl: exam.questionFile,
          exam_id: exam.id.toString(),
          fileType: "question",
        });

        try {
          resultQ = await signDocument({
            pdfUrl: exam.questionFile,
            exam_id: exam.id.toString(),
            fileType: "question",
          });
          console.log("Ký thành công file câu hỏi:", resultQ.message);
        } catch (err) {
          console.warn("Lỗi ký file câu hỏi:", err?.message);
        }
      }

      if (exam.answerFile) {
        const signAValidation = signExamSchema.safeParse({
          pdfUrl: exam.answerFile,
          exam_id: exam.id.toString(),
          fileType: "answer",
        });

        resultA = await signDocument({
          pdfUrl: exam.answerFile,
          exam_id: exam.id.toString(),
          fileType: "answer",
        });
        console.log("Ký thành công file đáp án:", resultA.message);

        if (resultA?.success) {
          const approveResult = await approveExam(exam.id.toString(), password);
          console.log("Kết quả duyệt:", approveResult);

          if (approveResult?.success) {
            toast.success("Đã duyệt đề thi thành công!");
          } else {
            toast.error("Duyệt thất bại: " + (approveResult?.message || "Không rõ lỗi"));
          }
        }
      }
    } catch (err) {
      console.error("Lỗi khi xử lý ký hoặc duyệt:", err);
      toast.error("Có lỗi xảy ra khi duyệt đề thi. Vui lòng thử lại.");
    } finally {
      setPendingApproveExam(null);
      setPassword("");
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <Button
        className="bg-green-600 hover:bg-green-700 text-white"
        onClick={() => setPendingApproveExam(exam)}
      >
        Duyệt
      </Button>

      <Dialog
        open={pendingApproveExam?.id === exam.id}
        onOpenChange={(open) => {
          if (!open) {
            setPendingApproveExam(null);
            setPassword("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-center">Xác nhận duyệt đề thi</DialogTitle>
          </DialogHeader>

          <Input
            type="password"
            placeholder="Nhập mật khẩu cho đề thi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
            autoFocus
          />

          <DialogFooter className="flex justify-end gap-2">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSignAllFiles}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setPendingApproveExam(null);
                setPassword("");
              }}
              disabled={loading}
            >
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApproveButton;
