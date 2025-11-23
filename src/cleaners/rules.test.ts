import { describe, it, expect } from 'vitest';
import { applyRuleBasedCleaners } from './rules.js';

describe('applyRuleBasedCleaners', () => {
  it('should clean Notion HTML', () => {
    const dirty = '<div class="notion-block" data-block-id="123">Hello</div>';
    const cleaned = applyRuleBasedCleaners(dirty);
    expect(cleaned).not.toContain('notion-block');
    expect(cleaned).not.toContain('data-block-id');
    expect(cleaned).toContain('Hello');
  });

  it('should clean Google Docs HTML', () => {
    const dirty = '<p id="docs-internal-guid-123">Test</p>';
    const cleaned = applyRuleBasedCleaners(dirty);
    expect(cleaned).not.toContain('docs-internal');
    expect(cleaned).toContain('Test');
  });

  it('should remove Google Docs <b> wrapper tags', () => {
    const dirty = '<b style="font-weight:normal;" id="docs-internal-123"><h1>Test</h1></b>';
    const cleaned = applyRuleBasedCleaners(dirty);
    expect(cleaned).not.toContain('<b');
    expect(cleaned).not.toContain('</b>');
    expect(cleaned).not.toContain('docs-internal');
    expect(cleaned).toContain('<h1>Test</h1>');
  });

  it('should remove Google Docs specific styles', () => {
    const dirty = '<b id="docs-internal-123"><span style="font-variant:normal;vertical-align:baseline;white-space:pre;color:#000000;">Test</span></b>';
    const cleaned = applyRuleBasedCleaners(dirty);
    expect(cleaned).not.toContain('font-variant');
    expect(cleaned).not.toContain('vertical-align');
    expect(cleaned).not.toContain('white-space');
    expect(cleaned).not.toContain('<b'); // Should remove <b> wrapper
    expect(cleaned).toContain('color:#000000'); // Should keep color
    expect(cleaned).toContain('Test');
  });

  it('should remove Google Docs comments and meta tags', () => {
    const dirty = '<!--StartFragment--><meta charset="utf-8"><p>Test</p><!--EndFragment-->';
    const cleaned = applyRuleBasedCleaners(dirty);
    expect(cleaned).not.toContain('StartFragment');
    expect(cleaned).not.toContain('EndFragment');
    expect(cleaned).not.toContain('<meta');
    expect(cleaned).toContain('<p>Test</p>');
  });

  it('should clean Microsoft Word HTML', () => {
    const dirty = '<p><o:p>&nbsp;</o:p>Content</p>';
    const cleaned = applyRuleBasedCleaners(dirty);
    expect(cleaned).not.toContain('<o:p>');
    expect(cleaned).toContain('Content');
  });

  it('should remove scripts', () => {
    const dirty = '<p>Hello</p><script>alert("xss")</script>';
    const cleaned = applyRuleBasedCleaners(dirty);
    expect(cleaned).not.toContain('<script>');
    expect(cleaned).toContain('Hello');
  });

  it('should remove styles', () => {
    const dirty = '<p>Hello</p><style>.bad {}</style>';
    const cleaned = applyRuleBasedCleaners(dirty);
    expect(cleaned).not.toContain('<style>');
    expect(cleaned).toContain('Hello');
  });

  it('should remove comments', () => {
    const dirty = '<p>Hello</p><!-- comment -->';
    const cleaned = applyRuleBasedCleaners(dirty);
    expect(cleaned).not.toContain('<!--');
    expect(cleaned).toContain('Hello');
  });

  it('should normalize whitespace', () => {
    const dirty = '<p>   Hello   World   </p>';
    const cleaned = applyRuleBasedCleaners(dirty);
    expect(cleaned).toBe('<p>Hello World</p>');
  });

  it('should handle empty HTML', () => {
    const cleaned = applyRuleBasedCleaners('');
    expect(cleaned).toBe('');
  });

  it('should handle Apple Pages HTML', () => {
    const dirty = '<div class="Apple-style-span">Content</div>';
    const cleaned = applyRuleBasedCleaners(dirty);
    expect(cleaned).not.toContain('Apple-style-span');
    expect(cleaned).toContain('Content');
  });

  it('should handle Confluence HTML', () => {
    const dirty = '<ac:link><ri:page ri:content-title="Test"/>Content</ac:link>';
    const cleaned = applyRuleBasedCleaners(dirty);
    expect(cleaned).not.toContain('ac:link');
    expect(cleaned).not.toContain('ri:page');
  });
});

