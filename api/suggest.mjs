// POST /api/suggest: budget dinner ideas from the user's pantry.
// Vercel serverless function. The Anthropic key and Firebase service account
// stay on the server; the browser only sends its Firebase ID token.
//
// Uses only plain Node.js request/response APIs (no framework helpers), and
// loads its dependencies inside the handler so a startup failure comes back
// as a readable JSON error instead of a crash page.

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body; // already parsed by the platform
  if (typeof req.body === "string") return JSON.parse(req.body || "null");
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 20_000) throw new Error("Request body too large");
  }
  return raw ? JSON.parse(raw) : null;
}

export default async function handler(req, res) {
  if (!process.env.ANTHROPIC_API_KEY || !process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    console.error("Missing ANTHROPIC_API_KEY or FIREBASE_SERVICE_ACCOUNT_JSON");
    return send(res, 500, { error: "Suggestions aren't set up on the server yet." });
  }

  let lib;
  try {
    const [{ HttpError, handleSuggest }, services] = await Promise.all([
      import("./_lib/handler.mjs"),
      import("./_lib/services.mjs"),
    ]);
    lib = { HttpError, handleSuggest, services };
  } catch (err) {
    console.error("Startup failed:", err);
    return send(res, 500, { error: "The suggestion server failed to start.", detail: String(err?.message || err).slice(0, 300) });
  }

  try {
    let body = null;
    if (req.method === "POST") {
      try {
        body = await readJsonBody(req);
      } catch {
        return send(res, 400, { error: "Request body must be valid JSON." });
      }
    }
    const { verifyToken, consumeQuota, generate } = lib.services;
    const result = await lib.handleSuggest(
      { method: req.method, authorization: req.headers?.authorization, body },
      { verifyToken, consumeQuota, generate, log: console.error }
    );
    return send(res, 200, result);
  } catch (err) {
    if (err instanceof lib.HttpError) return send(res, err.status, { error: err.message });
    console.error("Unhandled error:", err);
    return send(res, 500, { error: "Something went wrong. Please try again.", detail: String(err?.message || err).slice(0, 300) });
  }
}
