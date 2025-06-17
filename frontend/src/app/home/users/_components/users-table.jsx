"use client";

import { NavPagination } from "@/components/nav-pagination";
import { SearchBar } from "@/components/search-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { UserEditButton } from "./user-edit";
import { UserActiveButton } from "./user-active-buton";
import { userDepartment, userRole } from "@/schemas/user.schema";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { useUpdateSearchParams } from "@/hooks/use-update-search-param";

export const UsersTable = ({ data = [], totalPage }) => {
  const { user } = useProfile();
  const { updateSearchParams } = useUpdateSearchParams();

  return (
    <>
      <div className="py-4 flex gap-2 lg:flex-row flex-col items-start lg:items-center">
        <SearchBar
          placeholder={"Tìm kiếm người dùng theo tên, email..."}
          isPagination={true}
        />
      </div>
      <div className="flex gap-x-2 py-4">
        <Button
          variant="success"
          onClick={() => {
            updateSearchParams({ isActive: true, page: 1 });
          }}
        >
          Tài khoản đang hoạt động
        </Button>
        <Button
          variant="destroy"
          onClick={() => {
            updateSearchParams({ isActive: false, page: 1 });
          }}
        >
          Tài khoản đã dừng
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 bg-gray-100 border-gray-200">
            <TableHead className="min-w-[100px]">Họ và tên</TableHead>
            <TableHead className="min-w-[200px]">Địa chỉ email</TableHead>
            <TableHead className="min-w-[100px]">Vai trò</TableHead>
            <TableHead className="min-w-[200px]">Khoa công tác</TableHead>

            <TableHead className="min-w-[100px]">Hành động</TableHead>
            <TableHead className="min-w-[100px]">Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
            return (
              <TableRow key={item.id}>
                <TableCell>
                  {item.fullName} {user?.id === item.id && "(Bạn)"}
                </TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>{userRole[item.role]}</TableCell>
                <TableCell>{userDepartment[item.department]}</TableCell>
                <TableCell>
                  <UserEditButton data={item} disabled={user?.id === item.id} />
                </TableCell>
                <TableCell>
                  <UserActiveButton
                    data={item}
                    disabled={user?.id === item.id}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {!data.length && (
        <div className="my-4 text-muted-foreground flex justify-center">
          Không có dữ liệu...
        </div>
      )}
      <div className="py-4">
        <NavPagination totalPage={totalPage} />
      </div>
    </>
  );
};
