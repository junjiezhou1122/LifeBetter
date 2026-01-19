# LifeBetter CLI - Problem Tracker

A minimal, fast command-line tool for tracking problems you're solving.

## Installation

```bash
cd apps/cli
npm install
npm run build
npm link
```

## Usage

### Log a problem
```bash
lb p "How do I handle async errors in JavaScript?"
# ✓ Problem logged
```

### List all problems
```bash
lb list
# 3 problems total
#
# [3] 2 hours ago
#     How do I handle async errors?
#
# [2] 5 hours ago
#     Why is my React component re-rendering?
#
# [1] Yesterday at 3:45 PM
#     How to optimize database queries?
```

### Show today's problems
```bash
lb today
# 2 problems today
#
# [3] 2 hours ago
#     How do I handle async errors?
#
# [2] 5 hours ago
#     Why is my React component re-rendering?
```

### Other commands
```bash
lb --help      # Show help
lb --version   # Show version
```

## Features

✅ **Zero configuration** - Works immediately after installation
✅ **Fast** - Commands execute in <100ms
✅ **Human-readable storage** - Data stored in `~/.lifebetter/problems.json`
✅ **Unicode support** - Handles emojis, special characters, any language
✅ **Atomic writes** - No data corruption
✅ **Clear error messages** - Helpful feedback when things go wrong

## Storage

Problems are stored in `~/.lifebetter/problems.json`:

```json
{
  "problems": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "text": "How do I handle async errors in JavaScript?",
      "createdAt": "2024-01-19T10:30:00.000Z"
    }
  ]
}
```

## Development

```bash
# Build
npm run build

# Watch mode
npm run dev

# Link globally
npm link
```

## Requirements

- Node.js 18+
- No external dependencies

## Philosophy

LifeBetter focuses on **problems**, not just questions. The core insight: tracking what you're trying to solve helps you learn faster and build better meta-skills.

## What's Next?

This is v1.0 - the minimal viable version. Future enhancements:

- Mark problems as solved/unsolved
- Add insights to problems
- Search functionality
- Export to markdown
- Sync across devices

## Documentation

- [Specification](.speckit/specs/001-minimal-problem-tracker-cli.md)
- [Implementation Plan](.speckit/plans/001-minimal-problem-tracker-cli-plan.md)

## License

MIT
