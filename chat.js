export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Optional: restrict to your own Vercel domain
  // const origin = req.headers.origin || "";
  // if (!origin.includes("your-app.vercel.app")) {
  //   return res.status(403).json({ error: "Forbidden" });
  // }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,   // ← from Vercel env vars, never exposed to browser
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    // Stream passthrough — preserve SSE streaming for the frontend
    if (req.body.stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value));
      }
      return res.end();
    }

    // Non-streaming fallback
    const data = await upstream.json();
    return res.status(upstream.status).json(data);

  } catch (err) {
    return res.status(500).json({ error: "Proxy error", details: err.message });
  }
}
