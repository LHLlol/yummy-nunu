import type { SourcePlatform } from "@/types/submission";

export interface VideoDownloadResult {
  videoUrl: string | null;
  reason: string | null;
}

export async function downloadVideoIfPossible(
  _resolvedUrl: string,
  platform: SourcePlatform,
): Promise<VideoDownloadResult> {
  if (platform === "unsupported") {
    return {
      videoUrl: null,
      reason: "暂不支持该平台视频解析",
    };
  }

  return {
    videoUrl: null,
    reason:
      "第一版不绕过平台登录、权限、风控或版权限制，仅预留公开视频资源解析接口",
  };
}
