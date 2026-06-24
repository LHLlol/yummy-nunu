import { NextResponse } from "next/server";
import { deleteSubmission, updateSubmission } from "@/lib/storage/saveSubmission";
import type { ReadStatus, Submission } from "@/types/submission";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

interface SubmissionUpdateBody {
  readStatus?: unknown;
  ownerNote?: unknown;
  ownerStatus?: unknown;
}

function isReadStatus(value: unknown): value is ReadStatus {
  return value === "read" || value === "unread";
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json()) as SubmissionUpdateBody;

  if (body.readStatus !== undefined && !isReadStatus(body.readStatus)) {
    return NextResponse.json(
      {
        success: false,
        message: "读取状态不正确",
      },
      { status: 400 },
    );
  }

  const updatedSubmission = await updateSubmission(id, {
    readStatus: body.readStatus,
    ownerNote: typeof body.ownerNote === "string" ? body.ownerNote : undefined,
    ownerStatus: typeof body.ownerStatus === "string" ? body.ownerStatus : undefined,
  });

  if (!updatedSubmission) {
    return NextResponse.json(
      {
        success: false,
        message: "没有找到这条心愿",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: updatedSubmission,
  } satisfies { success: true; data: Submission });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const deleted = await deleteSubmission(id);

  if (!deleted) {
    return NextResponse.json(
      {
        success: false,
        message: "没有找到这条心愿",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
  });
}
