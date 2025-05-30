"use client";

import { userRole, userSchema } from "@/schemas/user.schema";
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
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { editUserRole } from "@/actions/user-action";
import { useAction } from "@/hooks/use-action";

export const UserEditRoleButton = ({ data }) => {
  const [isOpen, setOpen] = useState(false);
  const { action, isPending } = useAction();
  const onSubmit = (values) => {
    action(
      {
        fn: editUserRole,
        onSuccess: () => {
          form.reset();
          setOpen(false);
        },
      },
      data.id,
      values
    );
  };
  const form = useForm({
    resolver: zodResolver(userSchema.editRoleSchema),
  });
  useEffect(() => {
    if (data) {
      form.setValue("role", data.role);
    }
  }, [data, isOpen]);
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          size={"sm"}
          disabled={isPending}
          className="min-w-[120px]"
        >
          <span className="text-sm font-semibold">
            {userRole[data.role] || "Giảng viên"}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Cập nhật vai trò</DialogTitle>
          <DialogDescription>
            Thay đổi quyền hạn của người dùng
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
