import Tesseract from "tesseract.js";
import { franc } from "franc";
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
const PORT = process.env.PORT || 3001;
dotenv.config();

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json({ limit: "50mb" }));

app.post("/extract-text", async (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: "No imageBase64 provided" });
      return;
    }

    const imageBuffer = Buffer.from(imageBase64, "base64");

    const { data } = await Tesseract.recognize(imageBuffer, "eng");

    const rawText = data.text.trim();
    const langCode = franc(rawText);

    res.json({ text: rawText, lang: langCode });
  } catch (error) {
    console.error("Error during OCR process:", error);
    res.status(500).json({ error: "Failed to extract text from image" });
  }
});

app.listen(PORT, () => {
  console.log(`OCR Microservice running on port ${PORT}`);
});
