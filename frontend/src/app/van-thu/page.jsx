"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import NavBar from "./_components/NavBar";

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

  // useEffect(() => {
  //   fetch("http://localhost:5001/exams/van-thu/exams", {
  //     credentials: "include",
  //   })
  //     .then((res) => res.json())
  //     .then((data) => setExams(data.data || []));
  // }, []);

  useEffect(() => {
  const fetchApprovedExams = async () => {
    try {
      const res = await fetch("http://localhost:5000/exams/van-thu/exams/da-duyet", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setExams(data.data);
      }
    } catch (err) {
      console.error("Lỗi fetch đề đã duyệt:", err);
    }
  };
  fetchApprovedExams();
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
    <>
      <NavBar />
      <div className="pt-20 p-8 text-center">
        <h1 className="text-2xl font-bold mb-6">Trang Văn Thư - Upload Đề Đã Thi</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-left">Danh sách đề đã thi</h2>
            <DialogTrigger asChild>
              <button
                className="text-2xl p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                title="Upload đề đã ký"
              >
                📤
              </button>
            </DialogTrigger>
          </div>

        <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Tên đề</th>
              <th className="px-4 py-2 text-left">Người duyệt</th>
              <th className="px-4 py-2 text-left">Trạng thái</th>
              <th className="px-4 py-2 text-left">Tải về</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam, index) => (
              <tr key={exam.id} className="border-b dark:border-gray-700">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{exam.title}</td>
                <td className="px-4 py-2">{exam.approval?.approverName || "Chưa duyệt"}</td>
                <td className="px-4 py-2">{exam.status}</td>
                <td className="px-4 py-2">
                  {exam.questionFile && (
                    <a
                       href={`/van-thu/view/${exam.id}`}
                      className="text-blue-600 underline"
                      target="_blank"
           >
                       Xem đề
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

          <DialogContent className="max-w-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <DialogHeader>
              <DialogTitle>Upload đề thi đã thi</DialogTitle>
              <DialogDescription>
                Nhập tên và tải lên file đề + đáp án đã ký
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
      </div>
    </>
  );
}