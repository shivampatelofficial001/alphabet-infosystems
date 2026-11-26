import { webcrypto } from "node:crypto";
if (!globalThis.crypto) { globalThis.crypto = webcrypto; } // Node 18 has no global crypto
import worker, { clean, validatePayload } from "./form-worker.js";
import assert from "node:assert/strict";

const store = new Map();
const sent = [];
const env = {
  ALLOWED_ORIGINS: "https://site.example",
  TO_EMAIL: "me@example.com", FROM_EMAIL: "forms@example.com",
  RESEND_API_KEY: "re_test_secret", RATE_SALT: "salt",
  RATE: { get: async k => store.get(k) ?? null, put: async (k, v) => { store.set(k, v); } }
};
globalThis.fetch = async (url, init) => { sent.push({ url, init }); return new Response("{}", { status: 200 }); };

const good = { name: "Asha Mehta", email: "asha@example.com", phone: "+91 98765 43210", interest: "A website", budget: "Not decided yet", message: "I need a website for my factory in Jamnagar." };
const call = (body, o = {}) => worker.fetch(new Request("https://f.example/send", {
  method: o.method || "POST",
  headers: { "Origin": o.origin ?? "https://site.example", "Content-Type": o.type || "application/json", "CF-Connecting-IP": o.ip || "1.1.1.1" },
  body: o.method === "GET" ? undefined : (typeof body === "string" ? body : JSON.stringify(body))
}), env);

const results = [];
const t = async (name, fn) => { await fn(); results.push("PASS " + name); };

await t("rejects unknown origin", async () => { assert.equal((await call(good, { origin: "https://evil.example" })).status, 403); });
await t("rejects missing origin", async () => { assert.equal((await call(good, { origin: "" })).status, 403); });
await t("rejects form-encoded body (CSRF-style post)", async () => { assert.equal((await call("a=b", { type: "application/x-www-form-urlencoded" })).status, 415); });
await t("rejects oversize body", async () => { assert.equal((await call({ ...good, message: "x".repeat(20000) })).status, 413); });
await t("rejects bad JSON", async () => { assert.equal((await call("{nope")).status, 400); });
await t("rejects invalid email", async () => { assert.equal((await call({ ...good, email: "not-an-email" })).status, 400); });
await t("rejects short message", async () => { assert.equal((await call({ ...good, message: "hi" })).status, 400); });
await t("GET is not allowed", async () => { assert.equal((await call("", { method: "GET", ip: "9.9.9.9" })).status, 405); });
await t("honeypot answers 200 but sends nothing", async () => { const n = sent.length; const r = await call({ ...good, _gotcha: "bot" }, { ip: "2.2.2.2" }); assert.equal(r.status, 200); assert.equal(sent.length, n); });
await t("strips tags and control characters", async () => {
  assert.equal(clean("<script>alert(1)</script>Hi\u0000 there", 80), "alert(1)Hi there");
  const v = validatePayload({ ...good, name: "<b>Asha</b>\r\nBcc: x@evil.com" });
  assert.equal(v.ok, true); assert.ok(!/[<>\r\n]/.test(v.data.name));
});
await t("ignores values outside the allowed lists", async () => { assert.equal(validatePayload({ ...good, interest: "<img src=x>" }).data.interest, ""); });
await t("valid message is sent, secret never in response", async () => {
  const r = await call(good, { ip: "3.3.3.3" }); const text = await r.text();
  assert.equal(r.status, 200); assert.ok(!text.includes("re_test_secret"));
  const mail = JSON.parse(sent.at(-1).init.body);
  assert.equal(mail.reply_to, "asha@example.com"); assert.ok(sent.at(-1).init.headers.Authorization.startsWith("Bearer "));
  assert.equal(r.headers.get("Access-Control-Allow-Origin"), "https://site.example");
  assert.equal(r.headers.get("X-Content-Type-Options"), "nosniff");
});
await t("rate limit: second send inside the gap gets 429", async () => { const r = await call(good, { ip: "3.3.3.3" }); assert.equal(r.status, 429); assert.ok(r.headers.get("Retry-After")); });
await t("fails closed when secrets are missing", async () => {
  const bad = { ...env, RESEND_API_KEY: "" };
  const r = await worker.fetch(new Request("https://f.example/send", { method: "POST", headers: { Origin: "https://site.example", "Content-Type": "application/json" }, body: JSON.stringify(good) }), bad);
  assert.equal(r.status, 500);
});
await t("preflight only for allowed origin", async () => {
  const ok = await worker.fetch(new Request("https://f.example/send", { method: "OPTIONS", headers: { Origin: "https://site.example" } }), env);
  const no = await worker.fetch(new Request("https://f.example/send", { method: "OPTIONS", headers: { Origin: "https://evil.example" } }), env);
  assert.equal(ok.status, 204); assert.equal(no.status, 403);
});
console.log(results.join("\n")); console.log(results.length + " checks passed");
