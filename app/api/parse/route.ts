import { NextResponse } from "next/server";
import { parseSubmission } from "@/lib/parser/parseSubmission";
import type { ParseApiResponse } from "@/types/submission";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { rawInput?: unknown };

    if (typeof body.rawInput !== "string") {
      return NextResponse.json(
        {
          success: false,
          data: await parseSubmission(""),
        } satisfies ParseApiResponse,
        { status: 400 },
      );
    }

    const data = await parseSubmission(body.rawInput);

    return NextResponse.json({
      success: data.parseStatus === "success",
      data,
    } satisfies ParseApiResponse);
  } catch {
    const data = await parseSubmission("");
    data.errorMessage = "怒怒被辣到打了个喷嚏，请稍后再试。";

    return NextResponse.json(
      {
        success: false,
        data,
      } satisfies ParseApiResponse,
      { status: 500 },
    );
  }
}
