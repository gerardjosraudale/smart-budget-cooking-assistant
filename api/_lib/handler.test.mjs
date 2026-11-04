// Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { DAILY_LIMIT, HttpError, handleSuggest } from "./handler.mjs";
import { parseSuggestRequest } from "./validate.mjs";

const modelOutput = {
  suggestions: [
    { title: "Bean Bowls", summary: "Cheap.", servings: 4, timeMinutes: 25, estimatedCost: 4.5,
      fromPantry: ["rice", "black beans"], toBuy: ["salsa"], steps: ["1. Cook rice", "2) Warm beans", "Serve"] },
    { title: "", steps: ["x"], estimatedCost: 1 }, // missing title: dropped
    { title: "Bad cost", steps: ["x"], estimatedCost: "free" }, // invalid cost: dropped
    { title: "Fried Rice", servings: 99, timeMinutes: 1, estimatedCost: 500, fromPantry: [], toBuy: [], steps: ["Fry"] },
  ],
};

function fakeDeps(overrides = {}) {
  const counts = new Map();
  return {
    verifyToken: async (token) => {
      if (token !== "good-token") throw new Error("invalid");
      return "user-1";
    },
    consumeQuota: async (uid, limit) => {
      const used = counts.get(uid) || 0;
      if (used >= limit) return { allowed: false, remaining: 0 };
      counts.set(uid, used + 1);
      return { allowed: true, remaining: limit - used - 1 };
    },
    generate: async () => modelOutput,
    ...overrides,
  };
}

const request = (overrides = {}) => ({
  method: "POST",
  authorization: "Bearer good-token",
  body: { pantry: ["Rice", "black beans"], budgetLeft: 20, servings: 4 },
  ...overrides,
});

async function statusOf(promise) {
  try {
    await promise;
    return 200;
  } catch (err) {
    assert.ok(err instanceof HttpError, `unexpected error: ${err}`);
    return err.status;
  }
}

test("rejects non-POST requests", async () => {
  assert.equal(await statusOf(handleSuggest(request({ method: "GET" }), fakeDeps())), 405);
});

test("requires a valid Firebase token", async () => {
  assert.equal(await statusOf(handleSuggest(request({ authorization: "" }), fakeDeps())), 401);
  assert.equal(await statusOf(handleSuggest(request({ authorization: "Bearer forged" }), fakeDeps())), 401);
});

test("validates input", async () => {
  assert.equal(await statusOf(handleSuggest(request({ body: { pantry: [] } }), fakeDeps())), 400);
  assert.equal(await statusOf(handleSuggest(request({ body: { pantry: ["rice"], budgetLeft: "abc" } }), fakeDeps())), 400);
});

test("returns 502 when the model fails or returns junk", async () => {
  const failing = fakeDeps({ generate: async () => { throw new Error("overloaded"); } });
  assert.equal(await statusOf(handleSuggest(request(), failing)), 502);
  const junk = fakeDeps({ generate: async () => ({ suggestions: [{ title: "x" }] }) });
  assert.equal(await statusOf(handleSuggest(request(), junk)), 502);
});

test("cleans model output before returning it", async () => {
  const { suggestions, remaining } = await handleSuggest(request(), fakeDeps());
  assert.equal(suggestions.length, 2);
  assert.deepEqual(suggestions[0].steps, ["Cook rice", "Warm beans", "Serve"]);
  assert.equal(suggestions[1].servings, 12);
  assert.equal(suggestions[1].estimatedCost, 200);
  assert.equal(remaining, DAILY_LIMIT - 1);
});

test(`allows ${DAILY_LIMIT} requests per day, then 429`, async () => {
  const deps = fakeDeps();
  for (let i = 0; i < DAILY_LIMIT; i++) await handleSuggest(request(), deps);
  assert.equal(await statusOf(handleSuggest(request(), deps)), 429);
});

test("parses and clamps request fields", () => {
  const { ok, value } = parseSuggestRequest({ pantry: ["Rice", "rice", " EGGS ", "", 5], budgetLeft: 5000, servings: 50 });
  assert.ok(ok);
  assert.deepEqual(value.pantry, ["rice", "eggs"]);
  assert.equal(value.budgetLeft, 1000);
  assert.equal(value.servings, 12);
});
