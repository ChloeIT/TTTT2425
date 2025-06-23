// frontend/src/pages/exams-upload-page.jsx
import ExamUploadModal from "./_components/exam-upload-modal";
import ExamTable from "./_components/exam-table";
import ExamView from "./_components/exam-view-list";
import { Card, CardContent } from "@/components/ui/card";
import {
  getPendingExams,
  getRejectedExams,
  getExamsWithDeanRole,
} from "@/actions/exams-action";
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
  const userId = user?.id;

  const isAuthorized = await requireRole("TRUONG_KHOA", "GIANG_VIEN_RA_DE");
  if (!isAuthorized) {
    redirect("/home");
  }

  let pendingExams = [];
  let rejectedExams = [];
  let examsDean = [];
  let totalPageDean = 1;

  if (role === "GIANG_VIEN_RA_DE" || role === "TRUONG_KHOA") {
    const pendingResult = await getPendingExams();
    if (!pendingResult.ok)
      throw new Error(pendingResult.message || "Failed to load pending exams");
    pendingExams = pendingResult.data;

    const rejectedResult = await getRejectedExams();
    if (!rejectedResult.ok)
      throw new Error(
        rejectedResult.message || "Failed to load rejected exams"
      );
    rejectedExams = rejectedResult.data;
  }

  if (role === "TRUONG_KHOA") {
    const deanResult = await getExamsWithDeanRole({ page, query });
    examsDean = deanResult.data;
    totalPageDean = deanResult.totalPage;
  }

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
              <div>
                <ExamUploadModal />
              </div>
              <div>
                <ExamTable
                  exams={pendingExams}
                  title="Danh sách đề thi đang chờ duyệt"
                  userId={userId}
                />
                <ExamTable
                  exams={rejectedExams}
                  title="Danh sách đề thi bị từ chối"
                  userId={userId}
                />
              </div>
            </>
          )}
          {role === "TRUONG_KHOA" && (
            <div>
              <ExamUploadModal />
              <ExamView
                exams={examsDean}
                totalPage={totalPageDean}
                page={page}
                query={query}
                userId={userId}
                examsRejectedByMe={rejectedExams}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamsUploadPage;
