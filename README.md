# LifeBetter

> **A meta-learning system that helps you notice patterns, extract insights, and continuously improve.**

LifeBetter creates a personal feedback loop for growth by helping you **capture** learning moments, **reflect** on patterns, and **apply** meta-skills to solve problems faster.

---

## The Problem

- You read great insights but forget to apply them
- You make the same mistakes repeatedly without noticing
- You ask questions but don't track what you learn
- You solve problems but don't extract reusable strategies
- You lack a feedback loop for continuous improvement

## The Solution

LifeBetter captures your learning journey and surfaces insights when you need them.

```
NOTICE → CAPTURE → REFLECT → IMPROVE → REMEMBER → APPLY → NOTICE...
```

**Example Flow**:

1. You ask Claude: *"How do I handle async errors in JavaScript?"*
2. LifeBetter captures the question automatically (via MCP)
3. You discover: *"Always use try-catch with async/await"*
4. You log it as an insight
5. During reflection, the system detects a pattern: *"You're learning async concepts"*
6. It suggests meta-skill: *"Read documentation first"* (based on past success)
7. Next time you face a similar problem, it reminds you of this insight
8. Over time, you solve async problems faster

---

## Key Features

### 🎯 Core Features (MVP)
- **Quick Capture**: Log questions, insights, and reflections from anywhere (CLI, web, AI conversations)
- **Semantic Search**: Find past insights by meaning, not just keywords
- **Meta-Skills**: Track and apply reusable problem-solving strategies
- **Daily Reflection**: Guided prompts based on your activity
- **Timeline View**: See your learning journey over time

### 🧠 Intelligence Features
- **Pattern Detection**: Discover recurring behaviors, learning patterns, procrastination triggers
- **Smart Suggestions**: Get relevant meta-skills suggested for new problems
- **Automatic Linking**: Connect related insights across time
- **Context-Aware Reflection**: Personalized questions based on recent activity

### 📊 Problem Tracking
- **Long-term Problems**: Track projects from start to finish
- **Work Sessions**: Time-tracked sessions with focus/energy logging
- **Blocker Logging**: Record obstacles and how you overcame them
- **Todo Integration**: Smart task suggestions based on energy and time
- **Time Estimation Learning**: Improve estimates based on past accuracy

### 🔗 Integrations
- **MCP Server**: Works with Claude Desktop/Code automatically
- **Browser Extension**: Capture from ChatGPT, web browsing
- **Obsidian Plugin**: Bidirectional sync with your notes
- **CLI Tool**: Fast capture from terminal
- **Web Dashboard**: Rich visualization and analysis

### 🎓 Advanced Features
- **Knowledge Graph**: Visualize connections between ideas
- **Spaced Repetition**: Review meta-skills at optimal intervals
- **Analytics Dashboard**: Track learning progress, meta-skill effectiveness
- **Export/Import**: Full data portability

---

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ with pgvector extension
- OpenAI API key (for embeddings)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/lifebetter.git
cd lifebetter

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and OpenAI API key

# Set up database
npm run db:setup
npm run db:migrate
npm run db:seed

# Start the API server
npm run dev:api

# In another terminal, start the web app
npm run dev:web

# In another terminal, use the CLI
npm run cli -- --help
```

### First Steps

```bash
# Log your first question
lifebetter q "How does LifeBetter work?"

# Add an insight
lifebetter insight "Meta-learning is the key to continuous improvement"

# Do a daily reflection
lifebetter reflect

# View today's activity
lifebetter today

# Search your entries
lifebetter search "meta-learning"

# Open the web dashboard
lifebetter web
```

---

## Use Cases

### 1. Learning a New Technology

**Before LifeBetter**:
- Ask same questions repeatedly
- Forget lessons learned
- Can't track progress

**With LifeBetter**:
```bash
# You ask Claude about React hooks (captured automatically via MCP)
$ <in Claude> "How do useEffect dependencies work?"

# Later, you discover a gotcha
$ lb insight "useEffect runs on every render if deps array is missing"

# After a week of learning
$ lb reflect
# System shows: "You asked 15 React questions this week. What patterns do you notice?"

# A month later, starting a new React project
$ lb search "react hooks"
# Finds all your past insights, questions, and lessons learned
```

### 2. Solving a Complex Problem

```bash
# Start a new problem
$ lb problem create "Build real-time collaboration feature"

# System suggests meta-skills based on similar past problems:
# - "Break into smaller parts" (used successfully in 3 past projects)
# - "Research existing solutions first" (saved 10+ hours before)

# Start a work session
$ lb problem start <problem-id>
# Timer starts

# Hit a blocker
$ lb blocker "WebSocket connection keeps dropping"

