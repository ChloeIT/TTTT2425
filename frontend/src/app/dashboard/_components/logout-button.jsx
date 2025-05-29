"use client";

import { logout } from "@/actions/auth-action";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export const LogoutButton = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const handleLogout = () => {
    startTransition(() => {
      logout();
      router.replace("/");
    });
  };
  return (
    <button disabled={isPending} onClick={handleLogout}>
      Đăng xuất
    </button>
  );
};
