/**
 * Cloudflare Pages Function: GitHub OAuth Callback for Decap CMS
 * Route: /api/callback
 * Required Environment Variables: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
 */

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) { return cookies; }
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx > 0) {
      cookies[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
    }
  }
  return cookies;
}

function renderMessage(status, payload) {
  const serialized = JSON.stringify(payload);
  const body = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Authenticating...</title></head>
<body>
<script>
(function () {
  function receiveMessage(e) {
    window.opener.postMessage(
      "authorization:github:${status}:" + ${JSON.stringify(serialized)},
      e.origin
    );
    window.removeEventListener("message", receiveMessage, false);
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:github", "*");
})();
</script>
</body>
</html>`;
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Set-Cookie": "decap_oauth_state=; Path=/api/callback; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
    }
  });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return renderMessage("error", { error: "OAuth credentials are not configured." });
  }

  const cookies = parseCookies(request.headers.get("Cookie"));
  if (!code || !state || !cookies.decap_oauth_state || cookies.decap_oauth_state !== state) {
    return renderMessage("error", { error: "Invalid OAuth state or authorization code." });
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code: code
    })
  });

  const data = await tokenResponse.json();
  if (!tokenResponse.ok || data.error || !data.access_token) {
    return renderMessage("error", { error: data.error_description || data.error || "Token exchange failed." });
  }

  return renderMessage("success", {
    token: data.access_token,
    provider: "github"
  });
}
