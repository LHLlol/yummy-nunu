import type { ReadStatus, Submission } from "@/types/submission";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const storageDirectory = path.join(process.cwd(), ".data");
const storageFile = path.join(storageDirectory, "submissions.json");

function normalizeSubmission(submission: Partial<Submission>): Submission {
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
    parseStatus: submission.parseStatus ?? "failed",
    errorMessage: submission.errorMessage ?? null,
    readStatus: submission.readStatus ?? "unread",
    ownerStatus: submission.ownerStatus ?? null,
    ownerNote: submission.ownerNote ?? null,
    createdAt,
    updatedAt: submission.updatedAt ?? createdAt,
  };
}

async function readSubmissions(): Promise<Submission[]> {
  try {
    const file = await readFile(storageFile, "utf8");
    const parsed = JSON.parse(file) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((submission) => normalizeSubmission(submission as Partial<Submission>));
  } catch {
    return [];
  }
}

async function writeSubmissions(submissions: Submission[]) {
  await mkdir(storageDirectory, { recursive: true });
  await writeFile(storageFile, JSON.stringify(submissions, null, 2), "utf8");
}

export async function saveSubmission(submission: Submission): Promise<Submission> {
  const normalizedSubmission = normalizeSubmission(submission);
  const submissions = await readSubmissions();
  submissions.unshift(normalizedSubmission);
  await writeSubmissions(submissions);
  return normalizedSubmission;
}

export async function listSubmissions(): Promise<Submission[]> {
  return readSubmissions();
}

export async function updateSubmission(
  id: string,
  updates: {
    readStatus?: ReadStatus;
    ownerNote?: string | null;
    ownerStatus?: string | null;
  },
): Promise<Submission | null> {
  const submissions = await readSubmissions();
  const index = submissions.findIndex((submission) => submission.id === id);

  if (index === -1) {
    return null;
  }

  const updatedSubmission = normalizeSubmission({
    ...submissions[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  });

  submissions[index] = updatedSubmission;
  await writeSubmissions(submissions);

  return updatedSubmission;
}

export async function deleteSubmission(id: string): Promise<boolean> {
  const submissions = await readSubmissions();
  const nextSubmissions = submissions.filter((submission) => submission.id !== id);

  if (nextSubmissions.length === submissions.length) {
    return false;
  }

  await writeSubmissions(nextSubmissions);

  return true;
}
