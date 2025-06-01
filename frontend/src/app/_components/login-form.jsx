"use client";
import { login } from "@/actions/auth-action";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAction } from "@/hooks/use-action";
import { authSchema } from "@/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export const LoginForm = () => {
  const router = useRouter();
  const { action, isPending } = useAction();
  const onSubmit = (values) => {
    action(
      {
        fn: login,
        onSuccess: () => {
          router.push("/home");
        },
      },
      values
    );
  };
  const form = useForm({
    resolver: zodResolver(authSchema.loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Đăng nhập</CardTitle>
        <CardDescription>
          Nhập tài khoản và mật khẩu để đăng nhập tài khoản
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tài khoản</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={"Nhập username hoặc email của tài khoản"}
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
                  <div className="flex items-center">
                    <FormLabel>Mật khẩu</FormLabel>
                    <Link
                      href={"/forgotPassword"}
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      placeholder={"Nhập mật khẩu của tài khoản"}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isPending}
                      type="password"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-center gap-2 p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
              <Button type="submit" disabled={isPending} variant={"blue"}>
                Đăng nhập
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
