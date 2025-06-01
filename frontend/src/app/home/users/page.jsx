import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserCreateButton } from "./_components/user-create-button";
import { ModeToggle } from "@/components/mode-toggle";
import { UsersTable } from "./_components/users-table";
import { parseToNumber } from "@/lib/utils";
import { getUsers } from "@/actions/user-action";
export async function generateMetadata() {
  return {
    title: "Quản lý người dùng",
  };
}
const UsersPage = async ({ searchParams }) => {
  const { page, query } = await searchParams;
  const currentPage = parseToNumber(page, 1);

  const { data, totalPage } = await getUsers({ page: currentPage, query });

  return (
    <div className="flex flex-col gap-y-4 py-4 h-full">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý người dùng</CardTitle>
          <CardDescription>
            Quản lý thông tin tài khoản người dùng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end">
            <UserCreateButton />
          </div>
          <UsersTable data={data} totalPage={totalPage} />
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;
