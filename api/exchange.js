// 接收 LINE UID，儲存並回傳一次性 token
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { uid } = req.body;
  if (!uid || typeof uid !== "string" || !/^U[a-f0-9]{32}$/.test(uid)) {
    return res.status(400).json({ error: "Invalid UID" });
  }

  const token = crypto.randomUUID().replace(/-/g, "");
  const ttl = 300; // 5 分鐘過期

  const upstashUrl = process.env.KV_REST_API_URL;
  const upstashToken = process.env.KV_REST_API_TOKEN;

  const response = await fetch(`${upstashUrl}/set/token:${token}/${uid}?ex=${ttl}`, {
    headers: { Authorization: `Bearer ${upstashToken}` },
  });

  if (!response.ok) {
    return res.status(500).json({ error: "Storage error" });
  }

  res.status(200).json({ token });
}
