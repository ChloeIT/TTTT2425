import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ExamList from "./_components/exam-table";
import { requireRole } from "@/lib/session";
import { redirect } from "next/navigation";
export async function generateMetadata() {
  return {
    title: "Duyệt đề và đáp án",
  };
}

const ExamPage = async ({ searchParams })=> {
  const isPermitted = await requireRole("BAN_GIAM_HIEU");



  if (!isPermitted) {
    redirect("/home");
  }
  return (
    <div className="flex flex-col gap-y-4 py-4 h-full">
      <div className="px-6 py-4 bg-white dark:bg-gray-800 shadow">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Duyệt đề
        </h1>
      </div>
      <Card>
        <CardHeader />
        <CardContent>
          <ExamList />
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamPage;
