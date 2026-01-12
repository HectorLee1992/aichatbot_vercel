import express from "express";

const app = express();
app.use(express.json());

// Webhook endpoint
app.post("/webhook", async (req, res) => {
  try {
    const rawMessage = req.body?.content || "";
    console.log("收到訊息:", rawMessage);

    // ✅ 永遠回傳固定文字，避免 timeout
    res.status(200).json({ content: "你好，我是測試機器人！" });
    console.log("已送出固定回覆");
  } catch (err) {
    console.error("Webhook 錯誤:", err);
    res.status(200).json({ content: "系統錯誤，請稍後再試。" });
  }
});

// Vercel 需要這個設定
export default app;
