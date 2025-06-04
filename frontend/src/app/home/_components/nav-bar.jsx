import { ModeToggle } from "@/components/mode-toggle";
import { ProfileButton } from "./profile-button";
import { NotificationButton } from "./notification-button";

export const NavBar = async () => {
  return (
    <div
      className="
      flex items-center gap-x-2 lg:justify-between py-4 px-6 h-16 
      shadow-md backdrop-blur-sm 
      fixed top-0 z-50 transition-all w-full 
      right-0 border-r border-t border-b-2 rounded-sm"
    >
      <div className="flex flex-1 gap-x-2 items-center justify-end">
        <NotificationButton />
        <ModeToggle />

        <ProfileButton />
      </div>
    </div>
  );
};
