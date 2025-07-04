"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { rejectExam } from "@/actions/sign-action";
import { rejectExamSchema } from "@/schemas/sign.schema";
import { useRouter } from "next/navigation";

const RejectButton = ({ exam, pendingRejectExam, setPendingRejectExam, onSuccess }) => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    setLoading(true);
    try {
      const validation = rejectExamSchema.safeParse({ message });
      if (!validation.success) {
        const errors = validation.error.format();
        const errorMessage =
          errors.message?._errors?.[0] || "Lý do không hợp lệ";
        toast.error(errorMessage);
        setLoading(false);
        return;
      }
  
      const result = await rejectExam(exam.id.toString(), message.trim());
  
      if (result?.success) {
        toast.success(result.message || "Đã từ chối đề thi thành công!");

        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            router.refresh();
          }
        }, 1500);
      } else {
        toast.error("Từ chối thất bại: " + (result?.message || "Không rõ lỗi"));
      }
    } catch (err) {
      console.error("Lỗi khi từ chối:", err);
      toast.error("Có lỗi xảy ra khi từ chối đề thi. Vui lòng thử lại.");
    } finally {
      setPendingRejectExam(null);
      setMessage("");
      setLoading(false);
    }
  };
  

  return (
    <>
      <Button
        className="bg-red-100 text-red-700 hover:bg-red-200"
        onClick={() => setPendingRejectExam(exam)}
      >
        Từ chối
      </Button>

      <Dialog
        open={pendingRejectExam?.id === exam.id}
        onOpenChange={(open) => {
          if (!open) {
            setPendingRejectExam(null);
            setMessage("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center">
            Xác nhận từ chối đề thi
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Đề thi: <span className="font-medium text-foreground">{exam.title}</span>
          </p>
        </DialogHeader>


          <Textarea
            placeholder="Nhập lý do từ chối đề thi..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mb-4"
            rows={4}
            autoFocus
          />

          <DialogFooter className="flex justify-end gap-2">
            <Button
              className="bg-red-100 text-red-700 hover:bg-red-200"
              onClick={handleReject}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Xác nhận từ chối"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setPendingRejectExam(null);
                setMessage("");
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

export default RejectButton;
