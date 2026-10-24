import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { investigate } from "./investigator.js";

dotenv.config();
const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://192.168.29.234:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/investigate", async (req, res) => {
  const { repoUrl, issueNumber, runTests = false } = req.body ?? {};
  if (typeof repoUrl !== "string" || !Number.isInteger(Number(issueNumber))) {
    return res.status(400).json({ error: "repoUrl and a numeric issueNumber are required." });
  }
  try {
    const result = await investigate({ repoUrl, issueNumber: Number(issueNumber), runTests: Boolean(runTests) });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message || "Investigation failed." });
  }
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`Investigator API listening on http://localhost:${port}`));
