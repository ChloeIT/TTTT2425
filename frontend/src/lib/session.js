import { cookies } from "next/headers";
import instanceAPI from "./axios";
// import { redirect } from "next/navigation"; // Bạn có thể bật lại nếu cần redirect sau này

export const createSession = async (token) => {
  const cookieStore = await cookies();

  cookieStore.set("token", token, {
    maxAge: 60 * 60,
    sameSite: "strict",
    httpOnly: true,
  });
};

export const deleteSession = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("token");
};

export const auth = async () => {
  try {
    const res = await instanceAPI.get("/currentUser");
    return res.data?.data?.user;
  } catch (error) {
    return null;
  }
};

export const requireRole = async (...roles) => {
  const user = await auth();
  if (!user) {
    return false;
  }
  return roles.includes(user.role);
};
