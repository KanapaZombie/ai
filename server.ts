import "dotenv/config";
import express from "express";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Add it in the Settings > Secrets panel to enable SafetyScan Vision & TTS."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function getApiErrorInfo(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes("GEMINI_API_KEY is not configured")) {
    return { status: 503, message: raw };
  }
  if (raw.includes("API_KEY_INVALID") || raw.includes("PERMISSION_DENIED") || raw.includes("403")) {
    return {
      status: 403,
      message:
        "Gemini API key was rejected (403/invalid). Please verify GEMINI_API_KEY in the Settings > Secrets panel.",
    };
  }
  if (raw.includes("RESOURCE_EXHAUSTED") || raw.includes("429")) {
    return {
      status: 429,
      message: "Gemini API rate limit or quota reached (429). Please retry in a moment.",
    };
  }
  if (raw.includes("NOT_FOUND") || raw.includes("404")) {
    return {
      status: 404,
      message: "Requested Gemini model endpoint was not found (404).",
    };
  }
  return { status: 500, message: raw || "Unexpected Gemini API error." };
}

interface AuditHop {
  url: string;
  statusCode: number;
  location?: string;
  xFrameOptions?: string;
}

interface AuditResult {
  url: string;
  finalUrl: string;
  statusCode: number | null;
  diagnosis:
    | "LIVE"
    | "AUTH_WALL_GEMINI_SHARE"
    | "AUTH_WALL_CLAUDE_PRIVATE"
    | "AUTH_WALL_APP"
    | "BOT_SHIELD_403"
    | "ERROR";
  title: string;
  reason: string;
  hops: AuditHop[];
  checkedAt: string;
}

function fetchWithLargeHeaders(
  targetUrl: string,
  timeoutMs = 7000
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(targetUrl);
    const client = parsed.protocol === "https:" ? https : http;
    const req = client.request(
      parsed,
      {
        method: "GET",
        maxHeaderSize: 65536, // Bypass Node's 16KB default header cap hit by gemini.google.com
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        let total = 0;
        const maxBytes = 256 * 1024;
        res.on("data", (chunk: Buffer) => {
          if (total < maxBytes) {
            chunks.push(chunk);
            total += chunk.length;
          } else {
            res.destroy();
          }
        });
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode ?? 0,
            headers: res.headers,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
        res.on("close", () => {
          resolve({
            statusCode: res.statusCode ?? 0,
            headers: res.headers,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      }
    );
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error("Request timed out"));
    });
    req.on("error", reject);
    req.end();
  });
}

