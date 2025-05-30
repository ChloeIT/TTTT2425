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
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { editCurrentUser } from "@/actions/user-action";
import { useAction } from "@/hooks/use-action";

export const EditProfileDialog = ({ isOpen, setOpen, data }) => {
  const { isPending, action } = useAction();

  const onSubmit = (values) => {
    action(
      {
        fn: editCurrentUser,
        onSuccess: () => {
          setOpen(false);
        },
        onError: () => {},
      },
      values
    );
  };
  const form = useForm({
    resolver: zodResolver(userSchema.updateSchema),
  });
  useEffect(() => {
    if (data) {
      form.setValue("email", data.email);
      form.setValue("fullName", data.fullName);
      form.setValue("username", data.username);
    }
  }, [data, isOpen]);
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Cập nhật tài khoản</DialogTitle>
          <DialogDescription>Cập nhật thông tin tài khoản</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

export const EditProfileButton = ({ setOpen }) => {
  return <button onClick={setOpen}>Cập nhật tài khoản</button>;
};
