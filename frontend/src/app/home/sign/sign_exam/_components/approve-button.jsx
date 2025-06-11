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

import { approveExam } from "@/actions/sign-action";
import { approveExamSchema } from "@/schemas/sign.schema";
import { useRouter } from "next/navigation";


const ApproveButton = ({ exam, pendingApproveExam, setPendingApproveExam }) => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
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

      const approveResult = await approveExam(exam.id.toString(), password);
      console.log("Kết quả duyệt:", approveResult);

      if (approveResult?.success) {
        toast.success("Đã duyệt đề thi thành công!");
        setTimeout(() => {
          router.refresh();
        }, 1500); 
        
      } else {
        toast.error("Duyệt thất bại: " + (approveResult?.message || "Không rõ lỗi"));
      }
      
    } catch (err) {
      console.error("Lỗi khi xử lý duyệt:", err);
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
        className="bg-blue-100 text-blue-700 hover:bg-blue-200"
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
            name="approve-exam-password"
            type="password"
            placeholder="Nhập mật khẩu cho đề thi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
            autoFocus
             autoComplete="new-password"
          />

          <DialogFooter className="flex justify-end gap-2">
            <Button
              className="bg-blue-100 text-blue-700 hover:bg-blue-200"
              onClick={handleApprove}
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
