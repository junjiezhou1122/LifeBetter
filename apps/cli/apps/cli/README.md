# LifeBetter CLI

A powerful command-line tool for tracking problems you're solving and learning from your problem-solving patterns with AI-powered insights.

## Philosophy

**Focus on problems, not just questions.** LifeBetter helps you:
- Track what problems you're trying to solve
- Identify patterns in your problem-solving
- Get AI-powered suggestions and insights
- Build meta-learning skills through reflection

## Features

### Core Features (v1.0)
- ✅ **Log problems** - Quick problem tracking with timestamps
- ✅ **List problems** - View all problems in reverse chronological order
- ✅ **Today's problems** - See what you worked on today
- ✅ **Human-readable storage** - JSON file at `~/.lifebetter/problems.json`

### New Features (v1.1-1.5)
- ✅ **Delete problems** - Remove mistyped entries with interactive search
- ✅ **AI Configuration** - Support for OpenAI, Anthropic, Ollama, and custom providers
- ✅ **Instant AI Analysis** - Get immediate insights when logging problems
- ✅ **Problem Review** - Deep analysis with pattern detection
- ✅ **Summaries** - Daily, weekly, and monthly learning summaries

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd LifeBetter/apps/cli

# Install dependencies
npm install

# Build
npm run build

# Link globally
npm link

# Verify installation
lb --version
```

## Quick Start

### 1. Log Your First Problem

```bash
lb p "How do I optimize database queries?"
# ✓ Problem logged
```

### 2. View Your Problems

```bash
lb list
# 1 problem total
#
# [1] Just now
#     How do I optimize database queries?
```

### 3. Configure AI (Optional)

```bash
lb config setup
# Interactive wizard to configure AI provider
```

## Usage

### Basic Commands

**Log a problem:**
```bash
lb p "Why is my React component re-rendering infinitely?"
lb p "How to implement authentication in Next.js?"
```

**List all problems:**
```bash
lb list
```

**Show today's problems:**
```bash
lb today
```

**Delete a problem:**
```bash
lb delete "React"
# Interactive selection if multiple matches
```

### AI Features

**Configure AI:**
```bash
# Interactive setup wizard
lb config setup

# Manual configuration
lb config set ai-provider openai
lb config set api-key sk-...
lb config set ai-model gpt-4o-mini
lb config set ai-enabled true

# View configuration
lb config show
```

**Log with AI analysis:**
```bash
lb p "Why is my API call slow?"
# ✓ Problem logged
#
# 🤖 Analyzing...
#
# 💡 AI Quick Insight:
#    This appears to be a performance issue. Common causes include...
#
#    Potential solutions:
#    1. Add caching layer
#    2. Optimize database queries
#    3. Use pagination
```

**Log without AI:**
```bash
lb p "Quick note" --no-ai
```

**Review problems:**
```bash
# Review today's problems
lb review

# Review all problems
lb review --all

# Review last 10 problems
lb review --last 10

# Review by date range
lb review --from 2024-01-15 --to 2024-01-19

# Review by topic
lb review --topic "React"
```

**Get summaries:**
```bash
# Daily summary
lb summary
lb summary daily

# Weekly summary
lb summary weekly

