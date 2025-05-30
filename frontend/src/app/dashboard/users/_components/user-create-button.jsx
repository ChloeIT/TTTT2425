"use client";

import { userDepartment, userRole, userSchema } from "@/schemas/user.schema";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUser } from "@/actions/user-action";
import { useAction } from "@/hooks/use-action";

export const UserCreateButton = () => {
  const [isOpen, setOpen] = useState(false);

  const { action, isPending } = useAction();
  const onSubmit = (values) => {
    action(
      {
        fn: createUser,
        onSuccess: () => {
          form.reset();
          setOpen(false);
        },
      },
      values
    );
  };
  const form = useForm({
    resolver: zodResolver(userSchema.registerSchema),
    defaultValues: {
      email: "",
      department: undefined,
      fullName: "",
      password: "",
      username: "",
      role: "USER",
    },
  });
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"success"} size={"sm"} disabled={isPending}>
          <Plus className="h-4 w-4 mr-2" />{" "}
          <span className="text-sm font-semibold">Tạo người dùng mới</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Đăng ký người dùng</DialogTitle>
          <DialogDescription>Tạo tài khoản người dùng mới</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-x-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={"Nhập username"}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vai trò trong hệ thống</FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vai trò cho người dùng" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.keys(userRole).map((key) => {
                          return (
                            <SelectItem value={key} key={key}>
                              {userRole[key]}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid lg:grid-cols-2 gap-x-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={"Nhập email người dùng"}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={"Nhập mật khẩu người dùng"}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={"Nhập họ và tên người dùng"}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Khoa công tác</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò cho người dùng" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.keys(userDepartment).map((key) => {
                        return (
                          <SelectItem value={key} key={key}>
                            {userDepartment[key]}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-center gap-2 p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
              <Button
                type="button"
                variant="secondary"
                disabled={isPending}
                onClick={() => setOpen(false)}
              >
                Đóng
              </Button>

              <Button type="submit" disabled={isPending} variant={"blue"}>
                Đăng ký
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
