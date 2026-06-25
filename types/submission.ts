export type SourcePlatform = "douyin" | "xiaohongshu" | "unsupported";

export type ParseStatus =
  | "pending"
  | "parsing"
  | "success"
  | "failed"
  | "saved_only";

export type ReadStatus = "unread" | "read";

export type OwnerStatus = "new" | "wanted" | "planned" | "cooked" | "ignored";

export interface Submission {
  id: string;
  rawInput: string;
  extractedUrl: string | null;
  resolvedUrl: string | null;
  sourcePlatform: SourcePlatform;
  title: string | null;
  author: string | null;
  coverUrl: string | null;
  videoUrl: string | null;
  textContent: string;
  extractedDishName: string | null;
  dishCandidates: string[];
  confidence: number;
  parseStatus: ParseStatus;
  errorMessage: string | null;
  readStatus: ReadStatus;
  ownerStatus: OwnerStatus;
  ownerNote: string;
  source: string | null;
  userAgent: string | null;
  isValidUrl: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ParseApiResponse {
  success: boolean;
  data: Submission;
}
