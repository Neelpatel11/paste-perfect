import { applyRuleBasedCleaners } from './cleaners/rules.js';
import { cleanWithAI } from './cleaners/ai.js';
import type { CleanPasteOptions } from './types.js';

/**
 * Extract HTML from ClipboardEvent
 */
function extractHTMLFromClipboard(event: ClipboardEvent): string {
  const clipboardData = event.clipboardData ?? 
    (event as unknown as { clipboardData?: DataTransfer }).clipboardData;
  
  if (!clipboardData) {
    return '';
  }
  
  // Try HTML first
  const html = clipboardData.getData('text/html');
  if (html) {
    return html;
  }
  
  // Fallback to plain text
  const text = clipboardData.getData('text/plain');
  return text ? `<p>${escapeHtml(text)}</p>` : '';
}

/**
 * Escape HTML entities
 */
function escapeHtml(text: string): string {
  const div = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (div) {
    div.textContent = text;
    return div.innerHTML;
  }
  // Fallback for Node.js
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Convert HTML to Markdown (simple implementation)
 */
function htmlToMarkdown(html: string): string {
  let markdown = html;
  
  // Headers
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');
  
  // Bold
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  
  // Italic
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  
  // Links
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  
  // Lists
  markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  markdown = markdown.replace(/<ul[^>]*>/gi, '');
  markdown = markdown.replace(/<ol[^>]*>/gi, '');
  markdown = markdown.replace(/<\/ul>/gi, '\n');
  markdown = markdown.replace(/<\/ol>/gi, '\n');
  
  // Paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  markdown = markdown.replace(/<br[^>]*>/gi, '\n');
  
  // Code
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  markdown = markdown.replace(/<pre[^>]*>(.*?)<\/pre>/gi, '```\n$1\n```\n');
  
  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]+>/g, '');
  
  // Decode HTML entities
  markdown = markdown
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
  
  // Normalize whitespace
  markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();
  
  return markdown;
}

/**
 * Core cleanPaste function
 */
export async function cleanPaste(
  input: string | ClipboardEvent,
  options: CleanPasteOptions = {}
): Promise<string> {
  // Extract HTML from input
  let html: string;
  
  if (typeof input === 'string') {
    html = input;
  } else if (
    typeof ClipboardEvent !== 'undefined' && 
    input instanceof ClipboardEvent
  ) {
    html = extractHTMLFromClipboard(input);
  } else if (
    input && 
    typeof input === 'object' && 
    'clipboardData' in input
  ) {
    // Fallback for test environments where ClipboardEvent might not be available
    html = extractHTMLFromClipboard(input as ClipboardEvent);
  } else {
    throw new Error('Input must be a string or ClipboardEvent');
  }
  
  if (!html || html.trim().length === 0) {
    return '';
  }
  
  // Determine if AI should be used
  const useAI = options.ai !== undefined && options.ai !== false;
  
  let cleaned: string;
  
  if (useAI) {
    try {
      cleaned = await cleanWithAI(html, options);
    } catch (error) {
      // Fallback to rule-based if AI fails
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`AI cleaning failed, falling back to rule-based: ${message}`);
      cleaned = applyRuleBasedCleaners(html);
    }
  } else {
    cleaned = applyRuleBasedCleaners(html);
  }
  
  // Convert format if needed
  if (options.format === 'markdown') {
    return htmlToMarkdown(cleaned);
  }
  
  return cleaned;
}

