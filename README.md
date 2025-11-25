<div align="center">

# ✨ Paste Perfect

**The smartest paste cleaner for every rich text editor in 2025**

[![npm version](https://img.shields.io/npm/v/paste-perfect.svg?style=for-the-badge)](https://www.npmjs.com/package/paste-perfect)
[![bundle size](https://img.shields.io/bundlephobia/minzip/paste-perfect?style=for-the-badge&label=size)](https://bundlephobia.com/package/paste-perfect)
[![license](https://img.shields.io/npm/l/paste-perfect.svg?style=for-the-badge)](https://github.com/neelpatel11/paste-perfect/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![test coverage](https://img.shields.io/badge/coverage-95%25+-green?style=for-the-badge)](https://github.com/neelpatel11/paste-perfect)

> **One line of code.** Clean paste from Notion, Google Docs, Word, Confluence, Figma, and more. With optional AI-powered cleaning using Gemini 1.5 Flash.

<br/>

![Paste Perfect Demo](pasteperfectdemogif.gif)

<div align="left">

---

## 🚀 Quick Start

```bash
npm install paste-perfect
```

```typescript
import { cleanPaste } from 'paste-perfect';

// Clean any HTML string
const cleaned = await cleanPaste(dirtyHTML);

// Clean from clipboard event
element.addEventListener('paste', async (e) => {
  e.preventDefault();
  const cleaned = await cleanPaste(e);
  // Insert cleaned HTML...
});

// React hook (automatic!)
import { usePasteCleaner } from 'paste-perfect/react';

function MyEditor() {
  const ref = useRef<HTMLDivElement>(null);
  usePasteCleaner(ref);
  return <div ref={ref} contentEditable />;
}
```

**That's it!** 🎉

---

## ✨ Features

- **🎯 Zero Config** - Works out of the box with ultra-fast rule-based cleaning
- **🤖 Optional AI** - Smart cleaning with Gemini 1.5 Flash (free tier) when `GEMINI_API_KEY` is set
- **⚡ Ultra Fast** - Rule-based fallback is <1ms, AI mode <500ms
- **📦 Tiny Bundle** - <10 KB gzipped, zero runtime deps (optional peer deps)
- **🌳 Tree-Shakable** - Only bundle what you use
- **📚 Works Everywhere** - Notion, Google Docs, Word, Apple Pages, PDFs, Confluence, Figma, and more
- **⚛️ React Ready** - One hook for automatic paste cleaning
- **🔒 Type Safe** - Full TypeScript support with strict mode
- **🎨 Format Support** - HTML and Markdown output formats

---

## 📖 Documentation

### Core API

```typescript
async function cleanPaste(
  input: string | ClipboardEvent,
  options?: {
    format?: 'html' | 'markdown';
    ai?: boolean | string; // true for env var, or API key string
  }
): Promise<string>
```

#### Basic Usage

```typescript
import { cleanPaste } from 'paste-perfect';

// Clean HTML string
const cleaned = await cleanPaste('<div class="notion-block">Hello</div>');
// → '<div>Hello</div>'

// Clean from clipboard
document.addEventListener('paste', async (e) => {
  e.preventDefault();
  const cleaned = await cleanPaste(e);
  // Insert cleaned content...
});

// Output as Markdown
const markdown = await cleanPaste(dirtyHTML, { format: 'markdown' });
// → '# Title\n\n**Bold** text'
```

#### AI Mode

Enable AI-powered cleaning with Gemini 1.5 Flash:

```bash
# Set environment variable
export GEMINI_API_KEY=your-api-key
```

```typescript
// Automatically uses AI when GEMINI_API_KEY is set
const cleaned = await cleanPaste(dirtyHTML, { ai: true });

// Or provide API key directly
const cleaned = await cleanPaste(dirtyHTML, {
  ai: 'your-api-key-here'
});

// Falls back to rule-based if AI fails or is unavailable
```

### React Hook

```typescript
import { usePasteCleaner } from 'paste-perfect/react';

function MyEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  
  usePasteCleaner(editorRef, {
    format: 'html', // or 'markdown'
    ai: true, // enable AI mode
    enabled: true, // toggle on/off
    onPaste: (cleaned) => {
      console.log('Pasted:', cleaned);
    },
  });
  
  return <div ref={editorRef} contentEditable />;
}
```

---

## 🎯 Supported Platforms

Paste Perfect automatically detects and cleans content from:

| Platform | Status | Features |
|----------|--------|----------|
| **Notion** | ✅ Full Support | Removes block IDs, notion classes, preserves structure |
| **Google Docs** | ✅ Full Support | Cleans internal IDs, Google Sans fonts |
| **Microsoft Word** | ✅ Full Support | Removes Office XML, conditional comments |
| **Apple Pages** | ✅ Full Support | Cleans Pages metadata, Apple classes |
| **Confluence** | ✅ Full Support | Removes Confluence-specific tags |
| **Figma** | ✅ Full Support | Cleans Figma SVG exports |
| **PDF** | ✅ Full Support | Removes PDF metadata |
| **Others** | ✅ General Cleaning | Removes scripts, styles, comments, MSO styles |

---

## 📊 Before & After

### Before (Notion Paste)

```html
<div class="notion-block notion-block-not-selectable" 
     data-block-id="abc123" 
     style="position: relative;">
  <span class="notion-inline-code">Hello</span>
  <span class="notion-text" data-token-index="0"> World</span>
</div>
```

### After (Paste Perfect)

```html
<div>
  <span>Hello</span>
  <span> World</span>
</div>
```

**Result:** Clean, semantic HTML without platform-specific attributes! ✨

---

## 🧪 Examples

### Quick Integration Examples

#### Tiptap Editor

```typescript
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { cleanPaste } from 'paste-perfect';

const editor = new Editor({
  extensions: [StarterKit],
  editorProps: {
    handlePaste: async (view, event) => {
      const html = event.clipboardData?.getData('text/html');
      if (html) {
        event.preventDefault();
        
        // Clean the HTML
        const cleaned = await cleanPaste(html);
        
        // Parse and insert using Tiptap's HTML parser
        const { state, dispatch } = view;
        const { schema } = state;
        
        // Parse HTML to ProseMirror document
        const fragment = DOMParser.fromSchema(schema).parse(
          document.createElement('div').appendChild(
            document.createRange().createContextualFragment(cleaned)
          ).firstElementChild
        );
        
        const transaction = state.tr.replaceSelection(fragment);
        dispatch(transaction);
        return true;
      }
      return false;
    },
  },
});
```

#### Editor.js

```typescript
import EditorJS from '@editorjs/editorjs';
import { cleanPaste } from 'paste-perfect';

const editor = new EditorJS({
  holder: 'editor',
  onReady: () => {
    // Handle paste events
    const holder = document.getElementById('editor');
    
    holder?.addEventListener('paste', async (e) => {
      e.preventDefault();
      const html = e.clipboardData?.getData('text/html');
      
      if (html) {
        // Clean the HTML
        const cleaned = await cleanPaste(html);
        
        // Convert HTML to Editor.js blocks
        // You can use a library like html-to-editorjs or parse manually
        const blocks = parseHTMLToBlocks(cleaned);
        
        // Render blocks in Editor.js
        editor.blocks.render(blocks);
      }
    });
  },
});
```

#### Lexical Editor

```typescript
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { $generateHtmlFromNodes } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { cleanPaste } from 'paste-perfect';
import { useEffect } from 'react';

function PastePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      'paste',
      async (event: ClipboardEvent) => {
        const html = event.clipboardData?.getData('text/html');
        if (html) {
          event.preventDefault();
          
          // Clean the HTML
          const cleaned = await cleanPaste(html);
          
          // Parse and insert into Lexical
          const parser = new DOMParser();
          const dom = parser.parseFromString(cleaned, 'text/html');
          // Use Lexical's HTML import utilities
          // ...
          
          return true;
        }
        return false;
      },
      1
    );
  }, [editor]);

  return null;
}

// Usage
<LexicalComposer initialConfig={...}>
  <RichTextPlugin contentEditable={<ContentEditable />} />
  <PastePlugin />
</LexicalComposer>
```

#### ContentEditable (Vanilla JS)

```typescript
import { cleanPaste } from 'paste-perfect';

const editor = document.getElementById('editor');

editor?.addEventListener('paste', async (e) => {
  e.preventDefault();
  
  // Clean the HTML
  const cleaned = await cleanPaste(e);
  
  // Insert cleaned HTML
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleaned;
    const fragment = document.createDocumentFragment();
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
    range.insertNode(fragment);
  }
});
```

### Full Example Projects

Check out our complete example projects:

- **[ContentEditable Demo](./examples/contenteditable/)** - Simple contenteditable integration
- **[Tiptap Example](./examples/tiptap/)** - Integration with Tiptap editor
- **[Lexical Example](./examples/lexical/)** - Integration with Lexical editor

---

## 📦 Installation

```bash
npm install paste-perfect
# or
yarn add paste-perfect
# or
pnpm add paste-perfect
```

### Optional Peer Dependencies

```bash
# For AI mode
npm install @google/generative-ai

# For React hook
npm install react
```

---

## 🔧 Advanced Usage

### Custom Cleaners

```typescript
import { applyRuleBasedCleaners } from 'paste-perfect';

// Use rule-based cleaning directly
const cleaned = applyRuleBasedCleaners(dirtyHTML);
```

### Check AI Availability

```typescript
import { isAIAvailable } from 'paste-perfect';

if (isAIAvailable()) {
  // AI mode available
}
```

---

## 🎨 API Reference

### `cleanPaste(input, options?)`

Main cleaning function.

**Parameters:**
- `input: string | ClipboardEvent` - HTML string or clipboard event
- `options?: CleanPasteOptions`
  - `format?: 'html' | 'markdown'` - Output format (default: `'html'`)
  - `ai?: boolean | string` - Enable AI mode (default: `false`)

**Returns:** `Promise<string>` - Cleaned HTML or Markdown

### `usePasteCleaner(ref, options?)`

React hook for automatic paste cleaning.

**Parameters:**
- `ref: React.RefObject<HTMLElement>` - Ref to contenteditable element
- `options?: UsePasteCleanerOptions`
  - All options from `cleanPaste` plus:
  - `enabled?: boolean` - Enable/disable hook (default: `true`)
  - `onPaste?: (cleaned: string) => void` - Callback after cleaning

---

## 🏗️ Architecture

```
paste-perfect/
├── src/
│   ├── core.ts          # Main cleanPaste function
│   ├── cleaners/
│   │   ├── rules.ts     # Rule-based cleaners
│   │   └── ai.ts        # AI-powered cleaning
│   ├── react.ts         # React hook
│   └── types.ts         # TypeScript types
├── examples/            # Integration examples
└── dist/               # Built outputs (ESM + CJS)
```

- **Zero runtime dependencies** (except optional peer deps)
- **Tree-shakable** - Only import what you need
- **Type-safe** - Full TypeScript support
- **Well-tested** - 95%+ test coverage

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

Licensed under [MIT](./LICENSE)

---

## 🙏 Acknowledgments

- Built with ❤️ using TypeScript
- AI powered by [Google Gemini 1.5 Flash](https://ai.google.dev/)
- Inspired by the need for clean pastes everywhere

---

<div align="center">

**⭐ If you find this useful, please star it on GitHub!**

[GitHub](https://github.com/neelpatel11/paste-perfect) · 
[Issues](https://github.com/neelpatel11/paste-perfect/issues) · 
[Discussions](https://github.com/neelpatel11/paste-perfect/discussions)

Made with ✨ by the Paste Perfect team

</div>

