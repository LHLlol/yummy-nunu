import type { SourcePlatform } from "@/types/submission";

export interface MetadataResult {
  title: string | null;
  author: string | null;
  description: string;
  coverUrl: string | null;
  errorMessage: string | null;
}

const SHARE_STOP_WORDS = [
  "复制",
  "打开抖音",
  "打开小红书",
  "看看",
  "链接",
  "笔记立刻呈现",
  "我在抖音发现",
  "我在小红书发现",
];

function deriveTitleFromRawInput(rawInput: string): string | null {
  const cleanedLines = rawInput
    .split(/\n+/)
    .map((line) =>
      line
        .replace(/https?:\/\/\S+/gi, "")
        .replace(/#([^#\s]+)/g, "$1")
        .replace(/[【】<>《》]/g, "")
        .trim(),
    )
    .filter(Boolean)
    .filter((line) => !SHARE_STOP_WORDS.some((word) => line.includes(word)))
    .filter((line) => /[\u4e00-\u9fa5]/.test(line));

  return cleanedLines[0]?.slice(0, 42) ?? null;
}

export async function fetchMetadata(
  resolvedUrl: string,
  platform: SourcePlatform,
  rawInput: string,
): Promise<MetadataResult> {
  if (platform === "unsupported") {
    return {
      title: null,
      author: null,
      description: rawInput,
      coverUrl: null,
      errorMessage: "怒怒现在只认识抖音和小红书链接。",
    };
  }

  const titleFromInput = deriveTitleFromRawInput(rawInput);
  const platformName = platform === "douyin" ? "抖音" : "小红书";

  return {
    title: titleFromInput ?? `${platformName}里那份让人坐不住的神秘下饭菜`,
    author: `${platformName}分享者`,
    description: rawInput || resolvedUrl,
    coverUrl: null,
    errorMessage: null,
  };
}
