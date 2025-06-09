"use client";

import { useState } from "react";
import { createExam } from "@/actions/exams-action";
import toast from "react-hot-toast";

export const useExamUpload = () => {
  const [loading, setLoading] = useState(false);

  const uploadExam = async (title, questionFile, answerFile) => {
    if (!title) {
      toast.error("Vui lòng nhập tên đề thi");
      return false;
    }
    if (!questionFile) {
      toast.error("Vui lòng chọn file đề thi");
      return false;
    }
    if (!answerFile) {
      toast.error("Vui lòng chọn file đáp án");
      return false;
    }

    const isPdfQuestion = questionFile.type === "application/pdf";
    const isPdfAnswer = answerFile.type === "application/pdf";
    if (!isPdfQuestion || !isPdfAnswer) {
      toast.error("Chỉ chấp nhận file PDF");
      return false;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("questionFile", questionFile);
    formData.append("answerFile", answerFile);

    try {
      setLoading(true);
      const result = await createExam(formData);
      setLoading(false);

      if (result.ok) {
        toast.success("Đăng đề thi thành công");
        return true;
      } else {
        toast.error(result.message || "Đăng đề thi thất bại");
        return false;
      }
    } catch (error) {
      setLoading(false);
      toast.error("Lỗi hệ thống, vui lòng thử lại sau");
      return false;
    }
  };

  return { uploadExam, loading };
};
