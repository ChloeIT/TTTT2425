import { useProfile } from "./use-profile";

export const useRole = (...roles) => {
  const { user } = useProfile();

  if (!user) {
    return false;
  }
  return roles.includes(user.role);
};
