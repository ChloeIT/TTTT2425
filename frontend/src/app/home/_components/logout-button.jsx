"use client";

import { logout } from "@/actions/auth-action";
import { useAction } from "@/hooks/use-action";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export const LogoutButton = () => {
  const { action, isPending } = useAction();
  const router = useRouter();
  const handleLogout = () => {
    action({
      fn: logout,
      onSuccess: () => {
        router.replace("/");
      },
    });
  };
  return (
    <button
      disabled={isPending}
      onClick={handleLogout}
      className="flex gap-x-2"
    >
      <LogOut className="h-4 w-4" />
      Đăng xuất
    </button>
  );
};
