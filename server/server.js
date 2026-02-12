import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Safe default model in case environment variable not set
const DEFAULT_MODEL = "llama-3.1-8b-instant";

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello from server" });
});

// Route to list available models for your API key
app.get("/models", async (req, res) => {
  try {
    const modelsResponse = await groq.listModels();
    res.status(200).json(modelsResponse);
  } catch (error) {
    console.error("MODEL LIST ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Main chat route
app.post("/", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    console.log("Received prompt:", prompt);

    // Use model from environment variable or default
    const model = process.env.GROQ_MODEL || DEFAULT_MODEL;

    const response = await groq.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    console.log("Groq response:", response.choices[0].message.content);

    res.status(200).json({
      message: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("GROQ ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});
