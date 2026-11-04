// POST /api/suggest: budget dinner ideas from the user's pantry.
// Vercel serverless function. The Anthropic key and Firebase service account
// stay on the server; the browser only sends its Firebase ID token.
import { HttpError, handleSuggest } from "./_lib/handler.mjs";
import { consumeQuota, generate, verifyToken } from "./_lib/services.mjs";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!process.env.ANTHROPIC_API_KEY || !process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    console.error("Missing ANTHROPIC_API_KEY or FIREBASE_SERVICE_ACCOUNT_JSON");
    return res.status(500).json({ error: "Suggestions aren't set up on the server yet." });
  }
  try {
    const result = await handleSuggest(
      { method: req.method, authorization: req.headers.authorization, body: req.body },
      { verifyToken, consumeQuota, generate, log: console.error }
    );
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    console.error(err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
