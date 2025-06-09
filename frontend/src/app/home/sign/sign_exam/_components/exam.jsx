"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ExamQuestion({ exam, onClose, onApprove }) {
  return (
    <Dialog open={!!exam} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-xl">
            {exam?.title} - Đề thi
          </DialogTitle>
        </DialogHeader>

        <iframe
          src={exam?.questionFile}
          
          title="Đề thi"
          className="flex-grow w-full border-0"
        />

        <DialogFooter className="p-4 border-t flex justify-end gap-2">

        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
