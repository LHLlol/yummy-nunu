import type { SourcePlatform } from "@/types/submission";

export function detectPlatform(url: string | null): SourcePlatform {
  if (!url) {
    return "unsupported";
  }

  try {
    const host = new URL(url).hostname.toLowerCase();

    if (
      host === "v.douyin.com" ||
      host.endsWith(".douyin.com") ||
      host.includes("douyin.com") ||
      host.includes("iesdouyin.com")
    ) {
      return "douyin";
    }

    if (
      host === "xhslink.com" ||
      host.endsWith(".xhslink.com") ||
      host.includes("xiaohongshu.com") ||
      host.includes("xhslink.com")
    ) {
      return "xiaohongshu";
    }
  } catch {
    return "unsupported";
  }

  return "unsupported";
}
