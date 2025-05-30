"use client";

import { logout } from "@/actions/auth-action";
import { useAction } from "@/hooks/use-action";
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
    <button disabled={isPending} onClick={handleLogout}>
      Đăng xuất
    </button>
  );
};