# Ask AI for help (auto-logged via MCP)
$ <in Claude> "How to make WebSocket connections reliable?"

# Solve the blocker
$ lb blocker resolve "Used heartbeat ping/pong messages"

# End session
$ lb problem end
# Prompts: "What did you accomplish? What did you learn?"

# After solving the problem
$ lb problem solve <problem-id>
# Prompts: "What worked? What would you do differently?"
# System extracts reusable lessons for future problems
```

### 3. Building Meta-Skills Over Time

```bash
# You naturally discover a strategy that works
$ lb insight "Taking a 10-minute walk when stuck always helps me see solutions"

# Create a meta-skill from this
$ lb meta create "Take a break when stuck"
# Description: "Step away for 10 minutes to gain fresh perspective"

# Next time you're stuck (system detects via lack of progress)
$ lb today
# "You've been working for 2 hours without a break. Try: 'Take a break when stuck'?"

# After using it
$ lb meta apply "Take a break when stuck" --effectiveness 9
# System tracks: This skill works really well for you

# Over time, system learns your personal meta-skills
$ lb meta list --sort effectiveness
# Shows which strategies work best for you specifically
```

### 4. Daily Reflection Habit

```bash
# Every evening
$ lb reflect

# Context-aware prompts:
┌─────────────────────────────────────────────┐
│ Daily Reflection - Jan 15, 2024             │
├─────────────────────────────────────────────┤
│                                             │
│ Today you:                                  │
│ • Asked 5 questions about async/await       │
│ • Worked on "Web Scraper" for 3.5 hours     │
│ • Applied "Divide and Conquer" meta-skill   │
│ • Hit 1 blocker (resolved)                  │
│                                             │
│ ❓ What did you learn about async/await?    │
│ > <your answer>                             │
│                                             │
│ ❓ You estimated 2h but spent 3.5h on the   │
│    scraper. What took longer than expected? │
│ > <your answer>                             │
│                                             │
│ ❓ What worked well today?                  │
│ > <your answer>                             │
│                                             │
│ ❓ What would you improve tomorrow?         │
│ > <your answer>                             │
└─────────────────────────────────────────────┘

# System learns from your reflections
# Next time you estimate a scraping task, it reminds you:
# "You tend to underestimate scraping tasks by 50%"
```

---

## Architecture

LifeBetter is built as a modern TypeScript monorepo with multiple apps and packages.

```
lifebetter/
├── apps/
│   ├── api/              # tRPC API server
│   ├── web/              # Next.js web dashboard
│   ├── cli/              # CLI tool
│   ├── mcp-server/       # MCP server for AI integration
│   ├── browser-extension/# Chrome/Firefox extension
│   └── obsidian-plugin/  # Obsidian integration
├── packages/
│   ├── database/         # Database schema & migrations
│   ├── ui/               # Shared UI components
│   └── types/            # Shared TypeScript types
└── docs/                 # Comprehensive documentation
```

**Tech Stack**:
- **Database**: PostgreSQL + pgvector (hybrid SQL + vector search)
- **API**: tRPC (type-safe, modern)
- **Web**: Next.js 14 + TailwindCSS + shadcn/ui
- **CLI**: oclif
- **AI**: OpenAI embeddings, MCP protocol
- **Visualization**: D3.js / Cytoscape.js

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for details.

---

## Documentation

- **[Architecture](./docs/ARCHITECTURE.md)** - System design and philosophy
- **[Data Model](./docs/DATA_MODEL.md)** - Complete database schema
- **[API Design](./docs/API_DESIGN.md)** - tRPC endpoints and MCP tools
- **[Implementation Plan](./docs/IMPLEMENTATION_PLAN.md)** - Detailed roadmap
- **[User Guide](./docs/USER_GUIDE.md)** - How to use LifeBetter (coming soon)
- **[MCP Setup](./docs/MCP_SETUP.md)** - Claude integration guide (coming soon)

---

## Why LifeBetter?

### Unique Value Proposition

**LifeBetter is not**:
- Another note-taking app (use Obsidian/Notion for that)
- A habit tracker (use Habitica/Streaks for that)
- A todo app (use Todoist/Things for that)

**LifeBetter is**:
- A **meta-learning system** that helps you learn how you learn
- A **pattern detector** that notices what you don't
- A **meta-skill coach** that reminds you to apply what works
- A **feedback loop creator** that closes the gap between learning and applying

### The Meta-Skill Philosophy

> "Give a person a solution, they solve one problem. Teach them a meta-skill, they solve a category of problems."

**Example**:
- ❌ "Here's how to fix this async bug" (solves one problem)
- ✅ "Read error messages carefully before Googling" (solves many problems)

LifeBetter helps you discover, track, and apply these meta-skills.

### Integration-First Design

LifeBetter works **with** your existing tools:
- Use Obsidian for notes → LifeBetter adds intelligence
- Use ChatGPT/Claude for AI → LifeBetter captures context
- Use your browser for research → LifeBetter extracts insights

You don't change your workflow. LifeBetter enhances it.

---

## Roadmap

### v1.0 - MVP (Current Phase)
- [x] Core capture (CLI, web, MCP)
- [x] Semantic search
- [x] Meta-skill tracking
- [x] Daily reflection
- [x] Timeline view

### v1.5 - Intelligence
- [ ] Pattern detection
- [ ] Meta-skill suggestions
- [ ] Automatic linking
- [ ] Context-aware reflection

### v2.0 - Problem Tracking
- [ ] Long-term problem tracking
- [ ] Work sessions
- [ ] Todo integration
- [ ] Time estimation learning

### v3.0 - Advanced
- [ ] Knowledge graph visualization
- [ ] Spaced repetition system
- [ ] Analytics dashboard
- [ ] Full integration suite

See [IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) for detailed timeline.

---

## Contributing

LifeBetter is open source and contributions are welcome!

### Development Setup

```bash
# Fork and clone
git clone https://github.com/yourusername/lifebetter.git
cd lifebetter

