import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const target = req.query.url;

    if (!target) {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    const finalUrl = decodeURIComponent(target);

    const response = await fetch(finalUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept": "*/*",
        "Referer": finalUrl,
        "Origin": finalUrl
      }
    });

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "application/octet-stream"
    );

    // Detectar M3U8 aunque tenga query
    if (finalUrl.includes(".m3u8")) {
      let text = await response.text();

      const baseUrl = finalUrl.substring(0, finalUrl.lastIndexOf("/") + 1);

      // Reescribir TODOS los paths relativos
      text = text.replace(/^(?!https?:\/\/)(.+)$/gm, line => {
        if (line.startsWith("#")) return line;
        return baseUrl + line;
      });

      return res.send(text);
    }

    // Segmentos / binario
    const buffer = await response.arrayBuffer();
    return res.send(Buffer.from(buffer));

  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "Proxy request failed" });
  }
}