import type { ReadStatus, Submission } from "@/types/submission";

const SUBMISSIONS_STORAGE_KEY = "nunu_submissions";
const LEGACY_STORAGE_KEYS = ["submissions"];

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function normalizeLocalSubmission(submission: Partial<Submission>): Submission {
  const createdAt = submission.createdAt ?? new Date().toISOString();

  return {
    id: submission.id ?? crypto.randomUUID(),
    rawInput: submission.rawInput ?? "",
    extractedUrl: submission.extractedUrl ?? null,
    resolvedUrl: submission.resolvedUrl ?? null,
    sourcePlatform: submission.sourcePlatform ?? "unsupported",
    title: submission.title ?? null,
    author: submission.author ?? null,
    coverUrl: submission.coverUrl ?? null,
    videoUrl: submission.videoUrl ?? null,
    textContent: submission.textContent ?? "",
    extractedDishName: submission.extractedDishName ?? null,
    dishCandidates: submission.dishCandidates ?? [],
    confidence: submission.confidence ?? 0,
    parseStatus: submission.parseStatus ?? "saved_only",
    errorMessage: submission.errorMessage ?? null,
    readStatus: submission.readStatus ?? "unread",
    ownerStatus: submission.ownerStatus ?? "new",
    ownerNote: submission.ownerNote ?? null,
    createdAt,
    updatedAt: submission.updatedAt ?? createdAt,
  };
}

function parseStoredSubmissions(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((submission) => normalizeLocalSubmission(submission as Partial<Submission>));
  } catch {
    return [];
  }
}

function writeLocalSubmissions(submissions: Submission[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions));
}

export function readLocalSubmissions(): Submission[] {
  if (!canUseStorage()) {
    return [];
  }

  const primarySubmissions = parseStoredSubmissions(
    window.localStorage.getItem(SUBMISSIONS_STORAGE_KEY),
  );

  if (primarySubmissions.length > 0) {
    return primarySubmissions;
  }

  for (const key of LEGACY_STORAGE_KEYS) {
    const legacySubmissions = parseStoredSubmissions(window.localStorage.getItem(key));

    if (legacySubmissions.length > 0) {
      writeLocalSubmissions(legacySubmissions);
      return legacySubmissions;
    }
  }

  return [];
}

export function saveLocalSubmission(submission: Submission): Submission {
  const normalizedSubmission = normalizeLocalSubmission(submission);
  const submissions = readLocalSubmissions();
  const nextSubmissions = [
    normalizedSubmission,
    ...submissions.filter((item) => item.id !== normalizedSubmission.id),
  ];

  writeLocalSubmissions(nextSubmissions);
  return normalizedSubmission;
}

export function updateLocalSubmission(
  id: string,
  updates: {
    readStatus?: ReadStatus;
    ownerStatus?: string | null;
    ownerNote?: string | null;
  },
): Submission | null {
  const submissions = readLocalSubmissions();
  const index = submissions.findIndex((submission) => submission.id === id);

  if (index === -1) {
    return null;
  }

  const updatedSubmission = normalizeLocalSubmission({
    ...submissions[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  });

  const nextSubmissions = [...submissions];
  nextSubmissions[index] = updatedSubmission;
  writeLocalSubmissions(nextSubmissions);

  return updatedSubmission;
}

export function deleteLocalSubmission(id: string): boolean {
  const submissions = readLocalSubmissions();
  const nextSubmissions = submissions.filter((submission) => submission.id !== id);

  if (nextSubmissions.length === submissions.length) {
    return false;
  }

  writeLocalSubmissions(nextSubmissions);
  return true;
}
