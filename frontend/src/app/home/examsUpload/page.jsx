"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// import modal upload và bảng hiển thị (nếu bạn đã tạo)
import ExamUploadModal from "./_components/exam-upload-modal";
import ExamTable from "./_components/exam-table";

// import action getExams
import { getExams } from "@/actions/exams-action";
import { Card, CardContent } from "@/components/ui/card";

export default function ExamsUploadPage() {
  const router = useRouter();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);

  // Hàm fetch data bằng action
  const loadExams = async () => {
    setLoading(true);
    const result = await getExams();
    setLoading(false);

    if (result.ok) {
      setExams(result.data);
    } else if (result.unauthenticated) {
      // Nếu chưa đăng nhập (status 401), chuyển hướng về /login
      toast.error("Vui lòng đăng nhập để thực hiện");
      router.replace("/login");
    } else {
      toast.error(result.message);
    }
  };

  useEffect(() => {
    loadExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lọc và sắp xếp:
  const examsDangCho = exams
    .filter((e) => e.status === "DANG_CHO")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  const examsTuChoi = exams
    .filter((e) => e.status === "TU_CHOI")
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  return (
    <div className="flex flex-col gap-y-4 py-4 h-full">
      <div className="px-6 py-4 bg-white dark:bg-gray-800 shadow">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Soạn Đề và Đáp án
        </h1>
      </div>

      <Card>
        <CardContent>
          <div className="px-6 py-6">
            {/* Nút “Đăng tải đề thi” ở đầu */}
            <ExamUploadModal onUploadSuccess={loadExams} />
          </div>

          <div className="px-6 pb-10">
            {/* Bảng đang chờ duyệt */}
            {!loading && (
              <>
                <ExamTable
                  exams={examsDangCho}
                  title="Danh sách đề thi đang chờ duyệt"
                  className="dark:border-gray-700"
                />
                <ExamTable
                  exams={examsTuChoi}
                  title="Danh sách đề thi bị từ chối"
                  className="dark:border-gray-700"
                />
              </>
            )}

            {loading && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                Đang tải dữ liệu…
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
