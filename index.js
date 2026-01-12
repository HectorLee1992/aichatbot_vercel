import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const BASE_URL = "https://oneapi.zhx47.top:8888/v1/chat/completions";

// Chatwoot webhook endpoint
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body.content; // Chatwoot 傳來的使用者訊息
    const userApiKey = req.headers["x-api-key"]; // 使用者自帶 API Key

    if (!userApiKey) {
      return res.status(400).json({ content: "缺少 API Key" });
    }

    // 呼叫 AI API
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${userApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "抱歉，我暫時無法回覆";

    // 回傳給 Chatwoot
    res.json({ content: reply });
  } catch (err) {
    console.error(err);
    res.json({ content: "系統錯誤，請稍後再試" });
  }
});

export default app;
