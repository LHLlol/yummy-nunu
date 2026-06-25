import type { ParseApiResponse, Submission } from "@/types/submission";
import { detectPlatform } from "./detectPlatform";
import { downloadVideoIfPossible } from "./downloadVideoIfPossible";
import { extractDishNameFromText } from "./extractDishNameFromText";
import { extractTextFromVideo } from "./extractTextFromVideo";
import { extractUrlFromText } from "./extractUrlFromText";
import { fetchMetadata } from "./fetchMetadata";
import { resolveShortUrl } from "./resolveShortUrl";

function createBaseSubmission(rawInput: string): Submission {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    rawInput,
    extractedUrl: null,
    resolvedUrl: null,
    sourcePlatform: "unsupported",
    title: null,
    author: null,
    coverUrl: null,
    videoUrl: null,
    textContent: rawInput,
    extractedDishName: null,
    dishCandidates: [],
    confidence: 0,
    parseStatus: "pending",
    errorMessage: null,
    readStatus: "unread",
    ownerStatus: "new",
    ownerNote: "",
    source: null,
    userAgent: null,
    isValidUrl: false,
    createdAt: now,
    updatedAt: now,
  };
}

function isValidHttpUrl(value: string | null) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function parseSubmissionClient(rawInput: string): Promise<ParseApiResponse> {
  const submission = createBaseSubmission(rawInput);

  if (!rawInput.trim()) {
    submission.parseStatus = "failed";
    submission.errorMessage = "怒怒没找到链接，再粘贴一次试试。";
    submission.updatedAt = new Date().toISOString();
    return {
      success: false,
      data: submission,
    };
  }

  const extractedUrl = extractUrlFromText(rawInput);
  submission.extractedUrl = extractedUrl;
  submission.resolvedUrl = extractedUrl;
  submission.isValidUrl = isValidHttpUrl(extractedUrl);

  if (!submission.isValidUrl || !extractedUrl) {
    submission.parseStatus = "failed";
    submission.errorMessage = "怒怒没找到正确的网址，请粘贴以 http:// 或 https:// 开头的链接。";
    submission.updatedAt = new Date().toISOString();
    return {
      success: false,
      data: submission,
    };
  }

  const validUrl = extractedUrl;
  const platform = detectPlatform(validUrl);
  submission.sourcePlatform = platform;

  if (platform === "unsupported") {
    submission.parseStatus = "saved_only";
    submission.textContent = rawInput;
    submission.errorMessage = null;
    submission.updatedAt = new Date().toISOString();
    return {
      success: true,
      data: submission,
    };
  }

  submission.parseStatus = "parsing";

  const { resolvedUrl } = await resolveShortUrl(validUrl, platform);
  submission.resolvedUrl = resolvedUrl;

  const metadata = await fetchMetadata(resolvedUrl, platform, rawInput);
  submission.title = metadata.title;
  submission.author = metadata.author;
  submission.coverUrl = metadata.coverUrl;

  const videoDownload = await downloadVideoIfPossible(resolvedUrl, platform);
  submission.videoUrl = videoDownload.videoUrl;

  const videoText = await extractTextFromVideo(videoDownload.videoUrl);
  const textContent = [metadata.title, metadata.description, videoText, videoDownload.reason]
    .filter(Boolean)
    .join("\n");

  submission.textContent = textContent;

  if (metadata.errorMessage) {
    submission.parseStatus = "saved_only";
    submission.errorMessage = "暂时无法自动解析，但链接已记录";
    submission.updatedAt = new Date().toISOString();
    return {
      success: false,
      data: submission,
    };
  }

  const dish = extractDishNameFromText(textContent);
  submission.extractedDishName = dish.dishName;
  submission.dishCandidates = dish.candidates;
  submission.confidence = dish.confidence;
  submission.parseStatus = "saved_only";
  submission.errorMessage = null;
  submission.updatedAt = new Date().toISOString();

  return {
    success: true,
    data: submission,
  };
}
