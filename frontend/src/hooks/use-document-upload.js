"use client";

import { useState } from "react";
import { uploadExamDocument } from "@/actions/archive-action";
import toast from "react-hot-toast";

export const useExamDocumentUpload = (examId) => {
  const [loading, setLoading] = useState(false);

  const uploadDocument = async (questionFile, answerFile) => {
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
    formData.append("questionFile", questionFile);
    formData.append("answerFile", answerFile);

    try {
      setLoading(true);
      const result = await uploadExamDocument(examId, formData);
      console.log(result);
      setLoading(false);

      if (result.ok) {
        return true;
      } else {
        toast.error(result.message || "Tải file thất bại");
        return false;
      }
    } catch (error) {
      setLoading(false);
      toast.error("Lỗi hệ thống, vui lòng thử lại sau");
      return false;
    }
  };

  return { uploadDocument, loading };
};
