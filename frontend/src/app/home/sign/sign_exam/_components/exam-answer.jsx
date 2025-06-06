"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ExamAnswer({ exam, onClose, onApprove }) {
  return (
    <Dialog open={!!exam} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-7xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {exam?.title} - Đáp án
          </DialogTitle>
        </DialogHeader>

        <iframe
  src={exam?.answerFile}

  title="Đáp án"
  className="flex-grow border-0"

/>


        <DialogFooter className="p-4 border-t flex justify-end gap-3">
          {/* 
          <Button variant="outline">
            Chỉnh sửa / Scan hình mới
          </Button> 
          */}
          <Button onClick={onApprove} className="bg-green-600 hover:bg-green-700 text-white">
            Xác nhận duyệt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
