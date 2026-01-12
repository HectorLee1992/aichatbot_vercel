import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const BASE_URL = "https://oneapi.zhx47.top:8888/v1/chat/completions";
const API_KEY = process.env.ONEAPI_KEY; // 從 Vercel 環境變數讀取

app.post("/webhook", async (req, res) => {
  try {
    const message = req.body.content; // Chatwoot 傳來的使用者訊息
    console.log("收到訊息:", message);

    // 呼叫上游 AI API
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "抱歉，我暫時無法回覆";

    // 回傳給 Chatwoot，格式必須是 { content: "..." }
    res.status(200).json({ content: reply });
  } catch (err) {
    console.error("Webhook 錯誤:", err);
    // 即使出錯也要回傳正確格式，避免 Chatwoot判定失敗
    res.status(200).json({ content: "系統錯誤，請稍後再試" });
  }
});

// Vercel 需要這個設定
export default app;