async function auditUrl(startUrl: string): Promise<AuditResult> {
  const hops: AuditHop[] = [];
  let currentUrl = startUrl;
  let lastBody = "";
  let lastStatus: number | null = null;

  try {
    for (let i = 0; i < 6; i++) {
      const res = await fetchWithLargeHeaders(currentUrl);
      lastStatus = res.statusCode;
      lastBody = res.body;
      const loc = typeof res.headers.location === "string" ? res.headers.location : undefined;
      const xfo =
        typeof res.headers["x-frame-options"] === "string"
          ? res.headers["x-frame-options"]
          : undefined;
      hops.push({ url: currentUrl, statusCode: res.statusCode, location: loc, xFrameOptions: xfo });
      if (loc && res.statusCode >= 300 && res.statusCode < 400) {
        currentUrl = new URL(loc, currentUrl).toString();
        continue;
      }
      break;
    }

    const titleMatch = lastBody.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, " ") : "";
    const isGemini =
      currentUrl.includes("gemini.google.com/share") || startUrl.includes("share.gemini.google");

    if (isGemini) {
      const hasLoginGate =
        lastBody.includes("ServiceLogin") || lastBody.includes("consent.google.com");
      const hasDeniedEmbed = hops.some(
        (h) => h.xFrameOptions === "DENY" || h.xFrameOptions === "SAMEORIGIN"
      );
      return {
        url: startUrl,
        finalUrl: currentUrl,
        statusCode: lastStatus,
        diagnosis: "AUTH_WALL_GEMINI_SHARE",
        title: title || "Gemini - direct access to Google AI",
        reason: `Redirects to ${currentUrl}; ${
          hasLoginGate ? "enforces Google ServiceLogin/Consent gate" : "requires active Gemini session"
        }${hasDeniedEmbed ? " and blocks iframe embedding (X-Frame-Options)" : ""}.`,
        hops,
        checkedAt: new Date().toISOString(),
      };
    }

    if (currentUrl.includes("claude.ai/chat/")) {
      return {
        url: startUrl,
        finalUrl: currentUrl,
        statusCode: lastStatus,
        diagnosis: "AUTH_WALL_CLAUDE_PRIVATE",
        title: title || "Claude Private Chat",
        reason: `HTTP ${lastStatus} — points to a private claude.ai/chat/ session instead of a published claude.site artifact URL.`,
        hops,
        checkedAt: new Date().toISOString(),
      };
    }

    if (lastStatus === 403 && (lastBody.includes("Just a moment") || lastBody.includes("cf-"))) {
      return {
        url: startUrl,
        finalUrl: currentUrl,
        statusCode: lastStatus,
        diagnosis: "BOT_SHIELD_403",
        title: title || "Cloudflare Challenge",
        reason: "HTTP 403 to automated probes due to Cloudflare browser challenge (works interactively in browser).",
        hops,
        checkedAt: new Date().toISOString(),
      };
    }

    if (lastBody.includes("SIGN IN FOR ACCESS") || lastBody.includes("SIGN IN TO ANALYZE")) {
      return {
        url: startUrl,
        finalUrl: currentUrl,
        statusCode: lastStatus,
        diagnosis: "AUTH_WALL_APP",
        title: title || "Auth-Gated App",
        reason: "Loads HTTP 200 but locks photo analysis behind mandatory user sign-in.",
        hops,
        checkedAt: new Date().toISOString(),
      };
    }

    return {
      url: startUrl,
      finalUrl: currentUrl,
      statusCode: lastStatus,
      diagnosis: lastStatus && lastStatus >= 200 && lastStatus < 400 ? "LIVE" : "ERROR",
      title: title || "Untitled",
      reason:
        lastStatus && lastStatus >= 200 && lastStatus < 400
          ? "Reachable without login gate."
          : `Returned HTTP ${lastStatus}.`,
      hops,
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      url: startUrl,
      finalUrl: currentUrl,
      statusCode: lastStatus,
      diagnosis: "ERROR",
      title: "Connection Error",
      reason: err instanceof Error ? err.message : "Failed to connect",
      hops,
      checkedAt: new Date().toISOString(),
    };
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "15mb" }));

  // Rebuilt SafetyScan YELLOW-TTS & GREEN-UI Vision Analyzer
  app.post("/api/safetyscan/analyze", async (req, res) => {
    try {
      const { imageBase64, mimeType, context, uiVariant } = req.body ?? {};
      if (!imageBase64 || typeof imageBase64 !== "string") {
        res.status(400).json({ error: "Missing base64 image payload." });
        return;
      }
      const allowedMimes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
      const safeMime =
        typeof mimeType === "string" && allowedMimes.includes(mimeType) ? mimeType : "image/jpeg";

      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const ai = getGeminiClient();

      const prompt = [
        "Analyze this scene from a civilian safety, environmental hazard, emergency preparedness, and physical obstacle triage perspective.",
        uiVariant === "green-ui"
          ? "Use crisp tactical field-audit language."
          : "Keep descriptions high-clarity, urgent when needed, and ready to be read aloud via TTS.",
        context && typeof context === "string" && context.trim()
          ? `User context note: ${context.trim()}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: {
          parts: [
            { inlineData: { mimeType: safeMime, data: cleanBase64 } },
            { text: prompt },
          ],
        },
        config: {
          systemInstruction:
            "You are SafetyScan (Yellow-TTS / Green-UI Tactical Edition), a civilian hazard & preparedness vision assistant. Inspect the image objectively. Never invent hazards that are not visible; if the scene looks safe, report CLEAR or LOW threat level honestly.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              threatLevel: {
                type: Type.STRING,
                description: "One of: CRITICAL, HIGH, MODERATE, LOW, CLEAR",
              },
              environment: {
                type: Type.STRING,
                description: "Short label of the visible environment.",
              },
              summary: {
                type: Type.STRING,
                description: "2-sentence situational overview.",
              },
              hazards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    severity: { type: Type.STRING },
                    location: { type: Type.STRING },
                    action: { type: Type.STRING },
                  },
                  required: ["title", "severity", "location", "action"],
                },
              },
              checklist: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              spokenBriefing: {
                type: Type.STRING,
                description:
                  "Concise 2-3 sentence calm spoken briefing suitable for immediate text-to-speech playback.",
              },
            },
            required: [
              "threatLevel",
              "environment",
              "summary",
              "hazards",
              "checklist",
              "spokenBriefing",
            ],
          },
        },
      });

      const rawText = (response.text ?? "{}").trim();
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (err) {
      const { status, message } = getApiErrorInfo(err);
      res.status(status).json({ error: message });
    }
  });

  // Rebuilt SafetyScan YELLOW-TTS Neural Speech Endpoint
  app.post("/api/safetyscan/tts", async (req, res) => {
    try {
      const { text, voiceName, style } = req.body ?? {};
      if (!text || typeof text !== "string" || !text.trim()) {
        res.status(400).json({ error: "Missing text for TTS briefing." });
        return;
      }

      const validVoices = ["Puck", "Charon", "Kore", "Fenrir", "Zephyr"];
      const safeVoice =
        typeof voiceName === "string" && validVoices.includes(voiceName) ? voiceName : "Fenrir";
      const safeStyle =
        typeof style === "string" && style.trim()
          ? style.trim().slice(0, 120)
          : "Calm, crisp tactical safety dispatcher briefing";

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash-lite-tts",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: text.trim().slice(0, 1500),
                speechMetadata: {
                  style: safeStyle,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: safeVoice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        res.status(502).json({ error: "Gemini TTS returned no audio payload." });
        return;
      }

      res.json({
        audioBase64: base64Audio,
        mimeType: "audio/wav",
        voiceName: safeVoice,
      });
    } catch (err) {
      const { status, message } = getApiErrorInfo(err);
      res.status(status).json({ error: message });
    }
  });

  // Live Link Audit Endpoint (handles Gemini >16KB headers & full redirect chains)
  app.post("/api/links/audit", async (req, res) => {
    try {
      const defaultUrls = [
        "https://gemini.google.com/share/db75accb5fc8?skid=4162005c-ddf8-433a-bb8e-5100d155757f",
        "https://share.gemini.google/t3iHHbyPnKXt",
        "https://share.gemini.google/zalozTH0CXXY",
        "https://share.gemini.google/F2IKnmFs9XEA",
        "https://share.gemini.google/pnKxkqnToMJo",
        "https://share.gemini.google/e1LvbryAog4S",
        "https://claude.ai/chat/300b6814-8a6d-4962-a399-70bc9fc18780?artifactId=safetyscan.html&versionUuid=2e3bfa9c-32da-42de-ac6c-06426141729b",
        "https://safetyscan.lovable.app/",
        "https://kanapazombie.github.io/",
        "https://rebreather.lovable.app/",
        "https://dopaminator.lovable.app/",
        "https://github.com/KanapaZombie/kanapa-download",
      ];
      const inputUrls: string[] = Array.isArray(req.body?.urls)
        ? req.body.urls
            .filter((u: unknown): u is string => typeof u === "string" && /^https?:\/\//.test(u))
            .slice(0, 20)
        : defaultUrls;

      const results = await Promise.all(inputUrls.map((u) => auditUrl(u)));
      res.json({ results, auditedAt: new Date().toISOString() });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : "Failed to run link audit.",
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
