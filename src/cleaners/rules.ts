import type { RuleBasedCleaner } from '../types.js';

/**
 * Ultra-fast rule-based cleaners for popular platforms
 */
export const ruleBasedCleaners: RuleBasedCleaner[] = [
  {
    name: 'notion',
    patterns: [
      /<div[^>]*class="notion-[^"]*"/gi,
      /data-block-id="[^"]*"/gi,
      /<span[^>]*class="notion-[^"]*"/gi,
      /<!-- notionvc:/gi,
    ],
    clean: (html: string) => {
      let cleaned = html;
      
      // Remove Notion comments (like <!-- notionvc: ... -->)
      cleaned = cleaned.replace(/<!-- notionvc:[^>]*-->/gi, '');
      cleaned = cleaned.replace(/<!--StartFragment-->/gi, '');
      cleaned = cleaned.replace(/<!--EndFragment-->/gi, '');
      
      // Preserve inline styles (colors, etc.) while removing Notion-specific attributes
      // Extract and preserve color styles from spans
      cleaned = cleaned.replace(/<span[^>]*class="[^"]*notion[^"]*"([^>]*)>/gi, (_match, attrs) => {
        // Extract style attribute if it contains color or other useful styles
        const styleMatch = attrs.match(/style="([^"]*)"/i);
        if (styleMatch) {
          const style = styleMatch[1];
          // Keep colors, font-weight, text-decoration, background-color
          const usefulStyles = style
            .split(';')
            .filter((s: string) => {
              const trimmed = s.trim().toLowerCase();
              return (
                trimmed.startsWith('color:') ||
                trimmed.startsWith('background-color:') ||
                trimmed.startsWith('font-weight:') ||
                trimmed.startsWith('text-decoration:') ||
                trimmed.startsWith('font-style:')
              );
            })
            .join(';');
          
          if (usefulStyles) {
            return `<span style="${usefulStyles}">`;
          }
        }
        return '<span>';
      });
      
      // Remove Notion-specific attributes but preserve styles in divs
      cleaned = cleaned.replace(/<div[^>]*class="[^"]*notion[^"]*"([^>]*)>/gi, (_match, attrs) => {
        const styleMatch = attrs.match(/style="([^"]*)"/i);
        if (styleMatch && styleMatch[1].trim()) {
          return `<div style="${styleMatch[1]}">`;
        }
        return '<div>';
      });
      
      // Remove data attributes
      cleaned = cleaned.replace(/data-block-id="[^"]*"/gi, '');
      cleaned = cleaned.replace(/data-token-index="[^"]*"/gi, '');
      
      // Remove empty divs
      cleaned = cleaned.replace(/<div>\s*<\/div>/gi, '');
      return cleaned;
    },
  },
  {
    name: 'google-docs',
    patterns: [
      /id="docs-internal-[^"]*"/gi,
      /<b[^>]*id="[^"]*"[^>]*>/gi,
      /<span[^>]*style="[^"]*font-family:[^"]*Google Sans[^"]*"/gi,
    ],
    clean: (html: string) => {
      let cleaned = html;
      // Remove Google Docs internal IDs
      cleaned = cleaned.replace(/id="docs-internal-[^"]*"/gi, '');
      // Clean up Google Sans font references
      cleaned = cleaned.replace(/font-family:[^;]*Google Sans[^;]*;?/gi, '');
      // Remove empty style attributes
      cleaned = cleaned.replace(/style="\s*"/gi, '');
      return cleaned;
    },
  },
  {
    name: 'microsoft-word',
    patterns: [
      /<o:p>\s*<\/o:p>/gi,
      /xmlns:o="[^"]*"/gi,
      /<w:[^>]*>/gi,
      /<!--\[if[^\]]*\]>/gi,
      /<!\[endif\]-->/gi,
    ],
    clean: (html: string) => {
      let cleaned = html;
      // Remove Office XML tags
      cleaned = cleaned.replace(/<o:p>\s*<\/o:p>/gi, '');
      cleaned = cleaned.replace(/xmlns:o="[^"]*"/gi, '');
      cleaned = cleaned.replace(/<w:[^>]*>/gi, '');
      // Remove Word conditional comments
      cleaned = cleaned.replace(/<!--\[if[^\]]*\]>.*?<!\[endif\]-->/gis, '');
      return cleaned;
    },
  },
  {
    name: 'apple-pages',
    patterns: [
      /<meta[^>]*name="Generator"[^>]*content="Pages[^"]*"/gi,
      /class="[^"]*Apple-[^"]*"/gi,
      /data-apple-[^"]*="[^"]*"/gi,
    ],
    clean: (html: string) => {
      let cleaned = html;
      // Remove Apple Pages metadata
      cleaned = cleaned.replace(/<meta[^>]*name="Generator"[^>]*content="Pages[^"]*"[^>]*>/gi, '');
      cleaned = cleaned.replace(/class="[^"]*Apple-[^"]*"/gi, '');
      cleaned = cleaned.replace(/data-apple-[^"]*="[^"]*"/gi, '');
      return cleaned;
    },
  },
  {
    name: 'confluence',
    patterns: [
      /<ac:[^>]*>/gi,
      /<ri:[^>]*>/gi,
      /class="confluence-[^"]*"/gi,
    ],
    clean: (html: string) => {
      let cleaned = html;
      // Remove Confluence-specific tags
      cleaned = cleaned.replace(/<ac:[^>]*>.*?<\/ac:[^>]*>/gi, '');
      cleaned = cleaned.replace(/<ri:[^>]*>.*?<\/ri:[^>]*>/gi, '');
      cleaned = cleaned.replace(/class="confluence-[^"]*"/gi, '');
      return cleaned;
    },
  },
  {
    name: 'figma',
    patterns: [
      /<svg[^>]*data-figma[^"]*"/gi,
      /class="[^"]*figma[^"]*"/gi,
    ],
    clean: (html: string) => {
      let cleaned = html;
      // Clean Figma SVG exports
      cleaned = cleaned.replace(/data-figma[^"]*="[^"]*"/gi, '');
      cleaned = cleaned.replace(/class="[^"]*figma[^"]*"/gi, '');
      return cleaned;
    },
  },
  {
    name: 'pdf',
    patterns: [
      /<link[^>]*type="application\/pdf[^"]*"/gi,
      /<meta[^>]*name="PDF[^"]*"/gi,
    ],
    clean: (html: string) => {
      let cleaned = html;
      // Remove PDF-related metadata
      cleaned = cleaned.replace(/<link[^>]*type="application\/pdf[^"]*"[^>]*>/gi, '');
      cleaned = cleaned.replace(/<meta[^>]*name="PDF[^"]*"[^>]*>/gi, '');
      return cleaned;
    },
  },
  {
    name: 'general',
    patterns: [
      /style="[^"]*mso-[^"]*"/gi,
      /style="[^"]*webkit-[^"]*"/gi,
      /<!--.*?-->/gs,
      /<script[^>]*>.*?<\/script>/gis,
      /<style[^>]*>.*?<\/style>/gis,
    ],
    clean: (html: string) => {
      let cleaned = html;
      
      // Clean MSO (Microsoft Office) styles while preserving useful styles
      cleaned = cleaned.replace(/style="([^"]*)"/gi, (_match, styles) => {
        if (!styles) return '';
        
        // Split styles and filter out unwanted ones
        const styleParts = styles.split(';').filter((part: string) => {
          const trimmed = part.trim().toLowerCase();
          if (!trimmed) return false;
          
          // Remove MSO and webkit-specific styles
          if (trimmed.includes('mso-') || trimmed.includes('webkit-')) {
            return false;
          }
          
          // Keep useful styles: colors, fonts, text formatting
          const keepStyles = [
            'color:',
            'background-color:',
            'font-weight:',
            'font-style:',
            'text-decoration:',
            'font-size:',
            'font-family:',
            'text-align:',
          ];
          
          return keepStyles.some(keep => trimmed.startsWith(keep));
        });
        
        if (styleParts.length > 0) {
          return `style="${styleParts.join(';')}"`;
        }
        return '';
      });
      
      // Remove comments (but preserve useful formatting)
      cleaned = cleaned.replace(/<!--.*?-->/gs, '');
      
      // Remove scripts and styles (safety)
      cleaned = cleaned.replace(/<script[^>]*>.*?<\/script>/gis, '');
      cleaned = cleaned.replace(/<style[^>]*>.*?<\/style>/gis, '');
      
      // Clean up empty attributes
      cleaned = cleaned.replace(/class="\s*"/gi, '');
      cleaned = cleaned.replace(/id="\s*"/gi, '');
      cleaned = cleaned.replace(/style="\s*"/gi, '');
      
      // Normalize whitespace between tags (but preserve content whitespace)
      cleaned = cleaned.replace(/>\s+</g, '><');
      cleaned = cleaned.trim();
      
      return cleaned;
    },
  },
];

/**
 * Apply all rule-based cleaners to HTML
 */
export function applyRuleBasedCleaners(html: string): string {
  let cleaned = html;
  
  for (const cleaner of ruleBasedCleaners) {
    const shouldApply = cleaner.patterns.some((pattern) => pattern.test(cleaned));
    if (shouldApply) {
      cleaned = cleaner.clean(cleaned);
    }
  }
  
  // Final normalization (preserve whitespace in content)
  cleaned = cleaned.replace(/>\s+</g, '><');
  cleaned = cleaned.trim();
  
  return cleaned;
}

