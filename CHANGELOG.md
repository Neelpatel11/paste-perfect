# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] - 2025-01-22

### Enhanced
- **Google Docs Cleaner**: Significantly improved cleaning of Google Docs content
  - Removes `<b>` wrapper tags with `font-weight:normal`
  - Removes Google Docs-specific styles: `font-variant`, `vertical-align`, `white-space:pre`, `background-color:transparent`
  - Removes Google Docs comments (`<!--StartFragment-->`, `<!--EndFragment-->`)
  - Removes `<meta charset="utf-8">` tags
  - Removes all `id` attributes (not just `docs-internal-*`)
  - Removes `dir="ltr"` attributes
  - Better style attribute cleaning - keeps only essential styles (color, font-weight, font-style, text-decoration, font-size, text-align)
  - Improved handling of redundant inline styles

### Fixed
- Better preservation of text spacing when converting HTML to editor blocks
- Improved handling of Google Docs structure and formatting

### Tests
- Added comprehensive tests for Google Docs cleaning improvements
- All 30 tests passing

## [0.1.0] - 2025-01-01

### Added
- Initial release
- Rule-based cleaning for Notion, Google Docs, Word, Apple Pages, Confluence, Figma, PDF
- Optional AI-powered cleaning with Gemini 1.5 Flash
- React hook for automatic paste cleaning
- TypeScript support with strict mode
- HTML and Markdown output formats

