export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const token = typeof req.body?.token === "string" ? req.body.token : "";
  if (!token || token.length > 2048) {
    return res.status(400).json({ success: false, error: "Missing or invalid token" });
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return res.status(500).json({ success: false, error: "Turnstile secret is not configured" });
  }

  try {
    const form = new URLSearchParams();
    form.set("secret", secret);
    form.set("response", token);
    if (req.headers["x-forwarded-for"]) {
      form.set("remoteip", String(req.headers["x-forwarded-for"]).split(",")[0].trim());
    }

    const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form
    });
    const result = await verification.json();
    if (!verification.ok || !result.success) {
      return res.status(403).json({ success: false, error: "Human verification failed" });
    }

    return res.status(200).json({ success: true });
  } catch {
    return res.status(502).json({ success: false, error: "Verification service unavailable" });
  }
}
