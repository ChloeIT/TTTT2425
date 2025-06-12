"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getFile } from "@/actions/sign-action";

export default function ExamQuestion({ exam, onClose, onApprove }) {
  const [signedQuestionFile, setSignedQuestionFile] = useState(null);

  useEffect(() => {
    const fetchSignedFile = async () => {
      if (exam?.id) {
        const res = await getFile(exam.id);
        if (!res.ok) {
          console.error("Lỗi khi lấy file:", res.message);
        } else {
          console.log("Đã lấy signed file:", res.data);
          setSignedQuestionFile(res.data.questionFile);
        }
      }
    };

    fetchSignedFile();
  }, [exam]);

  return (
    <Dialog open={!!exam} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-7xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {exam?.title} - Đề thi
          </DialogTitle>
        </DialogHeader>

        <iframe
          src={signedQuestionFile || exam?.questionFile}
          title="Đề Thi"
          className="flex-grow border-0"
        />

        <DialogFooter className="p-4 border-t flex justify-end gap-3">
          {/* 
          <Button variant="outline">
            Chỉnh sửa / Scan hình mới
          </Button> 
          */}
          {/* <Button onClick={onApprove} className="bg-green-600 hover:bg-green-700 text-white">
            Xác nhận duyệt
          </Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
