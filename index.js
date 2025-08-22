// index.js
import express from "express";
import cors from "cors";
import admin from "firebase-admin";



const app = express();
app.use(cors()); // 👈 allow requests from your frontend
app.use(express.json());

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert("./serviceAccountKey.json"), // download from Firebase Console
});

app.post("/subscribe", async (req, res) => {
  const { token, topic } = req.body;
  try {
    const response = await admin.messaging().subscribeToTopic(token, topic);
    console.log(`Successfully subscribed to topic: ${topic}`);
    res.json({ success: true, response });
  } catch (error) {
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
    console.log(`Successfully sent message to topic: ${topic}`);
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
