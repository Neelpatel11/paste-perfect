import type { CleanPasteOptions } from '../types.js';

// Dynamic import - @google/generative-ai is an optional peer dependency
// Using 'any' type since we can't import types for optional dependencies at compile time
let geminiModule: any = null;

async function loadGemini() {
  if (geminiModule) {
    return geminiModule;
  }
  
  try {
    // Dynamic import - @ts-ignore needed for optional peer dependency
    // @ts-ignore - Optional peer dependency may not be installed
    geminiModule = await import('@google/generative-ai');
    return geminiModule;
  } catch (error) {
    throw new Error(
      'AI mode requires @google/generative-ai. Install it with: npm install @google/generative-ai'
    );
  }
}

/**
 * AI-powered paste cleaning using Gemini 1.5 Flash
 */
export async function cleanWithAI(
  html: string,
  options: CleanPasteOptions
): Promise<string> {
  const apiKey = typeof options.ai === 'string' ? options.ai : process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'AI mode requires GEMINI_API_KEY environment variable or options.ai as API key string'
    );
  }
  
  const gemini = await loadGemini();
  const model = gemini.GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: 'gemini-1.5-flash',
  });
  
  const prompt = `You are a paste cleaning expert. Clean this HTML content by:
1. Removing platform-specific attributes (Notion, Google Docs, Word, etc.)
2. Keeping only semantic HTML structure
3. Preserving formatting but removing inline styles and classes
4. Removing comments, scripts, and metadata
5. Normalizing whitespace
6. Returning only the cleaned HTML without explanations

HTML to clean:
${html}`;
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const cleaned = response.text().trim();
    
    // Extract HTML if wrapped in markdown code blocks
    const htmlMatch = cleaned.match(/```html?\n([\s\S]*?)\n```/i) ||
                     cleaned.match(/```\n([\s\S]*?)\n```/) ||
                     cleaned.match(/<[^>]+>/); // Check if it's HTML
    
    return htmlMatch ? htmlMatch[1] ?? htmlMatch[0] ?? cleaned : cleaned;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`AI cleaning failed: ${message}`);
  }
}

/**
 * Check if AI mode is available
 */
export function isAIAvailable(): boolean {
  return typeof process !== 'undefined' && 
         typeof process.env !== 'undefined' && 
         process.env.GEMINI_API_KEY !== undefined;
}

