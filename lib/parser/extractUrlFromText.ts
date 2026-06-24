const URL_PATTERN = /https?:\/\/[^\s"'<>，。；、【】\]\[()（）]+/gi;
const TRAILING_PUNCTUATION = /[，。；、！!？?）)\]}】"'`]+$/g;

export function extractUrlFromText(rawInput: string): string | null {
  if (!rawInput) {
    return null;
  }

  const normalized = rawInput
    .replace(/\u200B/g, "")
    .replace(/\u00A0/g, " ")
    .trim();
  const matches = normalized.match(URL_PATTERN);

  if (!matches?.length) {
    return null;
  }

  const extractedUrl = matches[0].trim().replace(TRAILING_PUNCTUATION, "");

  return extractedUrl || null;
}
