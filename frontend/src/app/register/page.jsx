"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { register } from "@/actions/auth-action"; // cần tạo
import { useAction } from "@/hooks/use-action";
import { userSchema, userDepartment, userRole } from "@/schemas/user.schema";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function  RegisterForm  ()  {
  const router = useRouter();
  const { action, isPending } = useAction();

    const onSubmit = (values) => {
      console.log(values)
    action(
      {
        fn: register,
        onSuccess: () => {
          router.push("/");
        },
      },
      values
    );
  };

  const form = useForm({
    resolver: zodResolver(userSchema.userRegistrationSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
      department: "",
      role: "",
    },
  });



  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">
                <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Đăng ký</CardTitle>
        <CardDescription>
          Nhập đầy đủ thông tin để tạo tài khoản mới
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {[
              { name: "fullName", label: "Họ tên", type: "text" },
              { name: "username", label: "Tên đăng nhập", type: "text" },
              { name: "email", label: "Email", type: "email" },
              { name: "password", label: "Mật khẩu", type: "password" },
            ].map(({ name, label, type }) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <Input
                        type={type}
                        placeholder={`Nhập ${label.toLowerCase()}`}
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phòng ban</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full border border-gray-300 rounded-md p-2"
                      disabled={isPending}
                    >
                      <option value="">-- Chọn phòng ban --</option>
                      {Object.entries(userDepartment).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
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
                  <FormLabel>Vai trò</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full border border-gray-300 rounded-md p-2"
                      disabled={isPending}
                    >
                      <option value="">-- Chọn vai trò --</option>
                      {Object.entries(userRole).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-center gap-2 p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
              <Button type="submit" disabled={isPending} variant={"blue"}>
                Đăng ký
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
          </div>
        </div>

  );
};
