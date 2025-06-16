import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getExams } from "@/actions/archive-action";
import ExamList from "./_components/exam-table";
import { parseToNumber } from "@/lib/utils";
import { cookies } from "next/headers";
import { requireRole } from "@/lib/session";
import { redirect } from "next/navigation";

export async function generateMetadata() {
  return {
    title: "Văn thư",
  };
}

const ArchivePage = async ({ searchParams }) => {
  const { page, query, department, month, year } = await searchParams;
  const currentPage = parseToNumber(page, 1);

  const { data, totalPage } = await getExams({
    page: currentPage,
    query: query || "",
    department: department || "",
    month: month || "",
    year: year || "",
  });

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  const isPermitted = await requireRole("VAN_THU");

  if (!isPermitted) {
    redirect("/home");
  }

  return (
    <div className="flex flex-col gap-y-4 py-4 h-full">
      <div className="px-6 py-4 bg-white dark:bg-gray-800 shadow">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Danh sách Đề đã thi
        </h1>
      </div>
      <Card>
        <CardHeader></CardHeader>
        <CardContent>
          <ExamList
            exams={data}
            totalPage={totalPage}
            currentPage={currentPage}
            token={token}
            searchQuery={query || ""}
            selectedDepartment={department || ""}
            selectedMonth={month || ""}
            selectedYear={year || ""}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ArchivePage;
