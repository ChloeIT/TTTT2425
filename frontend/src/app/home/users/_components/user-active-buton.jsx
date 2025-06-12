"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
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
import { useAction } from "@/hooks/use-action";

export const UserActiveButton = ({ data, disabled }) => {
  const [isOpen, setOpen] = useState(false);

  const { action, isPending } = useAction();
  const handleActiveUser = () => {
    action(
      {
        fn: activeUser,
      },
      data.id,
      data.isActive
    );
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
          disabled={isPending || disabled}
          className="min-w-[120px]"
          onClick={() => setOpen(true)}
        >
          <span className="text-sm font-semibold">Kích hoạt</span>
        </Button>
      ) : (
        <Button
          variant={"destructive"}
          size={"sm"}
          disabled={isPending || disabled}
          className="min-w-[120px]"
          onClick={() => setOpen(true)}
        >
          <span className="text-sm font-semibold">Đã ngừng</span>
        </Button>
      )}
    </>
  );
};