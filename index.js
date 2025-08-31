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
  const { token, topics } = req.body;
  if (!token || !Array.isArray(topics)) {
    console.log("invalid type");
    return res.status(400).json({ success: false, error: "Invalid input" });
  }
  try {
    let results = [];

    for (const topic of topics) {
      try {
        const response = await admin.messaging().subscribeToTopic(token, topic);
        console.log(`Successfully subscribed ${token} to topic: ${topic}`);
        results.push({ topic, success: true, response });
      } catch (err) {
        console.log(`Error subscribing ${token} to topic: ${topic}`, err);
        results.push({ topic, success: false, error: err.message });
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send notification to a topic
app.post("/send", async (req, res) => {
  const { topics, title, body } = req.body;
  const results = [];
  for (const topic of topics) {
    const message = {
      data: { title, body },
      topic,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log(`Successfully sent message to topic: ${topic}`, response);
      results.push({ topic, success: true, response });
    } catch (error) {
      console.log(`Error sending message to topic: ${topic}`, error);
      results.push({ topic, success: false, error: error.message });
    }
  }

  res.json(results);
});

// unsubscribe from a topic
app.use("/unsubscribe", express.json(), (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({ success: false, error: "Invalid JSON" });
  }
  next();
});

app.post("/unsubscribe", async (req, res) => {
  const { token, topics } = req.body;
  if (!token) {
    console.error("Token is required");
    return res.status(400).json({ success: false, error: "Token is required" });
  }

  if (!topics || !Array.isArray(topics) || topics.length === 0) {
    console.error("Topics must be a non-empty array");
    return res
      .status(400)
      .json({ success: false, error: "Topics must be a non-empty array" });
  }

  try {
    let results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const topic of topics) {
      try {
        const response = await admin
          .messaging()
          .unsubscribeFromTopic(token, topic);
        console.log(`Unsubscribed ${token} from topic: ${topic}`);
        results.push({ topic, success: true, response });
        successCount++;
      } catch (err) {
        console.error(`Error unsubscribing ${token} from topic: ${topic}`, err);
        results.push({ topic, success: false, error: err.message });
        errorCount++;
      }
    }

    res.json({
      success: true,
      results,
      summary: {
        total: topics.length,
        successful: successCount,
        failed: errorCount,
      },
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

export default app;
