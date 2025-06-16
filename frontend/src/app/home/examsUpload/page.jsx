import ExamUploadModal from "./_components/exam-upload-modal";
import ExamTable from "./_components/exam-table";
import { Card, CardContent } from "@/components/ui/card";
import { getExams } from "@/actions/exams-action";
import { requireRole } from "@/lib/session";
import { redirect } from "next/navigation";

export async function generateMetadata() {
  return {
    title: "Soạn Đề và Đáp án",
  };
}

const ExamsUploadPage = async () => {
  // Fetch exams server-side
  const result = await getExams();
  if (!result.ok) {
    if (result.unauthenticated) {
      redirect("/login");
    }
    // For other errors, we could throw an error or handle it differently
    throw new Error(result.message || "Failed to load exams");
  }

  const exams = result.data;

  // Server-side role check
  const isAuthorized = await requireRole("TRUONG_KHOA", "GIANG_VIEN_RA_DE");
  if (!isAuthorized) {
    redirect("/home");
  }

  // Filter and sort exams server-side
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
            {/* Modal for uploading exams, handled client-side */}
            <ExamUploadModal />
          </div>

          <div className="px-6 pb-10">
            {/* Tables for displaying exams, handled client-side */}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamsUploadPage;
