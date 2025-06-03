// app/exams/page.jsx
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { getExams } from "@/actions/sign-action";
  import ExamList from "./_components/exam-table";
  import { parseToNumber } from "@/lib/utils";


  export async function generateMetadata() {
    return {
      title: "Quản lý đề thi",
    };
  }
  
  const ExamPage = async ({ searchParams }) => {
    const { page, query } = searchParams;
    const currentPage = parseToNumber(page, 1);
  
    const { data, totalPage } = await getExams({ page: currentPage, query });
  
    return (
      <div className="flex flex-col gap-y-4 py-4 h-full">
        <Card>
          <CardHeader>
            <CardTitle>Danh sách đề thi</CardTitle>
            {/* <CardDescription>Quản lý các đề thi trong hệ thống</CardDescription> */}
          </CardHeader>
          <CardContent>
          <ExamList exams={data} totalPage={totalPage} currentPage={currentPage} />

          </CardContent>
        </Card>
      </div>
    );
  };
  
  export default ExamPage;
  