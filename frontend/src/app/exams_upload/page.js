"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

const ExamsUploadPage = () => {
  const [title, setTitle] = useState("");
  const [questionFile, setQuestionFile] = useState(null);
  const [answerFile, setAnswerFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Lấy token từ cookie để gửi Authorization header
  const token = (() => {
    if (typeof window !== "undefined") {
      return document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
    }
    return null;
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title) {
      toast.error("Vui lòng nhập tên đề thi");
      return;
    }
    if (!questionFile) {
      toast.error("Vui lòng chọn file đề thi");
      return;
    }
    if (!answerFile) {
      toast.error("Vui lòng chọn file đáp án");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("questionFile", questionFile);
    formData.append("answerFile", answerFile);

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/exams", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Note: không set Content-Type vì browser tự xử lý multipart/form-data
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Đăng đề thi thất bại");
      } else {
        toast.success("Đăng đề thi thành công");
        setTitle("");
        setQuestionFile(null);
        setAnswerFile(null);
        // reset input files (xem phần input bên dưới)
        document.getElementById("questionFile").value = "";
        document.getElementById("answerFile").value = "";
      }
    } catch (error) {
      toast.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Soạn đề thi mới</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block mb-2 font-semibold">
            Tên đề thi
          </label>
          <input
            type="text"
            id="title"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <div>
          <label htmlFor="questionFile" className="block mb-2 font-semibold">
            File đề thi (PDF, DOC, DOCX)
          </label>
          <input
            type="file"
            id="questionFile"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setQuestionFile(e.target.files[0])}
            disabled={loading}
            required
          />
        </div>
        <div>
          <label htmlFor="answerFile" className="block mb-2 font-semibold">
            File đáp án (PDF, DOC, DOCX)
          </label>
          <input
            type="file"
            id="answerFile"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setAnswerFile(e.target.files[0])}
            disabled={loading}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Đang gửi..." : "Đăng đề thi"}
        </button>
      </form>
    </div>
  );
};

export default ExamsUploadPage;
