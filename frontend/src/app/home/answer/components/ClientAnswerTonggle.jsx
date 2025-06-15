"use client";

import { useState } from "react";

const ClientAnswerTonggle = ({ data }) => {
  const [loadingId, setLoadingId] = useState(null);

  const examWithFile = data.filter((exam) => exam.questionFile);

  const handleGetSignedFile = async (documentId, type) => {
    setLoadingId(`${documentId}-${type}`);

    try {
      const res = await fetch(
        `http://localhost:5000/documents/${documentId}/signed-files`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await res.json();
      if (res.ok && result.data) {
        const fileUrl =
          type === "question"
            ? result.data.questionFile
            : result.data.answerFile;
        if (fileUrl) {
          window.open(fileUrl, "_blank");
        } else {
          alert(
            `Không tìm thấy file ${type === "question" ? "đề thi" : "đáp án"}.`
          );
        }
      } else {
        alert(result.message || "Không lấy được file.");
      }
    } catch (err) {
      console.error("Lỗi:", err);
      alert("Có lỗi xảy ra khi lấy file.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex justify-center">
      <div className="w-full max-w-6xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            Danh sách Đề thi và Đáp án đã kí
          </h1>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-center">
            <thead className="bg-gray-100 dark:bg-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-100">
              <tr>
                <th className="px-4 py-3">Tên đề thi</th>
                <th className="px-4 py-3">Ngày ký</th>
                <th className="px-4 py-3">Xem Đề thi</th>
                <th className="px-4 py-3">Xem Đáp án</th>
              </tr>
            </thead>
            <tbody>
              {examWithFile.map((exam, id) => (
                <tr
                  key={id}
                  className="border-t border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-4 align-middle font-bold text-blue-800 dark:text-blue-300">
                    {exam.exam?.title || "Không có tên đề thi"}
                  </td>
                  <td className="px-4 py-4 align-middle text-sm text-gray-700 dark:text-gray-300">
                    {new Intl.DateTimeFormat("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Ho_Chi_Minh",
                    }).format(new Date(exam.createdAt))}
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <button
                      onClick={() => handleGetSignedFile(exam.id, "question")}
                      disabled={loadingId === `${exam.id}-question`}
                      className={`${
                        loadingId === `${exam.id}-question`
                          ? "bg-blue-300 dark:bg-blue-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                      } text-white px-3 py-1 rounded text-sm w-full`}
                    >
                      {loadingId === `${exam.id}-question`
                        ? "Đang tải..."
                        : "Xem Đề thi"}
                    </button>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <button
                      onClick={() => handleGetSignedFile(exam.id, "answer")}
                      disabled={loadingId === `${exam.id}-answer`}
                      className={`${
                        loadingId === `${exam.id}-answer`
                          ? "bg-green-300 dark:bg-green-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                      } text-white px-3 py-1 rounded text-sm w-full`}
                    >
                      {loadingId === `${exam.id}-answer`
                        ? "Đang tải..."
                        : "Xem Đáp án"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientAnswerTonggle;
