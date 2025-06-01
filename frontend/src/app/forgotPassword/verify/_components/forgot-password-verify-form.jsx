"use client";

import { resetForgotPasswordOtp } from "@/actions/auth-action";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAction } from "@/hooks/use-action";
import { authSchema } from "@/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const ForgotPasswordVerifyOtpForm = ({ token }) => {
  const router = useRouter();
  const { action, isPending } = useAction();
  const [submitCount, setSubmitCount] = useState(0);

  const MAX_SUBMIT_FORGOT_PASSWORD = 5;

  const onSubmit = (values) => {
    action(
      {
        fn: resetForgotPasswordOtp,
        onSuccess: () => {
          router.replace("/");
        },
        onError: () => {
          if (submitCount >= MAX_SUBMIT_FORGOT_PASSWORD) {
            router.replace("/");
          }
          setSubmitCount((prev) => prev + 1);
        },
      },
      token,
      values
    );
  };
  const form = useForm({
    resolver: zodResolver(authSchema.verifyForgotPasswordSchema),
    defaultValues: {
      otp: "",
      newPassword: "",
      newPasswordConfirmed: "",
    },
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Đổi mật khẩu</CardTitle>
        <CardDescription>Nhập mã OTP để đổi mật khẩu mới</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OTP</FormLabel>
                  <FormControl>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isPending}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormControl>
                  <FormDescription className="flex justify-center">
                    Nhập mã OTP đã gửi qua email
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={"Nhập mật khẩu mới"}
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
            <FormField
              control={form.control}
              name="newPasswordConfirmed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={"Xác nhận mật khẩu mới"}
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
                Xác nhận
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
