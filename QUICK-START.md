# 🚀 Quick Start - Testing Paste Perfect Locally

## Step-by-Step Testing Guide

### 1️⃣ Initial Setup (One-time)

```bash
# Install all dependencies
npm install

# Build the package (compiles TypeScript)
npm run build
```

✅ **Expected output:** Creates `dist/` folder with compiled JavaScript files.

---

### 2️⃣ Automated Tests (Recommended First)

```bash
# Run all unit tests
npm test

# Or watch mode (auto-reruns on file changes)
npm run test:watch

# With coverage report
npm run test:coverage
```

✅ **Expected:** All tests pass with 95%+ coverage.

---

### 3️⃣ Manual Testing - Browser (Easiest)

#### Option A: Use the provided test file

```bash
# Step 1: Build the package (if not already done)
npm run build

# Step 2: Start a local server
npm run test:serve

# Or manually:
# Python: python -m http.server 8000
# Node.js: npx serve .
# PHP: php -S localhost:8000

# Step 3: Open in browser
# Navigate to: http://localhost:8000/test-manual.html
```

**What to do:**
1. Open the URL in your browser
2. Copy content from Notion, Google Docs, Word, etc.
3. Paste into the editor
4. See the cleaned HTML in the "After" section!

#### Option B: Use the contenteditable example

```bash
# Start a server (same as above)
npm run test:serve

# Open: http://localhost:8000/examples/contenteditable/index.html
```

---

### 4️⃣ Manual Testing - Node.js Script

```bash
# Build first (if not done)
npm run build

# Run the test script
npm run test:manual
# OR
node test-manual.js
```

✅ **Expected:** Console output showing before/after HTML for various test cases.

---

### 5️⃣ Testing with React Examples

#### Tiptap Example:

```bash
cd examples/tiptap
npm install
npm run dev
# Open http://localhost:5173 (or the URL shown)
```

#### Lexical Example:

```bash
cd examples/lexical
npm install
npm run dev
# Open http://localhost:5173 (or the URL shown)
```

---

## 🎯 Quick Test Checklist

Try pasting content from:
- [ ] **Notion** - Copy a block with formatting
- [ ] **Google Docs** - Copy formatted text
- [ ] **Microsoft Word** - Copy from Word
- [ ] **Plain text** - Should work as fallback
- [ ] **Web page** - Copy from any website

For each, verify:
- [ ] Clean HTML output (no platform-specific attributes)
- [ ] Formatting preserved (bold, italic, etc.)
- [ ] No scripts or malicious code

---

## 🔧 Common Commands

```bash
# Build
npm run build

# Test (automated)
npm test

# Test (manual Node.js)
npm run test:manual

# Start server for browser testing
npm run test:serve

# Development (auto-rebuild on changes)
npm run dev

# Check for errors
npm run typecheck  # TypeScript
npm run lint       # ESLint
```

---

## 🐛 Troubleshooting

### "Cannot find module './dist/index.js'"
➡️ **Solution:** Run `npm run build` first

### "Failed to load module script"
➡️ **Solution:** Make sure you're using a local server, not opening the HTML file directly (ESM modules require HTTP)

### Tests fail
➡️ **Solution:** 
1. Check if you ran `npm install`
2. Make sure TypeScript compiled: `npm run build`
3. Check for TypeScript errors: `npm run typecheck`

### Port already in use
➡️ **Solution:** Use a different port:
```bash
python -m http.server 8080  # Different port
```

---

## 📚 Next Steps

- Read [TESTING.md](./TESTING.md) for comprehensive testing guide
- Check [README.md](./README.md) for API documentation
- See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines

---

**Happy Testing! 🎉**

