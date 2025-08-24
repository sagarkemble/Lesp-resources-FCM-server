// index.js
import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import "dotenv/config";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});
// Subscribe to a topic
app.post("/subscribe", async (req, res) => {
  console.log("entered");

  const { token, topic } = req.body;
  try {
    const response = await admin.messaging().subscribeToTopic(token, topic);
    console.log(response);
    console.log(`Successfully subscribed to topic: ${topic}`);
    res.json({ success: true, response });
  } catch (error) {
    console.log(`Error subscribing to topic: ${topic}`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});
// Send notification to a topic
app.post("/send", async (req, res) => {
  const { topic, title, body } = req.body;

  const message = {
    notification: {
      title,
      body,
    },
    topic,
  };

  try {
    const response = await admin.messaging().send(message);
    res.json({ success: true, response });
  } catch (error) {
    console.log(`Error sending message to topic: ${topic}`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});
// unsubscribe from a topic
app.post("/unsubscribe", express.text({ type: "*/*" }), async (req, res) => {
  const { token, topic } = JSON.parse(req.body);
  try {
    await admin.messaging().unsubscribeFromTopic(token, topic);
    console.log(`Unsubscribed token from ${topic}`);
    res.json({ success: true });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default app;
