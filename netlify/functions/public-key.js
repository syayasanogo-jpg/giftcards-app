// netlify/functions/public-key.js
// Fonction Netlify v2 avec path /api/public-key + support v1
export default async function handler(req, res) {
  const key = process.env.FLW_PUBLIC_KEY || "";
  if (!key) return res.status(500).json({ error: "No key configured" });
  return res.status(200).json({ publicKey: key });
}

// Expose aussi l'URL /api/public-key (v2)
export const config = { path: "/api/public-key" };

// === Fallback v1 (si Netlify construit en "v1")
export const handler = async () => {
  const key = process.env.FLW_PUBLIC_KEY || "";
  if (!key) return { statusCode: 500, body: JSON.stringify({ error: "No key configured" }) };
  return { statusCode: 200, body: JSON.stringify({ publicKey: key }) };
};