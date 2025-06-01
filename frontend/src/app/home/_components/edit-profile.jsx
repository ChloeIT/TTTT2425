"use client";
import { userDepartment, userSchema } from "@/schemas/user.schema";
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
import { editProfile } from "@/actions/user-action";
import { useAction } from "@/hooks/use-action";
import { User2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname } from "next/navigation";

export const EditProfileDialog = ({
  isOpen,
  setOpen,
  data,
  setProfileUpdated,
}) => {
  const { isPending, action } = useAction();
  const pathname = usePathname();
  const onSubmit = (values) => {
    action(
      {
        fn: editProfile,
        onSuccess: () => {
          setOpen(false);
          setProfileUpdated(true);
        },
        onError: () => {},
      },
      values,
      pathname
    );
  };
  const form = useForm({
    resolver: zodResolver(userSchema.editProfileSchema),
  });
  useEffect(() => {
    if (data) {
      form.setValue("fullName", data.fullName);
      form.setValue("username", data.username);
      form.setValue("department", data.department);
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
                    disabled
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
  return (
    <button onClick={setOpen} className="flex gap-x-2">
      <User2 className="h-4 w-4" />
      Cập nhật tài khoản
    </button>
  );
};
