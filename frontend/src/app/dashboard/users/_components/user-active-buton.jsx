"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { activeUser } from "@/actions/user-action";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const UserActiveButton = ({ data }) => {
  const [isOpen, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const handleActiveUser = () => {
    startTransition(() => {
      activeUser(data.id, data.isActive)
        .then(({ message, ok }) => {
          if (ok) {
            toast.success(message);
          } else {
            toast.error(message);
          }
        })
        .catch((error) => {
          //error from server
          toast.error("Lỗi hệ thống, vui lòng thử lại sau");
        });
    });
  };

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hành động</AlertDialogTitle>
            <AlertDialogDescription>
              {data.isActive
                ? " Xác nhận vô hiệu hóa tài khoản!!!"
                : "Xác nhận kích hoạt tài khoản"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Trở lại</AlertDialogCancel>
            <AlertDialogAction onClick={handleActiveUser}>
              Tiếp tục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {data.isActive ? (
        <Button
          variant={"success"}
          size={"sm"}
          disabled={isPending}
          className="min-w-[120px]"
          onClick={() => setOpen(true)}
        >
          <span className="text-sm font-semibold">Kích hoạt</span>
        </Button>
      ) : (
        <Button
          variant={"destructive"}
          size={"sm"}
          disabled={isPending}
          className="min-w-[120px]"
          onClick={() => setOpen(true)}
        >
          <span className="text-sm font-semibold">Đã ngừng</span>
        </Button>
      )}
    </>
  );
};
