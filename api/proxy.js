import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const target = req.query.url;

    if (!target) {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    // Evitar doble encoding
    const finalUrl = decodeURIComponent(target);

    // Hacer request a la URL real
    const response = await fetch(finalUrl, {
      method: "GET",
      headers: {
        // Puedes agregar acá otros headers si los necesitas
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/110 Safari/537.36",
        Accept: "*/*",
      },
    });

    // Pasar headers importantes
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Content-Type", response.headers.get("content-type") || "application/octet-stream");

    // Si el stream es .m3u8, ajustamos paths relativos
    if (finalUrl.endsWith(".m3u8")) {
      let text = await response.text();

      // Resolver paths relativos a absolutos
      const baseUrl = finalUrl.substring(0, finalUrl.lastIndexOf("/") + 1);
      text = text.replace(/^(?!https?:\/\/)(.*\.m3u8|.*\.ts)$/gm, match => baseUrl + match);

      return res.send(text);
    }

    // Si es TS u otro archivo binario
    const arrayBuffer = await response.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "Proxy request failed" });
  }
}
