import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getExams } from "@/actions/sign-action";
import ExamList from "./_components/exam-table";
import { parseToNumber } from "@/lib/utils";

export async function generateMetadata() {
  return {
    title: "Duyệt đề và đáp án",
  };
}

const ExamPage = async ({ searchParams }) => {
  const { page, query } = await searchParams;
  const currentPage = parseToNumber(page, 1);

  const { data, totalPage } = await getExams({ page: currentPage, query });

  return (
    <div className="flex flex-col gap-y-4 py-4 h-full">
      <div className="px-6 py-4 bg-white dark:bg-gray-800 shadow">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Duyệt đề thi và đáp án
        </h1>
      </div>
      <Card>
        <CardHeader>
          {/* <CardTitle> <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
        Danh sách đề thi
      </h1></CardTitle> */}
          {/* <CardDescription>Quản lý các đề thi trong hệ thống</CardDescription> */}
        </CardHeader>
        <CardContent>
          <ExamList
            exams={data}
            totalPage={totalPage}
            currentPage={currentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamPage;
