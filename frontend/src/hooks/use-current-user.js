import { currentUser } from "@/actions/auth-action";
import { useEffect, useState } from "react";

export const useCurrentUser = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchCurrentUser() {
      const { ok, data } = await currentUser();
      if (ok) {
        setUser(data.user);
      }
    }
    fetchCurrentUser();
  }, []);
  return [user];
};
