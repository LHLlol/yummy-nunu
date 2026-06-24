import type { SourcePlatform } from "@/types/submission";

export interface ResolveShortUrlResult {
  resolvedUrl: string;
  wasResolved: boolean;
  reason: string | null;
}

export async function resolveShortUrl(
  url: string,
  platform: SourcePlatform,
): Promise<ResolveShortUrlResult> {
  if (platform === "unsupported") {
    return {
      resolvedUrl: url,
      wasResolved: false,
      reason: "暂不支持该平台链接",
    };
  }

  return {
    resolvedUrl: url,
    wasResolved: false,
    reason: "第一版先保留短链原文，后续可在合规范围内接入跳转展开",
  };
}
