import { useCurrentUser } from "./use-current-user";

export const useRole = (...roles) => {
  const [user] = useCurrentUser();

  if (!user) {
    return false;
  }
  return roles.includes(user.role);
};
