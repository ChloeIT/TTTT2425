import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { parseToNumber } from "@/lib/utils";
import { getPasswords } from "@/actions/secretary-password-action";
import PasswordList from "./_components/password-table";

export async function generateMetadata() {
  return {
    title: "Quản lý mật khẩu đề thi",
  };
}

const PasswordManagementPage = async ({ searchParams }) => {
  const { page, query } = await searchParams; 
  const currentPage = parseToNumber(page, 1);
  const currentQuery = query || ""; 

  const { data } = await getPasswords({ page: currentPage, query: currentQuery });

  return (
    <div className="flex flex-col gap-y-4 py-4 h-full">
      <Card>
        <CardHeader>
          <CardTitle>Danh sách mật khẩu đề thi</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordList passwords={data} />
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordManagementPage;