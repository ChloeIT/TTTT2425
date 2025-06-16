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

export const UsersTable = ({ data = [], totalPage }) => {
  const { user } = useProfile();
  return (
    <>
      <div className="py-4 flex gap-2 lg:flex-row flex-col items-start lg:items-center">
        <SearchBar
          placeholder={"Tìm kiếm người dùng theo tên, email..."}
          isPagination={true}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 bg-gray-100 border-gray-200">
            <TableHead>Họ và tên</TableHead>
            <TableHead>Địa chỉ email</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Khoa công tác</TableHead>

            <TableHead>Hành động</TableHead>
            <TableHead>Trạng thái</TableHead>
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