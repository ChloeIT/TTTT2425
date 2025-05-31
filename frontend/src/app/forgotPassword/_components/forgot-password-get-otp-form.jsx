"use client";

import { createForgotPasswordOtp } from "@/actions/auth-action";
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
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export const ForgotPasswordGetOtpForm = () => {
  const router = useRouter();
  const { action, isPending } = useAction();
  const onSubmit = (values) => {
    action(
      {
        fn: createForgotPasswordOtp,
        onSuccess: (data) => {
          if (data?.token) {
            router.push(`/forgotPassword/verify?token=${data.token}`);
          }
        },
      },
      values
    );
  };
  const form = useForm({
    resolver: zodResolver(authSchema.getForgotPasswordOtpSchema),
    defaultValues: {
      email: "",
    },
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Quên mật khẩu</CardTitle>
        <CardDescription>
          Nhập email để xác nhận đổi mật khẩu mới
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={"Nhập email của tài khoản"}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-center gap-2 p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
              <Button type="submit" disabled={isPending} variant={"blue"}>
                Xác nhận
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
