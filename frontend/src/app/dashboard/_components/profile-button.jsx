"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/use-current-user";
import { User } from "lucide-react";
import { LogoutButton } from "./logout-button";
import { EditProfileButton, EditProfileDialog } from "./edit-profile";
import { useState } from "react";

export const ProfileButton = () => {
  const [isEditProfile, setEditProfile] = useState(false);
  const [user] = useCurrentUser();
  return (
    <>
      <EditProfileDialog
        data={user}
        isOpen={isEditProfile}
        setOpen={setEditProfile}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size={"icon"} variant="outline">
            <User />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Quản lý tài khoản</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>
            <span className="block text-sm text-gray-900 dark:text-white">
              {user?.fullName}
            </span>
            <span className="block text-sm  text-gray-500 truncate dark:text-gray-400">
              {user?.email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <EditProfileButton setOpen={() => setEditProfile(true)} />
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogoutButton />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
