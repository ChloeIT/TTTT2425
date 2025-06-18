import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useExamDocumentUpload } from "@/hooks/use-document-upload";
import toast, { Toaster } from "react-hot-toast";

export default function UploadExamButton({
  exam,
  pendingUploadExam,
  setPendingUploadExam,
}) {
  const [open, setOpen] = useState(false);
  const [questionFile, setQuestionFile] = useState(null);
  const [answerFile, setAnswerFile] = useState(null);
  const { uploadDocument, loading } = useExamDocumentUpload(exam.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!questionFile || !answerFile) {
      toast.error("Vui lòng chọn cả file đề thi và đáp án");
      return;
    }

    // Client-side PDF validation
    const isPdfQuestion = questionFile.type === "application/pdf";
    const isPdfAnswer = answerFile.type === "application/pdf";
    if (!isPdfQuestion || !isPdfAnswer) {
      toast.error("Chỉ chấp nhận file PDF");
      return;
    }

    const success = await uploadDocument(questionFile, answerFile);
    if (success) {
      setQuestionFile(null);
      setAnswerFile(null);
      setOpen(false);
      document.getElementById("questionFile").value = "";
      document.getElementById("answerFile").value = "";
      if (setPendingUploadExam) setPendingUploadExam(null);
      toast.success("Đăng tải tài liệu thành công!");
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className="bg-blue-100 text-blue-700 hover:bg-blue-200"
            disabled={loading}
          >
            Cập nhật tài liệu
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle>Cập nhật tài liệu cho {exam.title}</DialogTitle>
            <DialogDescription>
              Tải lên file đề thi và đáp án (chỉ chấp nhận PDF)
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="questionFile"
                className="block font-medium mb-1 dark:text-gray-200"
              >
                File đề thi (PDF)
              </label>
              <input
                id="questionFile"
                type="file"
                accept=".pdf"
                onChange={(e) => setQuestionFile(e.target.files[0])}
                disabled={loading}
                required
                className="block w-full text-sm text-blue-900 border border-blue-400 rounded cursor-pointer bg-blue-50 dark:bg-gray-700 dark:border-gray-600 dark:text-blue-400"
              />
            </div>
            <div>
              <label
                htmlFor="answerFile"
                className="block font-medium mb-1 dark:text-gray-200"
              >
                File đáp án (PDF)
              </label>
              <input
                id="answerFile"
                type="file"
                accept=".pdf"
                onChange={(e) => setAnswerFile(e.target.files[0])}
                disabled={loading}
                required
                className="block w-full text-sm text-blue-900 border border-blue-400 rounded cursor-pointer bg-blue-50 dark:bg-gray-700 dark:border-gray-600 dark:text-blue-400"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Đang tải..." : "Tải lên"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
