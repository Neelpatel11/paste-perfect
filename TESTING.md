# Testing Paste Perfect Locally

This guide explains how to test Paste Perfect locally and manually.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This installs all dev dependencies needed for building and testing.

### 2. Build the Package

```bash
npm run build
```

This compiles TypeScript to JavaScript and creates:
- `dist/index.js` (ESM)
- `dist/index.cjs` (CommonJS)
- `dist/index.d.ts` (TypeScript types)
- `dist/react.js` / `dist/react.cjs` (React hook)

### 3. Run Automated Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

---

## 🧪 Manual Testing Options

### Option 1: Test with ContentEditable Example (Easiest)

The simplest way to test manually:

1. **Build the package first:**
   ```bash
   npm run build
   ```

2. **Open the example HTML file:**
   ```bash
   # On Windows
   start examples/contenteditable/index.html

   # On Mac
   open examples/contenteditable/index.html

   # On Linux
   xdg-open examples/contenteditable/index.html
   ```

   **Note:** This HTML file uses ES modules, so you'll need to serve it via a local server.

3. **Start a simple HTTP server:**
   ```bash
   # Using Python (if installed)
   python -m http.server 8000

   # Using Node.js (npx)
   npx serve .

   # Using PHP (if installed)
   php -S localhost:8000
   ```

4. **Open in browser:**
   Navigate to: `http://localhost:8000/examples/contenteditable/index.html`

5. **Test it:**
   - Copy some text from Notion, Google Docs, or Word
   - Paste into the editor
   - Watch the "Before" and "After" sections to see the cleaned HTML

### Option 2: Test with Tiptap Example

1. **Navigate to Tiptap example:**
   ```bash
   cd examples/tiptap
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

   **Note:** This will install Tiptap and link to your local `paste-perfect` package if using a monorepo workspace. Otherwise, you might need to manually link it (see Option 4).

3. **Start dev server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Usually `http://localhost:5173` (Vite default)

5. **Test pasting:**
   Copy content from various sources and paste into the editor.

### Option 3: Test with Lexical Example

Same as Tiptap:

```bash
cd examples/lexical
npm install
npm run dev
```

### Option 4: Create a Simple Test HTML File

Create a test file in the root directory:

```bash
# Create test.html
cat > test.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Paste Perfect Test</title>
</head>
<body>
    <h1>Test Paste Perfect</h1>
    <div contenteditable="true" style="border: 2px solid #ccc; padding: 10px; min-height: 200px;">
        Paste here...
    </div>
    <h2>Before (Raw):</h2>
    <pre id="before"></pre>
    <h2>After (Cleaned):</h2>
    <pre id="after"></pre>

    <script type="module">
        import { cleanPaste } from './dist/index.js';
        
        const editor = document.querySelector('[contenteditable]');
        const beforeEl = document.getElementById('before');
        const afterEl = document.getElementById('after');
        
        editor.addEventListener('paste', async (e) => {
            e.preventDefault();
            
            const html = e.clipboardData.getData('text/html');
            const text = e.clipboardData.getData('text/plain');
            
            if (html) {
                beforeEl.textContent = html.substring(0, 500);
                try {
                    const cleaned = await cleanPaste(html);
                    afterEl.textContent = cleaned.substring(0, 500);
                    
                    // Insert cleaned HTML
                    const selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        range.deleteContents();
                        const temp = document.createElement('div');
                        temp.innerHTML = cleaned;
                        const fragment = document.createDocumentFragment();
                        while (temp.firstChild) {
                            fragment.appendChild(temp.firstChild);
                        }
                        range.insertNode(fragment);
                    }
                } catch (error) {
                    afterEl.textContent = 'Error: ' + error.message;
                }
            } else if (text) {
                beforeEl.textContent = text;
                afterEl.textContent = text;
            }
        });
    </script>
</body>
</html>
EOF
```

Then serve it:
```bash
# Start a server
python -m http.server 8000

# Or use npx serve
npx serve .

# Open http://localhost:8000/test.html
```

---

## 🔬 Testing in Node.js (Programmatic)

Create a test file `manual-test.js`:

