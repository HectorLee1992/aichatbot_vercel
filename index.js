import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const BASE_URL = "https://oneapi.zhx47.top:8888/v1/chat/completions";
const API_KEY = process.env.ONEAPI_KEY;

// Webhook endpoint
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body?.content;

    if (!message || typeof message !== "string") {
      console.warn("收到無效訊息:", message);
      return res.status(200).json({ content: "請輸入有效訊息，我才能協助您。" });
    }

    console.log("收到訊息:", message);

    // ✅ 先立即回覆，避免 Chatwoot timeout
    res.status(200).json({ content: "我正在思考，請稍候..." });

    // 🔄 在背景呼叫 AI API
    (async () => {
      try {
        const response = await fetch(BASE_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "你是一個中文客服機器人，請用繁體中文回答。" },
              { role: "user", content: message }
            ]
          })
        });

        const data = await response.json();
        const reply = data?.choices?.[0]?.message?.content?.trim();

        console.log("AI 回覆:", reply || "（空回覆）");

        // ⚠️ 注意：這裡只是背景 log，Chatwoot 不會再收到第二次回覆
        // 如果你要把完整 AI 回覆推回 Chatwoot，需要用 Chatwoot API + 訪問 token
        // 例如 POST 到 /api/v1/accounts/:account_id/conversations/:conversation_id/messages
        // 並帶上 Authorization: Bearer <訪問 token>
      } catch (err) {
        console.error("背景 AI 呼叫錯誤:", err);
      }
    })();

  } catch (err) {
    console.error("Webhook 錯誤:", err);
    res.status(200).json({ content: "系統錯誤，請稍後再試。" });
  }
});

export default app;
