import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanWithAI, isAIAvailable } from './ai.js';

describe('cleanWithAI', () => {
  beforeEach(() => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('should throw error when no API key provided', async () => {
    vi.unstubAllEnvs();
    delete process.env.GEMINI_API_KEY;
    
    await expect(cleanWithAI('<p>Test</p>', {})).rejects.toThrow('AI mode requires');
  });

  it('should use API key from options', async () => {
    vi.unstubAllEnvs();
    delete process.env.GEMINI_API_KEY;
    
    // Mock the import to fail (no actual module)
    const originalImport = global.import;
    global.import = vi.fn().mockRejectedValue(new Error('Module not found'));
    
    await expect(cleanWithAI('<p>Test</p>', { ai: 'custom-key' })).rejects.toThrow();
    
    global.import = originalImport;
  });

  it('should check AI availability', () => {
    expect(isAIAvailable()).toBe(true);
    
    vi.unstubAllEnvs();
    delete process.env.GEMINI_API_KEY;
    expect(isAIAvailable()).toBe(false);
  });
});

