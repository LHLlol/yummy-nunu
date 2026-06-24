import type { Submission } from "@/types/submission";
import { saveSubmission } from "@/lib/storage/saveSubmission";
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
    textContent: "",
    extractedDishName: null,
    dishCandidates: [],
    confidence: 0,
    parseStatus: "pending",
    errorMessage: null,
    readStatus: "unread",
    ownerStatus: null,
    ownerNote: null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function parseSubmission(rawInput: string): Promise<Submission> {
  const submission = createBaseSubmission(rawInput);

  if (!submission.rawInput.trim()) {
    submission.parseStatus = "failed";
    submission.errorMessage = "怒怒没找到链接，再粘贴一次试试。";
    submission.updatedAt = new Date().toISOString();
    return saveSubmission(submission);
  }

  const extractedUrl = extractUrlFromText(submission.rawInput);
  submission.extractedUrl = extractedUrl;

  if (!extractedUrl) {
    submission.parseStatus = "failed";
    submission.textContent = submission.rawInput;
    submission.errorMessage = "怒怒没找到链接，再粘贴一次试试。";
    submission.updatedAt = new Date().toISOString();
    return saveSubmission(submission);
  }

  const platform = detectPlatform(extractedUrl);
  submission.sourcePlatform = platform;

  if (platform === "unsupported") {
    submission.parseStatus = "failed";
    submission.textContent = submission.rawInput;
    submission.errorMessage = "怒怒现在只认识抖音和小红书链接。";
    submission.updatedAt = new Date().toISOString();
    return saveSubmission(submission);
  }

  submission.parseStatus = "parsing";

  const { resolvedUrl } = await resolveShortUrl(extractedUrl, platform);
  submission.resolvedUrl = resolvedUrl;

  const metadata = await fetchMetadata(resolvedUrl, platform, submission.rawInput);
  submission.title = metadata.title;
  submission.author = metadata.author;
  submission.coverUrl = metadata.coverUrl;

  const videoDownload = await downloadVideoIfPossible(resolvedUrl, platform);
  submission.videoUrl = videoDownload.videoUrl;

  const videoText = await extractTextFromVideo(videoDownload.videoUrl);
  const textContent = [
    metadata.title,
    metadata.description,
    videoText,
    videoDownload.reason,
  ]
    .filter(Boolean)
    .join("\n");

  submission.textContent = textContent;

  if (metadata.errorMessage) {
    submission.parseStatus = "saved_only";
    submission.errorMessage = "暂时无法自动解析，但链接已记录";
    submission.updatedAt = new Date().toISOString();
    return saveSubmission(submission);
  }

  const dish = extractDishNameFromText(textContent);
  submission.extractedDishName = dish.dishName;
  submission.dishCandidates = dish.candidates;
  submission.confidence = dish.confidence;
  submission.parseStatus = "success";
  submission.errorMessage = dish.confidence < 0.35 ? (dish.message ?? null) : null;
  submission.updatedAt = new Date().toISOString();

  return saveSubmission(submission);
}
