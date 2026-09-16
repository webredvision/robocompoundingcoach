import { NextResponse } from "next/server";

// APIs where POST/PUT/PATCH should be allowed (including sub-routes)
const ALLOWED_WRITE_APIS = [
  "/api/advisor-scheme-category",
  "/api/advisor-scheme-category-funds",
  "/api/amc-category",
  "/api/amc-logos",
  "/api/app-links",
  "/api/app-redirect",
  "/api/bot",
  "/api/compare-funds",
  "/api/email",
  "/api/leads",
  "/api/financialhealthuser",
  "/api/forget-password",
  "/api/forgot-password",
  "/api/research-calculator",
  "/api/reset-password",
  "/api/riskcalculator",
  "/api/submit-forget-password",
  "/api/login",
  "/api/financialhealth",
  "/api/calculators",
  "/api/subscription",
  "/api/risk-questions",
  "/api/uploads",
  "/api/verify-old-password",
  "/api/generate-pdf",
  "/api/submit-forget-password-otp",
  "/api/change-password",
  "/api/permissions",
  "/api/robo",
  "/api/robomodel",
  "/api/admin/services"
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  // 🔴 Block admin & devadmin completely
  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/devadmin" ||
    pathname.startsWith("/devadmin/")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const blockedMethods = ["POST", "PUT", "PATCH"];

  if (blockedMethods.includes(method)) {
    const isAllowed = ALLOWED_WRITE_APIS.some(
      (allowedPath) =>
        pathname === allowedPath ||
        pathname.startsWith(`${allowedPath}/`)
    );

    if (!isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Method not allowed",
        },
        { status: 405 }
      );
    }
  }

  return NextResponse.next();
}

// ✅ Middleware runs on APIs + admin/devadmin
export const config = {
  matcher: [
    "/api/:path*",
    "/admin/:path*",
    "/devadmin/:path*"
  ],
};