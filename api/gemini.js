import { GoogleGenerativeAI } from "@google/generative-ai";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_HOUR = parseInt(process.env.MAX_REQUESTS_PER_HOUR || "3", 10);
const rateLimitStore =
  globalThis.__rateLimitStore || new Map();
globalThis.__rateLimitStore = rateLimitStore;

function cleanupOldEntries() {
  const now = Date.now();
  for (const [ip, data] of rateLimitStore.entries()) {
    if (data.resetTime <= now) {
      rateLimitStore.delete(ip);
    }
  }
}

function checkRateLimit(ip) {
  cleanupOldEntries();

  const now = Date.now();
  const existing = rateLimitStore.get(ip);

  if (!existing || existing.resetTime <= now) {
    const resetTime = now + RATE_LIMIT_WINDOW_MS;
    rateLimitStore.set(ip, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_HOUR - 1,
      resetTime
    };
  }

  if (existing.count >= MAX_REQUESTS_PER_HOUR) {
    const minutes = Math.ceil((existing.resetTime - now) / 1000 / 60);
    return {
      allowed: false,
      remaining: 0,
      resetTime: existing.resetTime,
      resetInMinutes: minutes
    };
  }

  existing.count += 1;
  rateLimitStore.set(ip, existing);

  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_HOUR - existing.count,
    resetTime: existing.resetTime
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }



  const ip =
    req.headers["x-vercel-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket.remoteAddress ||
    "unknown";

  const rateLimitResult = checkRateLimit(ip);

  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      error: `Rate limit exceeded. You've used all ${MAX_REQUESTS_PER_HOUR} requests. Try again in ${rateLimitResult.resetInMinutes} minutes.`,
      remaining: 0,
      resetInMinutes: rateLimitResult.resetInMinutes,
      resetTime: rateLimitResult.resetTime
    });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT;
  const GEMINI_MODEL = process.env.GEMINI_MODEL;

  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing in the environment.");
    return res.status(500).json({ error: "Server configuration error" });
  }

  if (!SYSTEM_PROMPT) {
    console.error("SYSTEM_PROMPT is missing in the environment.");
    return res.status(500).json({ error: "Server configuration error" });
  }

  if (!GEMINI_MODEL) {
    console.error("GEMINI_MODEL is missing in the environment.");
    return res.status(500).json({ error: "Server configuration error" });
  }

  let userPrompt;
  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    userPrompt = body.prompt;
  } catch (error) {
    console.error("Invalid JSON body:", error);
    return res.status(400).json({ error: "Invalid request body" });
  }

  if (!userPrompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  if (typeof userPrompt !== "string" || userPrompt.length > 10000) {
    return res.status(400).json({ error: "Invalid prompt format or length" });
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser: ${userPrompt}`;

    const result = await model.generateContent(fullPrompt);
    const text = await result.response.text();

    return res.status(200).json({
      text,
      remaining: rateLimitResult.remaining,
      resetTime: rateLimitResult.resetTime
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    const message = error?.message || "Failed to generate content";
    return res.status(500).json({ error: message });
  }
}