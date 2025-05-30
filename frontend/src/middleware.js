import { NextResponse } from "next/server";
import { auth } from "./lib/session";

const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/"];

export default async function middleware(req) {
  if (req.method !== "GET") {
    return NextResponse.next();
  }
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute =
    protectedRoutes.includes(path) ||
    req.nextUrl.pathname.startsWith("/dashboard");
  const isPublicRoute = publicRoutes.includes(path);

  // 3. Decrypt the session from the cookie
  const user = await auth();

  // 4. Redirect to /login if the user is not authenticated

  if (isProtectedRoute && !user) {
    console.log(req.nextUrl);
    // bị lỗi ở chỗ này, nếu comment mục 4 đi thì không có lỗi
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // 5. Redirect to /dashboard if the user is authenticated
  if (isPublicRoute && user && !req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
