import { ModeToggle } from "@/components/mode-toggle";
import { ProfileButton } from "./profile-button";
import { NotificationButton } from "./notification-button";
import Link from "next/link";

export const NavBar = async () => {
  return (
    <div
      className="
      py-4 px-6 h-16 
      shadow-md backdrop-blur-sm 
      fixed top-0 z-50 transition-all w-full 
      right-0 border-r border-t border-b-2 rounded-sm"
    >
      <div className="max-w-6xl mx-auto w-full flex items-center gap-x-2">
        <Link href={"/home"} className="font-semibold underline">
          Trang chủ
        </Link>
        <div className="flex flex-1 gap-x-2 items-center justify-end">
          <NotificationButton />
          <ModeToggle />

          <ProfileButton />
        </div>
      </div>
    </div>
  );
};
