// 用 token 換取 LINE UID（一次性，用完即刪）
export default async function handler(req, res) {
  // 允許跨域（目標網站可以呼叫此 API）
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token } = req.query;
  if (!token || !/^[a-f0-9]{32}$/.test(token)) {
    return res.status(400).json({ error: "Invalid token" });
  }

  const upstashUrl = process.env.KV_REST_API_URL;
  const upstashToken = process.env.KV_REST_API_TOKEN;

  // GETDEL：取得並同時刪除（一次性使用）
  const response = await fetch(`${upstashUrl}/getdel/token:${token}`, {
    headers: { Authorization: `Bearer ${upstashToken}` },
  });

  const data = await response.json();
  const uid = data.result;

  if (!uid) {
    return res.status(404).json({ error: "Token not found or expired" });
  }

  res.status(200).json({ uid });
}
