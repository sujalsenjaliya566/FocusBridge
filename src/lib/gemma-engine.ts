/**
 * LocalGemmaService — dual-mode local AI engine.
 *
 * Mode 1: WebGPU via @mlc-ai/web-llm (model: gemma-2-2b-it-q4f16_1-MLC)
 * Mode 2: Ollama HTTP fallback (model: gemma2:2b)
 *
 * JSON output is sanitized and defensively parsed to handle any model
 * formatting quirks.
 */

import type { CognitiveAnalysis, EngineProgress } from "@/types";
import { buildGemmaPrompt } from "./prompts";

// Lazily imported to avoid SSR issues — web-llm uses WebGPU APIs
let webllmModule: typeof import("@mlc-ai/web-llm") | null = null;
let mlcEngine: import("@mlc-ai/web-llm").MLCEngine | null = null;

const MODEL_ID = "gemma-2-2b-it-q4f16_1-MLC";

// ─── JSON Sanitizer ──────────────────────────────────────────────────────────

function sanitizeJsonOutput(raw: string): CognitiveAnalysis {
  // Strip markdown code fences
  let cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // Extract content between outermost braces
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }

  try {
    const parsed = JSON.parse(cleaned) as CognitiveAnalysis;
    assertCognitiveAnalysis(parsed);
    return parsed;
  } catch {
    // Defensive regex extraction for each field
    return extractFieldsRegex(cleaned);
  }
}

function assertCognitiveAnalysis(obj: unknown): asserts obj is CognitiveAnalysis {
  if (
    typeof obj !== "object" ||
    obj === null ||
    !("coreTakeaway" in obj) ||
    !("mechanics" in obj) ||
    !("analogy" in obj) ||
    !("checkpoint" in obj)
  ) {
    throw new Error("Invalid CognitiveAnalysis shape");
  }
}

function extractFieldsRegex(text: string): CognitiveAnalysis {
  const coreTakeawayMatch = text.match(/"coreTakeaway"\s*:\s*"([^"]+)"/);
  const analogyMatch = text.match(/"analogy"\s*:\s*"([^"]+)"/);
  const questionMatch = text.match(/"question"\s*:\s*"([^"]+)"/);
  const explanationMatch = text.match(/"explanation"\s*:\s*"([^"]+)"/);

  const coreTakeaway = coreTakeawayMatch?.[1] ?? "Analysis could not be parsed cleanly.";
  const analogy = analogyMatch?.[1] ?? "No analogy extracted.";
  const question = questionMatch?.[1] ?? "What is the main concept described?";
  const explanation = explanationMatch?.[1] ?? "See the passage for details.";

  // Try to extract mechanics array
  const mechanicsMatch = text.match(/"mechanics"\s*:\s*\[([^\]]+)\]/);
  let mechanics: CognitiveAnalysis["mechanics"] = [];
  if (mechanicsMatch) {
    try {
      mechanics = JSON.parse(`[${mechanicsMatch[1]}]`) as CognitiveAnalysis["mechanics"];
    } catch {
      mechanics = [{ phase: "Step 1", explanation: "See passage." }];
    }
  } else {
    mechanics = [{ phase: "Step 1", explanation: "See passage." }];
  }

  // Try to extract options array
  const optionsMatch = text.match(/"options"\s*:\s*\[([^\]]+)\]/);
  let options: string[] = ["Option A", "Option B", "Option C", "Option D"];
  if (optionsMatch) {
    try {
      options = JSON.parse(`[${optionsMatch[1]}]`) as string[];
    } catch {
      // use defaults
    }
  }

  const correctIndexMatch = text.match(/"correctIndex"\s*:\s*(\d)/);
  const correctIndex = correctIndexMatch ? parseInt(correctIndexMatch[1], 10) : 0;

  return {
    coreTakeaway,
    mechanics,
    analogy,
    checkpoint: { question, options, correctIndex, explanation },
  };
}

// ─── WebLLM Engine ───────────────────────────────────────────────────────────

async function loadWebLLMEngine(
  onProgress: (progress: EngineProgress) => void
): Promise<import("@mlc-ai/web-llm").MLCEngine> {
  if (mlcEngine) return mlcEngine;

  webllmModule = await import("@mlc-ai/web-llm");

  const engine = new webllmModule.MLCEngine({
    initProgressCallback: (report: import("@mlc-ai/web-llm").InitProgressReport) => {
      onProgress({
        text: report.text,
        percent: Math.round(report.progress * 100),
      });
    },
  });

  await engine.reload(MODEL_ID);

  mlcEngine = engine;
  return engine;
}

async function runWebLLM(
  prompt: string,
  onProgress: (progress: EngineProgress) => void
): Promise<string> {
  const engine = await loadWebLLMEngine(onProgress);

  const response = await engine.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 1024,
  });

  return response.choices[0]?.message?.content ?? "";
}

// ─── Ollama Engine ────────────────────────────────────────────────────────────

async function runOllama(
  prompt: string,
  endpoint: string,
  onProgress: (progress: EngineProgress) => void
): Promise<string> {
  onProgress({ text: "Sending request to Ollama daemon…", percent: 10 });

  const response = await fetch(`${endpoint}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemma2:2b",
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Ollama request failed: ${response.status} ${response.statusText}`
    );
  }

  onProgress({ text: "Receiving response…", percent: 80 });

  const data = (await response.json()) as { response: string };
  return data.response ?? "";
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface RunAnalysisOptions {
  passage: string;
  analogyAnchor: string;
  engineMode: "webllm" | "ollama";
  ollamaEndpoint: string;
  onProgress: (progress: EngineProgress) => void;
}

export async function runGemmaAnalysis(
  options: RunAnalysisOptions
): Promise<CognitiveAnalysis> {
  const { passage, analogyAnchor, engineMode, ollamaEndpoint, onProgress } =
    options;

  const prompt = buildGemmaPrompt(passage, analogyAnchor);

  let rawOutput: string;

  if (engineMode === "webllm") {
    try {
      rawOutput = await runWebLLM(prompt, onProgress);
    } catch (webllmError) {
      // Graceful fallback to Ollama if WebGPU is unavailable
      console.warn(
        "[FocusBridge] WebLLM failed, falling back to Ollama:",
        webllmError
      );
      onProgress({ text: "WebGPU unavailable — falling back to Ollama…", percent: 5 });
      rawOutput = await runOllama(prompt, ollamaEndpoint, onProgress);
    }
  } else {
    rawOutput = await runOllama(prompt, ollamaEndpoint, onProgress);
  }

  onProgress({ text: "Parsing cognitive analysis…", percent: 95 });

  const analysis = sanitizeJsonOutput(rawOutput);

  onProgress({ text: "Done", percent: 100 });

  return analysis;
}
