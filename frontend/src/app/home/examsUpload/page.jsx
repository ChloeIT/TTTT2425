import ExamUploadModal from "./_components/exam-upload-modal";
import ExamTable from "./_components/exam-table";
import ExamView from "./_components/exam-view-list";

import { Card, CardContent } from "@/components/ui/card";
import { getExams, getExamsWithDeanRole } from "@/actions/exams-action";
import { requireRole, auth } from "@/lib/session";
import { redirect } from "next/navigation";

export async function generateMetadata() {
  return {
    title: "Soạn Đề và Đáp án",
  };
}

const ExamsUploadPage = async ({ searchParams }) => {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const query = params.query || "";

  const user = await auth();
  const role = user?.role;
  const department = user?.department;
  const userId = user?.id; // Extract userId from auth

  const isAuthorized = await requireRole("TRUONG_KHOA", "GIANG_VIEN_RA_DE");
  if (!isAuthorized) {
    redirect("/home");
  }

  let exams = [];
  let examsDean = [];
  let totalPageDean = 1;

  if (role === "GIANG_VIEN_RA_DE" || role === "TRUONG_KHOA") {
    const result = await getExams();
    if (!result.ok) throw new Error(result.message || "Failed to load exams");
    exams = result.data;
  }

  if (role === "TRUONG_KHOA") {
    const resultDean = await getExamsWithDeanRole({ page, query, department });
    examsDean = resultDean.data;
    totalPageDean = resultDean.totalPage;
  }

  const examsDangCho =
    role === "GIANG_VIEN_RA_DE"
      ? exams
          .filter((e) => e.status === "DANG_CHO")
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      : [];

  const examsTuChoi =
   
       exams
          .filter((e) => e.status === "TU_CHOI")
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      ;

  return (
    <div className="flex flex-col gap-y-4 py-4 h-full">
      <div className="px-6 py-4 bg-white dark:bg-gray-800 shadow">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Soạn Đề và Đáp án
        </h1>
      </div>

      <Card>
        <CardContent>
          {role === "GIANG_VIEN_RA_DE" && (
            <>
              <div className="px-6 py-6">
                <ExamUploadModal />
              </div>
              <div className="px-6 pb-10">
                <ExamTable
                  exams={examsDangCho}
                  title="Danh sách đề thi đang chờ duyệt"
                  userId={userId} // Pass userId to ExamTable
                />
                <ExamTable
                  exams={examsTuChoi}
                  title="Danh sách đề thi bị từ chối"
                  userId={userId} // Pass userId to ExamTable
                />
              </div>
            </>
          )}

          {role === "TRUONG_KHOA" && (
            <div className="px-6 py-6">
              <ExamUploadModal />
              <ExamView
                exams={examsDean}
                totalPage={totalPageDean}
                page={page}
                query={query}
                department={department}
                userId={userId} // Pass userId to ExamView
                examsRejectedByMe={examsTuChoi}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamsUploadPage;
