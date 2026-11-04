import { parseSuggestRequest, sanitizeSuggestions } from "./validate.mjs";

export const DAILY_LIMIT = 10;

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * Core of /api/suggest, with its dependencies passed in so it can be tested
 * without Firebase or Anthropic.
 *
 * deps.verifyToken(idToken)      -> uid (throws if invalid)
 * deps.consumeQuota(uid, limit)  -> { allowed, remaining }
 * deps.generate(request)         -> raw model output ({ suggestions: [...] })
 */
export async function handleSuggest({ method, authorization, body }, deps) {
  if (method !== "POST") throw new HttpError(405, "Use POST.");

  const match = /^Bearer (.+)$/.exec(authorization || "");
  if (!match) throw new HttpError(401, "Please sign in again.");
  let uid;
  try {
    uid = await deps.verifyToken(match[1]);
  } catch {
    throw new HttpError(401, "Your session expired. Please sign in again.");
  }

  const parsed = parseSuggestRequest(body);
  if (!parsed.ok) throw new HttpError(400, parsed.error);

  const quota = await deps.consumeQuota(uid, DAILY_LIMIT);
  if (!quota.allowed) {
    throw new HttpError(429, `You've used all ${DAILY_LIMIT} suggestions for today. Try again tomorrow.`);
  }

  let raw;
  try {
    raw = await deps.generate(parsed.value);
  } catch (err) {
    deps.log?.("generate failed", err?.status || "", err?.message || err);
    throw new HttpError(502, "The suggestion service is busy. Please try again in a moment.");
  }

  const suggestions = sanitizeSuggestions(raw);
  if (suggestions.length === 0) {
    throw new HttpError(502, "Couldn't come up with dinners this time. Please try again.");
  }
  return { suggestions, remaining: quota.remaining };
}
