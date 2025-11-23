import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanPaste } from './core.js';

describe('cleanPaste', () => {
  describe('with string input', () => {
    it('should clean HTML string', async () => {
      const dirty = '<div class="notion-block" data-block-id="123">Hello</div>';
      const cleaned = await cleanPaste(dirty);
      expect(cleaned).not.toContain('notion-block');
      expect(cleaned).not.toContain('data-block-id');
      expect(cleaned).toContain('Hello');
    });

    it('should return empty string for empty input', async () => {
      const cleaned = await cleanPaste('');
      expect(cleaned).toBe('');
    });

    it('should handle HTML from Google Docs', async () => {
      const dirty = '<p id="docs-internal-guid-123" style="font-family: Google Sans">Test</p>';
      const cleaned = await cleanPaste(dirty);
      expect(cleaned).not.toContain('docs-internal');
      expect(cleaned).not.toContain('Google Sans');
      expect(cleaned).toContain('Test');
    });

    it('should handle HTML from Microsoft Word', async () => {
      const dirty = '<p><o:p>&nbsp;</o:p>Word content</p>';
      const cleaned = await cleanPaste(dirty);
      expect(cleaned).not.toContain('<o:p>');
      expect(cleaned).toContain('Word content');
    });

    it('should remove scripts and styles', async () => {
      const dirty = '<p>Hello</p><script>alert("xss")</script><style>.bad {}</style>';
      const cleaned = await cleanPaste(dirty);
      expect(cleaned).not.toContain('<script>');
      expect(cleaned).not.toContain('<style>');
      expect(cleaned).toContain('Hello');
    });

    it('should convert to markdown when format is markdown', async () => {
      const dirty = '<h1>Title</h1><p><strong>Bold</strong> and <em>italic</em></p>';
      const cleaned = await cleanPaste(dirty, { format: 'markdown' });
      expect(cleaned).toContain('# Title');
      expect(cleaned).toContain('**Bold**');
      expect(cleaned).toContain('*italic*');
    });
  });

  describe('with ClipboardEvent', () => {
    it('should extract HTML from clipboard', async () => {
      const clipboardData = {
        getData: vi.fn((type: string) => {
          if (type === 'text/html') return '<p>Pasted content</p>';
          return '';
        }),
      };
      
      // Create mock event that works in Node.js environment
      const mockEvent = {
        clipboardData,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as ClipboardEvent;

      const cleaned = await cleanPaste(mockEvent);
      expect(cleaned).toContain('Pasted content');
    });

    it('should fallback to plain text if no HTML', async () => {
      const clipboardData = {
        getData: vi.fn((type: string) => {
          if (type === 'text/plain') return 'Plain text';
          return '';
        }),
      };
      
      // Create mock event that works in Node.js environment
      const mockEvent = {
        clipboardData,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as ClipboardEvent;

      const cleaned = await cleanPaste(mockEvent);
      expect(cleaned).toContain('Plain text');
    });
  });

  describe('with invalid input', () => {
    it('should throw error for invalid input type', async () => {
      await expect(cleanPaste(null as unknown as string)).rejects.toThrow();
    });
  });

  describe('with AI mode', () => {
    beforeEach(() => {
      vi.stubEnv('GEMINI_API_KEY', 'test-key');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
      vi.restoreAllMocks();
    });

    it('should fallback to rule-based when AI fails', async () => {
      const dirty = '<div class="notion-block">Test</div>';
      const cleaned = await cleanPaste(dirty, { ai: true });
      // Should still work (fallback to rule-based)
      expect(cleaned).toContain('Test');
    });
  });
});

