import { NextResponse } from "next/server";
import { auth } from "./lib/session";

const protectedRoutes = ["/home"];
const publicRoutes = ["/"];

export default async function middleware(req) {
  if (req.method !== "GET") {
    return NextResponse.next();
  }
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute =
    protectedRoutes.includes(path) || req.nextUrl.pathname.startsWith("/home");
  const isPublicRoute = publicRoutes.includes(path);

  // 3. Decrypt the session from the cookie
  const user = await auth();

  // 4. Redirect to /login if the user is not authenticated

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // 5. Redirect to /home if the user is authenticated
  if (isPublicRoute && user && !req.nextUrl.pathname.startsWith("/home")) {
    return NextResponse.redirect(new URL("/home", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
