import { currentUser } from "@/actions/auth-action";
import { useEffect, useState } from "react";

export const useProfile = () => {
  const [user, setUser] = useState(null);
  const [isProfileUpdated, setProfileUpdated] = useState(true);
  useEffect(() => {
    async function fetchCurrentUser() {
      const { ok, data } = await currentUser();
      if (ok) {
        setUser(data.user);
      }
    }
    if (isProfileUpdated) {
      fetchCurrentUser();
      setProfileUpdated(false);
    }
  }, [isProfileUpdated]);
  return {
    user,
    setProfileUpdated,
  };
};