```javascript
import { cleanPaste } from './dist/index.js';

async function test() {
  // Test with Notion HTML
  const notionHTML = `
    <div class="notion-block" data-block-id="123">
      <span class="notion-text">Hello World</span>
    </div>
  `;
  
  console.log('Original:', notionHTML);
  const cleaned = await cleanPaste(notionHTML);
  console.log('Cleaned:', cleaned);
  
  // Test with Google Docs HTML
  const docsHTML = '<p id="docs-internal-guid-abc">Test</p>';
  console.log('\nOriginal:', docsHTML);
  const cleaned2 = await cleanPaste(docsHTML);
  console.log('Cleaned:', cleaned2);
}

test().catch(console.error);
```

Run it:
```bash
node manual-test.js
```

---

## 🧩 Testing with npm link (For Integration Testing)

If you want to test the package in another project:

1. **Link the package locally:**
   ```bash
   # In paste-perfect directory
   npm link
   ```

2. **In your test project:**
   ```bash
   npm link paste-perfect
   ```

3. **Build after changes:**
   ```bash
   npm run build
   ```
   Changes will be reflected in your test project!

---

## 📋 Testing Checklist

Test the package with content from these sources:

- [ ] **Notion** - Copy a block with formatting
- [ ] **Google Docs** - Copy formatted text
- [ ] **Microsoft Word** - Copy from Word
- [ ] **Apple Pages** - Copy from Pages (Mac)
- [ ] **Confluence** - Copy from Confluence
- [ ] **Figma** - Copy text from Figma
- [ ] **Plain text** - Should work as fallback
- [ ] **Rich text from browser** - Copy from a website

For each, verify:
- [ ] Platform-specific attributes are removed
- [ ] Formatting is preserved (bold, italic, etc.)
- [ ] No scripts or styles are included
- [ ] HTML structure is clean

---

## 🤖 Testing AI Mode (Optional)

1. **Set up Gemini API key:**
   ```bash
   # Windows PowerShell
   $env:GEMINI_API_KEY="your-api-key-here"
   
   # Windows CMD
   set GEMINI_API_KEY=your-api-key-here
   
   # Mac/Linux
   export GEMINI_API_KEY=your-api-key-here
   ```

   Get a free API key from: https://ai.google.dev/

2. **Test with AI mode:**
   ```javascript
   const cleaned = await cleanPaste(html, { ai: true });
   ```

3. **Or test programmatically:**
   ```javascript
   import { cleanPaste } from './dist/index.js';
   
   const cleaned = await cleanPaste(dirtyHTML, { 
     ai: true  // or 'your-api-key-directly'
   });
   ```

---

## 🐛 Debugging

1. **Check build output:**
   ```bash
   ls -la dist/
   ```
   Should show: `index.js`, `index.cjs`, `index.d.ts`, `react.js`, etc.

2. **Check for errors:**
   ```bash
   npm run typecheck  # TypeScript errors
   npm run lint       # Linting errors
   ```

3. **Watch mode for development:**
   ```bash
   npm run dev  # Rebuilds on file changes
   ```

4. **Console logs:**
   The package uses `console.warn` for AI fallback messages. Check browser console or Node.js output.

---

## ✅ Quick Test Commands

```bash
# Full test suite
npm run build && npm test

# Just build
npm run build

# Watch mode (auto-rebuild on changes)
npm run dev

# Test coverage
npm run test:coverage

# Type checking
npm run typecheck

# Linting
npm run lint
```

---

## 🎯 Recommended Testing Flow

1. **First time setup:**
   ```bash
   npm install
   npm run build
   npm test
   ```

2. **Manual testing:**
   - Use the contenteditable example (Option 1)
   - Or create your own test.html (Option 4)

3. **During development:**
   ```bash
   # Terminal 1: Watch mode
   npm run dev
   
   # Terminal 2: Test server
   cd examples/contenteditable
   python -m http.server 8000
   ```

4. **Before committing:**
   ```bash
   npm run build
   npm run typecheck
   npm run lint
   npm test
   ```

---

Happy testing! 🚀

