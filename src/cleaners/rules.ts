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
      /<meta[^>]*charset="utf-8"[^>]*>/gi,
      /<!--StartFragment-->/gi,
      /<!--EndFragment-->/gi,
    ],
    clean: (html: string) => {
      let cleaned = html;
      
      // Remove Google Docs comments
      cleaned = cleaned.replace(/<!--StartFragment-->/gi, '');
      cleaned = cleaned.replace(/<!--EndFragment-->/gi, '');
      
      // Remove meta tags that Google Docs adds
      cleaned = cleaned.replace(/<meta[^>]*charset="utf-8"[^>]*>/gi, '');
      
      // Remove Google Docs internal IDs from all elements
      cleaned = cleaned.replace(/id="docs-internal-[^"]*"/gi, '');
      cleaned = cleaned.replace(/\s+id="[^"]*"/gi, ''); // Remove any remaining IDs
      
      // Remove Google Docs specific attributes
      cleaned = cleaned.replace(/\s+dir="ltr"/gi, '');
      cleaned = cleaned.replace(/\s+dir="rtl"/gi, '');
      
      // Remove redundant <b> tags with font-weight:normal (Google Docs wrapper)
      cleaned = cleaned.replace(/<b[^>]*style="[^"]*font-weight:\s*normal[^"]*"[^>]*>/gi, '');
      cleaned = cleaned.replace(/<b[^>]*>\s*/gi, ''); // Remove opening <b> tags
      cleaned = cleaned.replace(/\s*<\/b>/gi, ''); // Remove closing </b> tags
      
      // Clean up style attributes - remove Google Docs specific styles
      cleaned = cleaned.replace(/style="([^"]*)"/gi, (_match, styles) => {
        if (!styles) return '';
        
        // Split and filter styles
        const styleParts = styles.split(';').filter((part: string) => {
          const trimmed = part.trim().toLowerCase();
          if (!trimmed) return false;
          
          // Remove Google Docs specific styles
          const removePatterns = [
            'font-variant:',
            'vertical-align:',
            'white-space:pre',
            'white-space:pre-wrap',
            'background-color:transparent',
            'font-family:arial,sans-serif', // Common default, can be removed
            'font-family:arial',
          ];
          
          if (removePatterns.some(pattern => trimmed.includes(pattern))) {
            return false;
          }
          
          // Keep only essential styles
          const keepStyles = [
            'color:',
            'background-color:', // But not transparent
            'font-weight:',
            'font-style:',
            'text-decoration:',
            'font-size:',
            'text-align:',
          ];
          
          // Keep if it's a useful style and not transparent background
          if (keepStyles.some(keep => trimmed.startsWith(keep))) {
            // Don't keep transparent backgrounds
            if (trimmed.startsWith('background-color:') && trimmed.includes('transparent')) {
              return false;
            }
            return true;
          }
          
          return false;
        });
        
        if (styleParts.length > 0) {
          return `style="${styleParts.join(';')}"`;
        }
        return '';
      });
      
      // Remove empty style attributes
      cleaned = cleaned.replace(/\s+style="\s*"/gi, '');
      cleaned = cleaned.replace(/style="\s*"/gi, '');
      
      // Remove empty attributes
      cleaned = cleaned.replace(/\s+id="\s*"/gi, '');
      cleaned = cleaned.replace(/\s+dir="\s*"/gi, '');
      
      return cleaned;
    },
  },
  {
    name: 'microsoft-word',
    patterns: [
      /<o:p>/gi,
      /<\/o:p>/gi,
      /xmlns:o="[^"]*"/gi,
      /<w:[^>]*>/gi,
      /<!--\[if[^\]]*\]>/gi,
      /<!\[endif\]-->/gi,
    ],
    clean: (html: string) => {
      let cleaned = html;
      // Remove Office XML tags (both opening and closing)
      cleaned = cleaned.replace(/<o:p>.*?<\/o:p>/gi, '');
      cleaned = cleaned.replace(/<o:p[^>]*>/gi, '');
      cleaned = cleaned.replace(/<\/o:p>/gi, '');
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
  
  // Final normalization
  // Remove whitespace between tags
  cleaned = cleaned.replace(/>\s+</g, '><');
  // Normalize whitespace inside text content (but preserve single spaces)
  cleaned = cleaned.replace(/>([^<]+)</g, (match, content) => {
    const normalized = content.replace(/\s+/g, ' ').trim();
    return normalized ? `>${normalized}<` : match;
  });
  cleaned = cleaned.trim();
  
  return cleaned;
}

