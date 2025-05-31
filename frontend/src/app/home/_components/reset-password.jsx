"use client";
import { userSchema } from "@/schemas/user.schema";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resetUserPassword } from "@/actions/user-action";
import { useAction } from "@/hooks/use-action";
import { Key } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const ResetPasswordDialog = ({ isOpen, setOpen }) => {
  const { isPending, action } = useAction();
  const router = useRouter();
  const onSubmit = (values) => {
    action(
      {
        fn: resetUserPassword,
        onSuccess: () => {
          setOpen(false);
          router.replace("/");
        },
        onError: () => {},
      },
      values
    );
  };
  const form = useForm({
    resolver: zodResolver(userSchema.resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      newPasswordConfirmed: "",
      password: "",
    },
  });
  useEffect(() => {
    form.reset();
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Đổi mật khẩu</DialogTitle>
          <DialogDescription>Đổi mật khẩu tài khoản</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu củ</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={"Nhập mật khẩu củ"}
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
              <Button
                type="button"
                variant="secondary"
                disabled={isPending}
                onClick={() => setOpen(false)}
              >
                Đóng
              </Button>

              <Button type="submit" disabled={isPending} variant={"blue"}>
                Cập nhật
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export const ResetPasswordButton = ({ setOpen }) => {
  return (
    <button onClick={setOpen} className="flex gap-x-2">
      <Key className="h-4 w-4" />
      Đổi mật khẩu
    </button>
  );
};
