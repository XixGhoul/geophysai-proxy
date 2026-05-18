// api/analyze.js — Vercel serverless proxy for GeoPhysAI
// The CLAUDE_API_KEY env variable is set in Vercel → Settings → Environment Variables
// This file keeps the key off the frontend entirely.

export default async function handler(req, res) {
  // CORS headers — allow the Vercel-hosted frontend to call this
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight
  if (req.method === "OPTIONS") return res.status(200).end();

  // Only POST allowed
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Guard: key must be configured in Vercel env vars
  if (!process.env.CLAUDE_API_KEY) {
    return res.status(500).json({
      error: "API key not configured on server. Add CLAUDE_API_KEY in Vercel → Settings → Environment Variables."
    });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    // Stream the response body straight back to the client
    res.setHeader("Content-Type", response.headers.get("content-type") || "application/json");
    res.status(response.status);

    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) { res.end(); break; }
      res.write(Buffer.from(value));
    }
  } catch (error) {
    return res.status(500).json({ error: "Proxy error: " + error.message });
  }
}