# Install dependencies
npm install

# Set up pre-commit hooks
npm run prepare

# Run tests
npm test

# Start development servers
npm run dev
```

### Contribution Guidelines

- Read [CONTRIBUTING.md](./CONTRIBUTING.md) (coming soon)
- Follow the existing code style
- Write tests for new features
- Update documentation
- Create descriptive commit messages

---

## Philosophy & Inspiration

LifeBetter is inspired by:

- **Zettelkasten**: Connecting ideas over time
- **Spaced Repetition**: Optimal review timing
- **Metacognition**: Thinking about thinking
- **Personal Knowledge Management**: Building a second brain
- **Deliberate Practice**: Intentional improvement
- **LessWrong**: Rationality and noticing patterns
- **Roam Research**: Networked thought

**Core Belief**:
> The bottleneck to improvement isn't acquiring knowledge—it's noticing patterns, extracting meta-skills, and remembering to apply them.

LifeBetter focuses on closing that loop.

---

## FAQ

### How is this different from Obsidian/Notion?

Obsidian/Notion are for **capturing knowledge**. LifeBetter is for **extracting meta-learning** from that knowledge.

Use them together:
- Write notes in Obsidian
- LifeBetter detects patterns and suggests meta-skills
- LifeBetter reminds you to apply those meta-skills
- LifeBetter tracks whether they work

### Do I need to use AI platforms?

No, but it's helpful. LifeBetter works standalone:
- Use the CLI to log entries manually
- Use the web UI for reflection
- Pattern detection works with any entries

The MCP integration just makes capture automatic.

### Is my data private?

Yes. Options:
- **Self-hosted**: Run everything locally, no cloud
- **Cloud**: Use managed PostgreSQL (Supabase, Neon) but all embeddings are non-reversible
- **Export**: Full data export anytime in JSON/CSV

### What about mobile?

v1.0 is desktop-focused (CLI, web, desktop apps). Mobile apps are planned for v3.0.

For now:
- Use the web app (mobile responsive)
- Use browser extension on mobile browsers
- Quick capture via CLI (if using SSH to your machine)

### How much does it cost?

LifeBetter is **free and open source**.

Costs you may incur:
- OpenAI API for embeddings (~$0.02 per 1000 entries)
- PostgreSQL hosting if you don't self-host (~$5-20/month)

You can use a local embedding model to avoid OpenAI costs.

---

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

## Contact & Community

- **GitHub**: [github.com/yourusername/lifebetter](https://github.com/yourusername/lifebetter)
- **Discord**: [Join our community](https://discord.gg/lifebetter) (coming soon)
- **Twitter**: [@lifebetter_app](https://twitter.com/lifebetter_app) (coming soon)
- **Email**: hello@lifebetter.app (coming soon)

---

## Acknowledgments

Built with:
- [tRPC](https://trpc.io/) - Type-safe APIs
- [Next.js](https://nextjs.org/) - React framework
- [PostgreSQL](https://www.postgresql.org/) - Reliable database
- [pgvector](https://github.com/pgvector/pgvector) - Vector similarity search
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful components
- [MCP](https://modelcontextprotocol.io/) - AI integration protocol

Special thanks to:
- The PKM community
- LessWrong community
- Anthropic for Claude and MCP
- All open source contributors

---

**Start building your meta-learning system today** 🚀

```bash
npm create lifebetter@latest
```

---

*"The best time to start building feedback loops was years ago. The second best time is now."*
