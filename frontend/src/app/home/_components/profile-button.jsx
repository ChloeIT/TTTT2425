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
import { useProfile } from "@/hooks/use-profile";
import { User } from "lucide-react";
import { LogoutButton } from "./logout-button";
import { EditProfileButton, EditProfileDialog } from "./edit-profile";
import { useState } from "react";
import { ResetPasswordButton, ResetPasswordDialog } from "./reset-password";
import { Badge } from "@/components/ui/badge";
import { userRole } from "@/schemas/user.schema";

export const ProfileButton = () => {
  const [isEditProfile, setEditProfile] = useState(false);
  const [isResetPassword, setResetPassword] = useState(false);
  const { user, setProfileUpdated } = useProfile();

  return (
    <>
      <EditProfileDialog
        data={user}
        isOpen={isEditProfile}
        setOpen={setEditProfile}
        setProfileUpdated={setProfileUpdated}
      />
      <ResetPasswordDialog
        isOpen={isResetPassword}
        setOpen={setResetPassword}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size={"icon"} variant="outline">
            <User />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60">
          <DropdownMenuLabel>Quản lý tài khoản</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>
            <span className="block">
              <Badge variant={"green"}>{userRole[user?.role]}</Badge>
            </span>
            <span className="block text-sm truncate text-gray-900 dark:text-white">
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
              <ResetPasswordButton setOpen={() => setResetPassword(true)} />
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
