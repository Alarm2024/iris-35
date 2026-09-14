import express from "express";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const API_KEY = process.env.ASSEMBLYAI_API_KEY || "";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
  "https://iris-35.elghaly.dev,http://localhost:8080,http://127.0.0.1:8080")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "iris-35-voice",
    assemblyai_configured: Boolean(API_KEY),
  });
});

app.get("/api/voice-token", async (_req, res) => {
  if (!API_KEY) {
    return res.status(503).json({
      error: "ASSEMBLYAI_API_KEY is not configured on the server.",
      hint: "Set ASSEMBLYAI_API_KEY in Render (or .env locally) and redeploy.",
    });
  }

  const url = new URL("https://agents.assemblyai.com/v1/token");
  url.searchParams.set("expires_in_seconds", "300");
  url.searchParams.set("max_session_duration_seconds", "1800");

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    const body = await response.text();
    if (!response.ok) {
      return res.status(response.status).type("application/json").send(body);
    }
    res.type("application/json").send(body);
  } catch (err) {
    res.status(502).json({ error: "Token mint failed", detail: String(err.message || err) });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`iris-35-voice listening on 0.0.0.0:${PORT}`);
});
