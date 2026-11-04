// Real implementations of the handler's dependencies (Firebase Admin + Anthropic).
import Anthropic from "@anthropic-ai/sdk";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { SUGGESTION_SCHEMA } from "./validate.mjs";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt.mjs";

export const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-5-5";

function adminApp() {
  if (getApps().length) return getApps()[0];
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not set");
  return initializeApp({ credential: cert(JSON.parse(json)) });
}

export async function verifyToken(idToken) {
  const decoded = await getAuth(adminApp()).verifyIdToken(idToken);
  return decoded.uid;
}

// Count requests per user per UTC day in Firestore. Clients can't read or write
// the "usage" collection (no rule allows it); only this server can.
export async function consumeQuota(uid, limit) {
  const db = getFirestore(adminApp());
  const day = new Date().toISOString().slice(0, 10);
  const ref = db.collection("usage").doc(`${uid}_${day}`);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const count = snap.exists ? snap.get("count") || 0 : 0;
    if (count >= limit) return { allowed: false, remaining: 0 };
    tx.set(ref, { uid, day, count: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return { allowed: true, remaining: limit - count - 1 };
  });
}

let client;
export async function generate(request) {
  client ||= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 1, timeout: 25_000 });
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    tools: [
      {
        name: "suggest_dinners",
        description: "Return exactly three budget dinner suggestions.",
        input_schema: SUGGESTION_SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: "suggest_dinners" },
    messages: [{ role: "user", content: buildUserPrompt(request) }],
  });
  const toolUse = response.content.find((block) => block.type === "tool_use");
  return toolUse?.input;
}
