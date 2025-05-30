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
import { editUserDepartment } from "@/actions/user-action";
import { useAction } from "@/hooks/use-action";

export const UserEditDepartmentButton = ({ data }) => {
  const [isOpen, setOpen] = useState(false);

  const { action, isPending } = useAction();
  const onSubmit = (values) => {
    action(
      {
        fn: editUserDepartment,
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
    resolver: zodResolver(userSchema.editDepartmentSchema),
  });
  useEffect(() => {
    if (data) {
      form.setValue("department", data.department);
    }
  }, [data, isOpen]);
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          size={"sm"}
          disabled={isPending}
          className="min-w-[150px]"
        >
          <span className="text-sm font-semibold">
            {userDepartment[data.department] || "Mặc định"}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Cập nhật khoa công tác</DialogTitle>
          <DialogDescription>
            Cập nhật khoa công tác của người dùng
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <SelectValue placeholder="Chọn khoa công tác" />
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
