import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const BASE_URL = "https://oneapi.zhx47.top:8888/v1/chat/completions";
const API_KEY = process.env.ONEAPI_KEY;

app.post("/webhook", async (req, res) => {
  try {
    const message = req.body?.content;

    if (!message || typeof message !== "string") {
      console.warn("收到無效訊息:", message);
      return res.status(200).json({ content: "請輸入有效訊息，我才能協助您。" });
    }

    console.log("收到訊息:", message);

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

    if (!reply) {
      console.warn("AI 回覆為空:", data);
      return res.status(200).json({ content: "抱歉，我暫時無法回覆您的問題。" });
    }

    res.status(200).json({ content: reply });
  } catch (err) {
    console.error("Webhook 錯誤:", err);
    res.status(200).json({ content: "系統錯誤，請稍後再試。" });
  }
});

export default app;
