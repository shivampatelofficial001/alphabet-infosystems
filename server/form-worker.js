/* Alphabet Infosystems - hardened contact form handler (Cloudflare Worker)
   ---------------------------------------------------------------------
   What it does on the server, where visitors cannot change it:
   - accepts only POST /send from an allowed website address (Origin check)
   - accepts only JSON, with a hard size limit
   - validates and cleans every field again (never trusts the browser)
   - drops bots that fill the hidden field, without telling them
   - limits each visitor address to a few messages per hour (KV storage)
   - sends the message as plain text by email, so nothing can run in the inbox
   - keeps all keys in Worker secrets, never in the website files

   Settings (see SECURITY.md): ALLOWED_ORIGINS, TO_EMAIL, FROM_EMAIL (variables),
   RESEND_API_KEY (secret), RATE (KV namespace binding). */

var LIMITS = { name: 80, email: 254, phone: 30, message: 2000, minMessage: 10, body: 8192 };
var RATE = { perHour: 5, minGapSeconds: 30 };
var INTERESTS = ["A website", "An ERP system", "A SaaS product", "AI automation", "Not sure yet"];
var BUDGETS = ["Not decided yet", "Under ₹50,000", "₹50,000 to ₹1,50,000", "₹1,50,000 to ₹5,00,000", "Above ₹5,00,000"];
var EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

function clean(value, max, keepNewlines) {
  var s = typeof value === "string" ? value : "";
  s = s.normalize("NFKC");
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, "");
  s = s.replace(/<[^>]*>/g, "").replace(/[<>]/g, "");
  s = keepNewlines ? s.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n") : s.replace(/\s+/g, " ");
  s = s.trim();
  return s.length > max ? s.slice(0, max) : s;
}

function validatePayload(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) { return { ok: false, error: "Invalid request." }; }
  var data = {
    name: clean(input.name, LIMITS.name),
    email: clean(input.email, LIMITS.email),
    phone: clean(input.phone, LIMITS.phone),
    interest: INTERESTS.indexOf(input.interest) >= 0 ? input.interest : "",
    budget: BUDGETS.indexOf(input.budget) >= 0 ? input.budget : "",
    message: clean(input.message, LIMITS.message, true)
  };
  var errors = {};
  if (data.name.length < 2) { errors.name = "Enter your name."; }
  if (!EMAIL_RE.test(data.email)) { errors.email = "Enter a valid email address."; }
  if (data.phone && !(/^[+\d\s().-]+$/.test(data.phone) && data.phone.replace(/\D/g, "").length >= 7)) {
    errors.phone = "Enter a valid phone number or leave it empty.";
  }
  if (data.message.length < LIMITS.minMessage) { errors.message = "Tell me briefly what you need."; }
  if (Object.keys(errors).length) { return { ok: false, error: "Please check the form.", fields: errors }; }
  return { ok: true, data: data };
}

function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
}

function baseHeaders(origin) {
  var h = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
  };
  if (origin) {
    h["Access-Control-Allow-Origin"] = origin;
    h["Vary"] = "Origin";
  }
  return h;
}

function reply(status, body, origin, extra) {
  var headers = baseHeaders(origin);
  if (extra) { Object.keys(extra).forEach(function (k) { headers[k] = extra[k]; }); }
  return new Response(JSON.stringify(body), { status: status, headers: headers });
}

async function sha256Hex(text) {
  var bytes = new TextEncoder().encode(text);
  var digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
}

// Returns null when the visitor may send, otherwise the number of seconds to wait.
async function checkRate(env, ip) {
  var key = "rl:" + (await sha256Hex(ip + ":" + (env.RATE_SALT || "")));
  var now = Math.floor(Date.now() / 1000);
  var record = [];
  try { record = JSON.parse((await env.RATE.get(key)) || "[]"); } catch (e) { record = []; }
  record = record.filter(function (t) { return typeof t === "number" && t > now - 3600; });
  if (record.length && now - record[record.length - 1] < RATE.minGapSeconds) {
    return RATE.minGapSeconds - (now - record[record.length - 1]);
  }
  if (record.length >= RATE.perHour) { return 3600 - (now - record[0]); }
  record.push(now);
  await env.RATE.put(key, JSON.stringify(record), { expirationTtl: 3600 });
  return null;
}

function buildEmail(data, env) {
  var lines = [
    "Name: " + data.name,
    "Email: " + data.email,
    "Phone: " + (data.phone || "-"),
    "Looking for: " + (data.interest || "-"),
    "Budget: " + (data.budget || "-"),
    "",
    data.message
  ];
  return {
    from: env.FROM_EMAIL,
    to: [env.TO_EMAIL],
    reply_to: data.email,
    subject: "Project enquiry from " + data.name,
    text: lines.join("\n")
  };
}

async function handle(request, env) {
  var url = new URL(request.url);
  var origin = request.headers.get("Origin") || "";
  var allowed = allowedOrigins(env);
  var originOk = allowed.indexOf(origin) >= 0;

  if (request.method === "OPTIONS") {
    if (!originOk) { return reply(403, { error: "Not allowed." }, ""); }
    return new Response(null, {
      status: 204,
      headers: Object.assign(baseHeaders(origin), {
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Accept",
        "Access-Control-Max-Age": "600"
      })
    });
  }

  if (url.pathname !== "/send") { return reply(404, { error: "Not found." }, ""); }
  if (request.method !== "POST") { return reply(405, { error: "Method not allowed." }, "", { "Allow": "POST, OPTIONS" }); }
  if (!originOk) { return reply(403, { error: "Not allowed." }, ""); }

  var type = (request.headers.get("Content-Type") || "").toLowerCase();
  if (type.indexOf("application/json") !== 0) { return reply(415, { error: "Unsupported content type." }, origin); }

  var declared = Number(request.headers.get("Content-Length") || 0);
  if (declared > LIMITS.body) { return reply(413, { error: "Request too large." }, origin); }
  var raw = await request.text();
  if (new TextEncoder().encode(raw).length > LIMITS.body) { return reply(413, { error: "Request too large." }, origin); }

  var input;
  try { input = JSON.parse(raw); } catch (e) { return reply(400, { error: "Invalid request." }, origin); }

  // Bots fill the hidden fields. Answer as if it worked, and send nothing.
  if (input && (input._gotcha || input.company)) { return reply(200, { ok: true }, origin); }

  if (!env.RATE || !env.RESEND_API_KEY || !env.TO_EMAIL || !env.FROM_EMAIL) {
    return reply(500, { error: "The form is not set up yet. Please email directly." }, origin);
  }

  var checked = validatePayload(input);
  if (!checked.ok) { return reply(400, { error: checked.error, fields: checked.fields || {} }, origin); }

  var ip = request.headers.get("CF-Connecting-IP") || "unknown";
  var wait = await checkRate(env, ip);
  if (wait !== null) {
    return reply(429, { error: "Too many messages. Please try again later." }, origin, { "Retry-After": String(wait) });
  }

  var sent;
  try {
    sent = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(buildEmail(checked.data, env))
    });
  } catch (e) {
    return reply(502, { error: "Could not send right now. Please email directly." }, origin);
  }
  if (!sent.ok) { return reply(502, { error: "Could not send right now. Please email directly." }, origin); }
  return reply(200, { ok: true }, origin);
}

export default {
  fetch: function (request, env) {
    return handle(request, env).catch(function () {
      return reply(500, { error: "Something went wrong." }, "");
    });
  }
};

export { clean, validatePayload, handle };
