import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { parseToNumber } from "@/lib/utils";
import { getSignedExams } from "@/actions/secretary-password-action";
import PasswordList from "./_components/password-table";

export async function generateMetadata() {
  return {
    title: "Quản lý mật khẩu đề thi",
  };
}

const PasswordManagementPage = async ({ searchParams }) => {
  const { page, query, month, year, department } = await searchParams;
  const currentPage = parseToNumber(page, 1);
  const { data, totalPage } = await getSignedExams({
    page: currentPage,
    query,
    month,
    year,
    department,
  });

  return (
    <div className="flex flex-col gap-y-4 py-4 h-full">
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Danh sách mật khẩu đề thi
            </h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordList
            passwords={data}
            totalPage={totalPage}
            currentPage={currentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordManagementPage;
