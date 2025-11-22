# Contributing to Paste Perfect

Thank you for your interest in contributing to Paste Perfect! 🎉

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/paste-perfect.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development

### Building

```bash
npm run build
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

We aim for 95%+ test coverage.

### Linting & Formatting

```bash
# Lint
npm run lint

# Format
npm run format
```

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example: `feat: add support for Slack pastes`

## Pull Request Process

1. Update tests if needed
2. Ensure all tests pass (`npm test`)
3. Ensure linting passes (`npm run lint`)
4. Update documentation if needed
5. Submit PR with a clear description

## Questions?

Open an issue or start a discussion!

