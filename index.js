// index.js
import express from "express";
import cors from "cors";
import admin from "firebase-admin";



const app = express();
app.use(cors()); // 👈 allow requests from your frontend
app.use(express.json());


admin.initializeApp({

    // string ✅
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,  // string ✅
  
});

app.post("/subscribe", async (req, res) => {
  const { token, topic } = req.body;
  try {
    const response = await admin.messaging().subscribeToTopic(token, topic);
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

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
