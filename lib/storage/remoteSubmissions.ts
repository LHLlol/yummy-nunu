import type { OwnerStatus, ParseStatus, ReadStatus, SourcePlatform, Submission } from "@/types/submission";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "") ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const LINKS_SELECT = "id,url,created_at,updated_at,source,user_agent,is_valid,payload";
const LOCAL_SUBMISSIONS_STORAGE_KEY = "nunu_submissions";

export const SUPABASE_CONFIG_MISSING_MESSAGE =
  "线上数据库还没有配置，请在 GitHub Secrets 中设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY。";

export class SubmissionStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubmissionStorageError";
  }
}

interface LinkRow {
  id: string;
  url: string | null;
  created_at: string;
  updated_at: string | null;
  source: string | null;
  user_agent: string | null;
  is_valid: boolean | null;
  payload: Partial<Submission> | null;
}

type SubmissionUpdates = {
  readStatus?: ReadStatus;
  ownerStatus?: OwnerStatus;
  ownerNote?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeSourcePlatform(value: unknown): SourcePlatform {
  if (value === "douyin" || value === "xiaohongshu" || value === "unsupported") {
    return value;
  }

  return "unsupported";
}

function normalizeParseStatus(value: unknown): ParseStatus {
  if (
    value === "pending" ||
    value === "parsing" ||
    value === "success" ||
    value === "failed" ||
    value === "saved_only"
  ) {
    return value;
  }

  return "saved_only";
}

function normalizeReadStatus(value: unknown): ReadStatus {
  return value === "read" ? "read" : "unread";
}

function normalizeOwnerStatus(value: unknown): OwnerStatus {
  const legacyOwnerStatusMap: Record<string, OwnerStatus> = {
    queued: "planned",
    eaten: "cooked",
    paused: "ignored",
    新提交: "new",
    想安排: "wanted",
    已排队: "planned",
    已吃掉: "cooked",
    先放着: "ignored",
  };
  const ownerStatuses: OwnerStatus[] = ["new", "wanted", "planned", "cooked", "ignored"];

  if (typeof value === "string" && value in legacyOwnerStatusMap) {
    return legacyOwnerStatusMap[value];
  }

  if (ownerStatuses.includes(value as OwnerStatus)) {
    return value as OwnerStatus;
  }

  return "new";
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function normalizeNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function normalizeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function normalizeNullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export const isRemoteStorageConfigured = isSupabaseConfigured;

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function normalizeSubmission(submission: Partial<Submission>): Submission {
  const createdAt = submission.createdAt ?? new Date().toISOString();

  return {
    id: submission.id ?? crypto.randomUUID(),
    rawInput: submission.rawInput ?? "",
    extractedUrl: submission.extractedUrl ?? null,
    resolvedUrl: submission.resolvedUrl ?? null,
    sourcePlatform: normalizeSourcePlatform(submission.sourcePlatform),
    title: submission.title ?? null,
    author: submission.author ?? null,
    coverUrl: submission.coverUrl ?? null,
    videoUrl: submission.videoUrl ?? null,
    textContent: submission.textContent ?? "",
    extractedDishName: submission.extractedDishName ?? null,
    dishCandidates: submission.dishCandidates ?? [],
    confidence: submission.confidence ?? 0,
    parseStatus: normalizeParseStatus(submission.parseStatus),
    errorMessage: submission.errorMessage ?? null,
    readStatus: normalizeReadStatus(submission.readStatus),
    ownerStatus: normalizeOwnerStatus(submission.ownerStatus),
    ownerNote: submission.ownerNote ?? "",
    source: submission.source ?? null,
    userAgent: submission.userAgent ?? null,
    isValidUrl: submission.isValidUrl ?? Boolean(submission.extractedUrl),
    createdAt,
    updatedAt: submission.updatedAt ?? createdAt,
  };
}

function browserFromUserAgent(userAgent: string) {
  if (/Edg\//.test(userAgent)) {
    return "Edge";
  }

  if (/FxiOS|Firefox\//.test(userAgent)) {
    return "Firefox";
  }

  if (/CriOS|Chrome\//.test(userAgent)) {
    return "Chrome";
  }

  if (/Safari\//.test(userAgent)) {
    return "Safari";
  }

  return "浏览器";
}

function platformFromUserAgent(userAgent: string) {
  if (/iPad/.test(userAgent)) {
    return "iPad";
  }

  if (/iPhone/.test(userAgent)) {
    return "iPhone";
  }

  if (/Android/.test(userAgent)) {
    return "Android";
  }

  if (/Windows/.test(userAgent)) {
    return "Windows";
  }

  if (/Mac OS X|Macintosh/.test(userAgent)) {
    return "Mac";
  }

  return "设备";
}

export function getClientSourceInfo() {
  if (typeof navigator === "undefined") {
    return {
      source: null,
      userAgent: null,
    };
  }

  const userAgent = navigator.userAgent;
  return {
    source: `${platformFromUserAgent(userAgent)} · ${browserFromUserAgent(userAgent)}`,
    userAgent,
  };
}

function getSupabaseEndpoint(path: string) {
  if (!isSupabaseConfigured()) {
    throw new SubmissionStorageError(SUPABASE_CONFIG_MISSING_MESSAGE);
  }

  return `${supabaseUrl}/rest/v1/${path}`;
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(getSupabaseEndpoint(path), {
    ...init,
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new SubmissionStorageError(
      details ? `线上数据库请求失败：${details}` : "线上数据库请求失败，请稍后再试。",
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

function toPayload(submission: Submission): Partial<Submission> {
  return {
    rawInput: submission.rawInput,
    extractedUrl: submission.extractedUrl,
    resolvedUrl: submission.resolvedUrl,
    sourcePlatform: submission.sourcePlatform,
    title: submission.title,
    author: submission.author,
    coverUrl: submission.coverUrl,
    videoUrl: submission.videoUrl,
    textContent: submission.textContent,
    extractedDishName: submission.extractedDishName,
    dishCandidates: submission.dishCandidates,
    confidence: submission.confidence,
    parseStatus: submission.parseStatus,
    errorMessage: submission.errorMessage,
    readStatus: submission.readStatus,
    ownerStatus: submission.ownerStatus,
    ownerNote: submission.ownerNote,
    source: submission.source,
    userAgent: submission.userAgent,
    isValidUrl: submission.isValidUrl,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
  };
}

function toLinkInsert(submission: Submission) {
  if (!submission.extractedUrl) {
    throw new SubmissionStorageError("没有可以保存的链接地址。");
  }

  return {
    id: submission.id,
    url: submission.extractedUrl,
    source: submission.source,
    user_agent: submission.userAgent,
    is_valid: submission.isValidUrl,
    payload: toPayload(submission),
  };
}

function fromLinkRow(row: LinkRow): Submission {
  const payload = isRecord(row.payload) ? row.payload : {};
  const rawInput = normalizeString(payload.rawInput, row.url ?? "");
  const createdAt = normalizeString(row.created_at, normalizeString(payload.createdAt, new Date().toISOString()));
  const updatedAt = normalizeString(row.updated_at, normalizeString(payload.updatedAt, createdAt));
  const extractedUrl = normalizeNullableString(payload.extractedUrl) ?? row.url ?? null;

  return normalizeSubmission({
    id: String(row.id),
    rawInput,
    extractedUrl,
    resolvedUrl: normalizeNullableString(payload.resolvedUrl),
    sourcePlatform: normalizeSourcePlatform(payload.sourcePlatform),
    title: normalizeNullableString(payload.title),
    author: normalizeNullableString(payload.author),
    coverUrl: normalizeNullableString(payload.coverUrl),
    videoUrl: normalizeNullableString(payload.videoUrl),
    textContent: normalizeString(payload.textContent, rawInput),
    extractedDishName: normalizeNullableString(payload.extractedDishName),
    dishCandidates: normalizeStringArray(payload.dishCandidates),
    confidence: normalizeNumber(payload.confidence),
    parseStatus: normalizeParseStatus(payload.parseStatus),
    errorMessage: normalizeNullableString(payload.errorMessage),
    readStatus: normalizeReadStatus(payload.readStatus),
    ownerStatus: normalizeOwnerStatus(payload.ownerStatus),
    ownerNote: normalizeString(payload.ownerNote),
    source: row.source ?? normalizeNullableString(payload.source),
    userAgent: row.user_agent ?? normalizeNullableString(payload.userAgent),
    isValidUrl: row.is_valid ?? Boolean(extractedUrl),
    createdAt,
    updatedAt,
  });
}

function sortNewestFirst(submissions: Submission[]) {
  return [...submissions].sort((left, right) => {
    const leftTime = new Date(left.createdAt).getTime();
    const rightTime = new Date(right.createdAt).getTime();
    return rightTime - leftTime;
  });
}

function parseLocalSubmissions(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((item) => normalizeSubmission(item as Partial<Submission>));
  } catch {
    return [];
  }
}

function readLocalSubmissions() {
  if (!canUseLocalStorage()) {
    return [];
  }

  return sortNewestFirst(
    parseLocalSubmissions(window.localStorage.getItem(LOCAL_SUBMISSIONS_STORAGE_KEY)),
  );
}

function writeLocalSubmissions(submissions: Submission[]) {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(
    LOCAL_SUBMISSIONS_STORAGE_KEY,
    JSON.stringify(sortNewestFirst(submissions)),
  );
}

function saveLocalSubmission(submission: Submission) {
  const normalizedSubmission = normalizeSubmission(submission);
  const submissions = readLocalSubmissions();
  const nextSubmissions = [
    normalizedSubmission,
    ...submissions.filter((item) => item.id !== normalizedSubmission.id),
  ];

  writeLocalSubmissions(nextSubmissions);
  return normalizedSubmission;
}

function updateLocalSubmission(submission: Submission, updates: SubmissionUpdates) {
  const updatedSubmission = normalizeSubmission({
    ...submission,
    ...updates,
    updatedAt: new Date().toISOString(),
  });
  const submissions = readLocalSubmissions();
  const nextSubmissions = submissions.map((item) =>
    item.id === submission.id ? updatedSubmission : item,
  );
  const hasExistingSubmission = submissions.some((item) => item.id === submission.id);

  writeLocalSubmissions(hasExistingSubmission ? nextSubmissions : [updatedSubmission, ...submissions]);
  return updatedSubmission;
}

function deleteLocalSubmission(id: string) {
  const submissions = readLocalSubmissions();
  const nextSubmissions = submissions.filter((submission) => submission.id !== id);

  writeLocalSubmissions(nextSubmissions);
  return nextSubmissions.length !== submissions.length;
}

export async function readRemoteSubmissions(): Promise<Submission[]> {
  if (!isSupabaseConfigured()) {
    return readLocalSubmissions();
  }

  const rows = await supabaseRequest<LinkRow[]>(
    `links?select=${LINKS_SELECT}&order=created_at.desc`,
  );

  return sortNewestFirst(rows.map(fromLinkRow));
}

export async function saveRemoteSubmission(submission: Submission): Promise<Submission> {
  const normalizedSubmission = normalizeSubmission(submission);

  if (!isSupabaseConfigured()) {
    return saveLocalSubmission(normalizedSubmission);
  }

  const rows = await supabaseRequest<LinkRow[]>(
    `links?select=${LINKS_SELECT}`,
    {
      method: "POST",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify(toLinkInsert(normalizedSubmission)),
    },
  );

  return rows[0] ? fromLinkRow(rows[0]) : normalizedSubmission;
}

export async function updateRemoteSubmission(
  submission: Submission,
  updates: SubmissionUpdates,
): Promise<Submission> {
  const updatedSubmission = normalizeSubmission({
    ...submission,
    ...updates,
    updatedAt: new Date().toISOString(),
  });

  if (!isSupabaseConfigured()) {
    return updateLocalSubmission(submission, updates);
  }

  const rows = await supabaseRequest<LinkRow[]>(
    `links?id=eq.${encodeURIComponent(submission.id)}&select=${LINKS_SELECT}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        updated_at: updatedSubmission.updatedAt,
        payload: toPayload(updatedSubmission),
      }),
    },
  );

  return rows[0] ? fromLinkRow(rows[0]) : updatedSubmission;
}

export async function deleteRemoteSubmission(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return deleteLocalSubmission(id);
  }

  const rows = await supabaseRequest<Array<{ id: string }>>(
    `links?id=eq.${encodeURIComponent(id)}&select=id`,
    {
      method: "DELETE",
      headers: {
        Prefer: "return=representation",
      },
    },
  );

  return rows.length > 0;
}
