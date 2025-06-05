import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserCreateButton } from "./_components/user-create-button";
import { UsersTable } from "./_components/users-table";
import { parseToNumber } from "@/lib/utils";
import { getUsers } from "@/actions/user-action";
import { requireRole } from "@/lib/session";
import { redirect } from "next/navigation";
export async function generateMetadata() {
  return {
    title: "Quản lý người dùng",
  };
}
const UsersPage = async ({ searchParams }) => {
  const { page, query } = await searchParams;
  const currentPage = parseToNumber(page, 1);

  const { data, totalPage } = await getUsers({ page: currentPage, query });
  const isPermitted = await requireRole("BAN_GIAM_HIEU");

  if (!isPermitted) {
    redirect("/home");
  }

  return (
    <div className="flex flex-col gap-y-4 py-4 h-full max-w-6xl mx-auto">
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
