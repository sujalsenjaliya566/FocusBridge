/**
 * Prompt builder for Gemma 2 instruction-tuned models.
 * Uses Gemma's official turn tokens: <start_of_turn> / <end_of_turn>.
 */

export function buildGemmaPrompt(passage: string, anchor: string): string {
  const systemInstruction = `You are a cognitive deconstruction engine built for neurodivergent academic readers. Your task is to analyse a given academic passage and return a structured JSON object. You MUST return ONLY raw JSON — no markdown code fences, no preamble, no trailing commentary.

The JSON must strictly conform to this schema:
{
  "coreTakeaway": "<single active-voice sentence capturing the core idea>",
  "mechanics": [
    { "phase": "<short label>", "explanation": "<concrete explanation of this step/phase>" }
  ],
  "analogy": "<2–3 sentences mapping this concept to the domain: ${anchor}>",
  "checkpoint": {
    "question": "<Socratic comprehension question about the passage>",
    "options": ["<option A>", "<option B>", "<option C>", "<option D>"],
    "correctIndex": <0-based integer>,
    "explanation": "<why the correct answer is correct>"
  }
}

Rules:
- coreTakeaway: exactly one sentence, active voice, no hedging language.
- mechanics: 3 to 5 phases that walk through the mechanism step by step.
- analogy: use concrete domain-specific vocabulary from "${anchor}" to create a memorable mental model.
- checkpoint: the question must test conceptual understanding, not surface-level recall.
- Output ONLY the JSON object. No markdown. No \`\`\`json fences.`;

  const userMessage = `Analyse the following academic passage and return the JSON analysis:\n\n---\n${passage}\n---`;

  return `<start_of_turn>user\n${systemInstruction}\n\n${userMessage}<end_of_turn>\n<start_of_turn>model\n`;
}
