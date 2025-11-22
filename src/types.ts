export interface CleanPasteOptions {
  format?: 'html' | 'markdown';
  ai?: boolean | string;
}

export interface RuleBasedCleaner {
  name: string;
  patterns: RegExp[];
  clean: (html: string) => string;
}