# Monthly summary
lb summary monthly
```

## AI Providers

### OpenAI
```bash
lb config set ai-provider openai
lb config set api-base-url https://api.openai.com/v1
lb config set api-key sk-...
lb config set ai-model gpt-4o-mini
```

**Supported models:**
- `gpt-4o` - Most capable
- `gpt-4o-mini` - Fast and cost-effective (recommended)
- `gpt-3.5-turbo` - Fastest

### Anthropic (Claude)
```bash
lb config set ai-provider anthropic
lb config set api-key sk-ant-...
lb config set ai-model claude-3-5-sonnet-20241022
```

**Supported models:**
- `claude-3-5-sonnet-20241022` - Most capable
- `claude-3-opus-20240229` - Previous generation

### Ollama (Local)
```bash
lb config set ai-provider ollama
lb config set api-base-url http://localhost:11434/v1
lb config set ai-model llama3
```

**Supported models:**
- Any model installed in Ollama (llama3, mistral, codellama, etc.)

### Custom Provider
```bash
lb config set ai-provider custom
lb config set api-base-url https://your-endpoint.com/v1
lb config set api-key your-key
lb config set ai-model your-model
```

Any OpenAI-compatible API endpoint works.

## Configuration

Configuration is stored at `~/.lifebetter/config.json`

**Available settings:**
- `ai-provider` - AI provider (openai, anthropic, ollama, custom)
- `api-key` - API key for the provider
- `api-base-url` - Base URL for API requests
- `ai-model` - Model name to use
- `ai-enabled` - Enable/disable AI features (true/false)
- `instant-analysis` - Auto-analyze after logging (true/false)
- `cache-enabled` - Cache AI responses (true/false)
- `max-tokens` - Maximum tokens per request
- `rate-limit` - API calls per minute

## Data Storage

**Problems:** `~/.lifebetter/problems.json`
**Config:** `~/.lifebetter/config.json`

### Storage Format

```json
{
  "problems": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "text": "How do I handle async errors in JavaScript?",
      "createdAt": "2024-01-19T10:30:00.000Z",
      "aiAnalysis": {
        "summary": "This is about error handling in asynchronous JavaScript code.",
        "relatedProblems": [],
        "suggestedSolutions": [
          "Use try-catch with async/await",
          "Add .catch() to promises",
          "Implement global error handlers"
        ],
        "category": "Frontend",
        "analyzedAt": "2024-01-19T10:30:05.000Z",
        "cached": false
      }
    }
  ]
}
```

## Examples

### Daily Workflow

```bash
# Morning: Start tracking
lb p "How to implement rate limiting in Express?"

# Afternoon: More problems
lb p "Why is my Docker build so slow?"
lb p "How to optimize React bundle size?"

# Evening: Review and reflect
lb today
lb summary
```

### Weekly Review

```bash
# See patterns from the week
lb summary weekly

# Deep dive into specific topics
lb review --topic "React"
lb review --topic "performance"
```

### Delete Mistakes

```bash
# Oops, typo!
lb p "Hw to fix this?"

# Delete it
lb delete "Hw to"
# Found 1 matching problem:
# [1] Just now
#     Hw to fix this?
#
# Delete this problem? (y/n): y
# ✓ Problem deleted
```

## Tips

1. **Be specific** - "Why is my API slow?" is better than "API problem"
2. **Log immediately** - Capture problems as you encounter them
3. **Review regularly** - Use `lb summary` daily to reflect
4. **Use AI wisely** - AI analysis costs money; use `--no-ai` for quick notes
5. **Explore patterns** - Use `lb review --all` weekly to identify learning opportunities

## Troubleshooting

**AI features not working:**
```bash
# Check configuration
lb config show

# Verify API key is set
lb config set api-key your-actual-key

# Enable AI
lb config set ai-enabled true
```

**Delete not finding problems:**
- Search is case-insensitive
- Try shorter search terms
- Use `lb list` to see exact text

**Storage file corrupted:**
```bash
# Backup first
cp ~/.lifebetter/problems.json ~/.lifebetter/problems.backup.json

# Delete and start fresh
rm ~/.lifebetter/problems.json
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Link for testing
npm link
```

## Roadmap

### v2.0 (Future)
- [ ] Problem status tracking (solved/unsolved)
- [ ] Insights feature (log what you learned)
- [ ] Link problems to insights
- [ ] Search functionality
- [ ] Export to markdown/PDF
- [ ] Web dashboard
- [ ] Team collaboration

## Contributing

Contributions welcome! Please:
1. Follow the spec-driven development approach
2. Write specs before code
3. Test thoroughly
4. Update documentation

## License

MIT

## Credits

Built with:
- TypeScript
- Node.js
- OpenAI API
- Anthropic API
- Prompts (interactive CLI)

---

**Remember:** The goal isn't to log every question—it's to track problems you're solving and learn from your patterns. Focus on quality over quantity.
