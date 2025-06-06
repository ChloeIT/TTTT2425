"use client";
import React, { useState, useEffect } from "react";
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

export default function VanThuPage() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [questionFile, setQuestionFile] = useState(null);
  const [answerFile, setAnswerFile] = useState(null);
  const { uploadExam, loading } = useExamUpload();
  const [exams, setExams] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5001/exams/van-thu/exams", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setExams(data.data || []));
  }, []);

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
    }
  };

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-6">Trang Văn Thư - Upload Đề Đã Thi</h1>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="blue">Upload đề đã thi</Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle>Upload đề thi đã thi</DialogTitle>
            <DialogDescription>
              Nhập tên và tải lên file đề + đáp án đã thi
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
                accept=".pdf,.doc,.docx"
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
                accept=".pdf,.doc,.docx"
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
      {exams.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Danh sách đề đã thi</h2>
          <ul className="space-y-4">
            {exams.map((exam) => (
                <li key={exam.id} className="border p-4 rounded shadow bg-gray-50 dark:bg-gray-800">                <p className="font-medium">{exam.title}</p>
                <div className="mt-2 space-x-4">
                  {exam.questionFile && (
                    <a href={exam.questionFile} target="_blank" className="text-blue-600 underline">
                      Tải đề thi
                    </a>
                  )}
                  {exam.answerFile && (
                    <a href={exam.answerFile} target="_blank" className="text-green-600 underline">
                      Tải đáp án
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}