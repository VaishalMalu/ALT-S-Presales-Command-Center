export const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function generateText(prompt: string, systemPrompt?: string): Promise<string> {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is missing");

  const messages: ChatMessage[] = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API Error: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function generateJSON<T>(prompt: string, systemPrompt?: string): Promise<T> {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is missing");

  const messages: ChatMessage[] = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt + "\n\nYou MUST respond ONLY with valid JSON. Do not include markdown code blocks (```json ... ```), just the raw JSON object." });
  } else {
    messages.push({ role: "system", content: "You are a data extraction AI. You MUST respond ONLY with valid JSON. Do not include markdown code blocks, just the raw JSON object." });
  }
  
  messages.push({ role: "user", content: prompt });

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.1, // Low temperature for consistent JSON
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API Error: ${err}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content) as T;
  } catch (e) {
    console.error("Failed to parse Groq JSON response:", content);
    throw new Error("Invalid JSON returned from AI");
  }
}
