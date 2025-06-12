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
    <div className="flex flex-col gap-y-4 py-4 h-full">
      <div className="px-6 py-4 bg-white dark:bg-gray-800 shadow">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Quản lý người dùng
        </h1>
      </div>
      <Card>
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
