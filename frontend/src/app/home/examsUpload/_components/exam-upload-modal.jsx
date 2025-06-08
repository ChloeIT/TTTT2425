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
import { useExamUpload } from "@/hooks/use-exam-upload";
import toast from "react-hot-toast";

export default function ExamUploadModal({ onUploadSuccess }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [questionFile, setQuestionFile] = useState(null);
  const [answerFile, setAnswerFile] = useState(null);
  const { uploadExam, loading } = useExamUpload();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !questionFile || !answerFile) {
      toast.error("Vui lòng nhập đủ thông tin");
      return;
    }

    const success = await uploadExam(title, questionFile, answerFile);
    if (success) {
      setTitle("");
      setQuestionFile(null);
      setAnswerFile(null);
      setOpen(false);
      document.getElementById("questionFile").value = "";
      document.getElementById("answerFile").value = "";
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="blue">Đăng tải đề thi mới</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        <DialogHeader>
          <DialogTitle>Đăng đề thi mới</DialogTitle>
          <DialogDescription>
            Nhập tên và tải lên file đề thi, đáp án
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block font-medium mb-1 dark:text-gray-200"
            >
              Tên đề thi
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              required
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            />
          </div>
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
              {loading ? "Đang gửi..." : "Đăng đề thi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
