import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { privateApi } from "@/lib/api/client";
import { TOKEN_KEY } from "@/lib/auth-utils";

// 공개 경로 목록
const publicPaths = ["/", "/cms/login"];

export const config = {
  matcher: ["/cms/:path*"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("Middleware - Current path:", pathname);

  // /cms로 접근 시 /cms/menu로 리다이렉트
  if (pathname === "/cms") {
    console.log("Middleware - Redirecting /cms to /cms/menu");
    return NextResponse.redirect(new URL("/cms/menu", request.url));
  }

  // 공개 경로는 인증 체크를 하지 않음
  if (publicPaths.includes(pathname)) {
    console.log("Middleware - Public path, skipping auth check");
    return NextResponse.next();
  }

  // CMS 경로에 대해서만 인증 체크
  if (pathname.startsWith("/cms/")) {
    // 로그인 페이지는 인증 체크를 하지 않음
    if (pathname === "/cms/login") {
      console.log("Middleware - Login page, skipping auth check");
      return NextResponse.next();
    }

    const token = request.cookies.get(TOKEN_KEY)?.value;
    console.log("Middleware - Token found:", !!token);

    if (!token && pathname !== "/cms/login") {
      console.log("Middleware - No token, redirecting to login");
      const url = new URL("/cms/login", request.url);
      return NextResponse.redirect(url);
    }

    try {
      console.log("Middleware - Verifying token...");
      const response = await privateApi.get<{ success: boolean }>(
        "/auth/verify",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Middleware - Token verification response:", response);

      // 토큰 인증 성공 시 리다이렉트 없이 진행
      console.log("Middleware - Token verified, proceeding to requested page");
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware - Token verification failed:", error);
      const url = new URL("/cms/login", request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
