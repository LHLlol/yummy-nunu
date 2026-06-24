import { NextResponse } from "next/server";

const DEFAULT_ADMIN_ENTRY_CODE = "lhl20040919";
const VAULT_COOKIE = "nunu_vault_access";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: unknown };
    const code = typeof body.code === "string" ? body.code.trim() : "";
    const expectedCode = process.env.ADMIN_ENTRY_CODE ?? DEFAULT_ADMIN_ENTRY_CODE;

    if (code !== expectedCode) {
      return NextResponse.json(
        {
          success: false,
          message: "暗号错误",
        },
        { status: 401 },
      );
    }

    const response = NextResponse.json({
      success: true,
      redirectTo: "/nunu-vault",
    });

    response.cookies.set(VAULT_COOKIE, "true", {
      httpOnly: true,
      maxAge: 60 * 60 * 2,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "暗号错误",
      },
      { status: 400 },
    );
  }
}
