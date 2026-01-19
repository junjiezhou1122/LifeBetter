# LifeBetter System Architecture

## Vision

LifeBetter is a meta-learning system that creates continuous feedback loops for personal improvement by helping you **notice**, **capture**, **reflect**, and **apply** insights from your experiences.

## Core Problem

People struggle with:
- No self-feedback loops for improvement
- Reading insights but not applying them
- Making the same mistakes repeatedly without noticing patterns
- Asking questions but not tracking what they learn
- Learning techniques but forgetting to use them in relevant situations
- Inability to extract meta-skills from experiences

## Core Solution

Create a continuous feedback loop:

```
NOTICING → CAPTURING → REFLECTING → IMPROVING → REMEMBERING → APPLYING → NOTICING...
```

## System Philosophy

1. **Notice First** - You can't improve what you don't notice
2. **Meta-skills are Active Tools** - Not just tracked, but actively suggested when solving new problems
3. **Extensible by Design** - Users discover new problem types and modules over time
4. **Integration-Friendly** - Works with existing tools (Obsidian, Notion, AI platforms)
5. **Start Simple, Grow Complex** - MVP focused, but architected for the full vision

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPTURE LAYER                             │
│  CLI │ Web App │ MCP Server │ Browser Ext │ Obsidian Plugin │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    PROCESSING LAYER                          │
│  • Generate embeddings (OpenAI/local model)                  │
│  • Extract metadata                                          │
│  • Detect entities (problems, meta-skills)                   │
│  • Link related entries                                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    STORAGE LAYER                             │
│  PostgreSQL + pgvector                                       │
│  ├── Structured data (entries, meta-skills, problems)        │
│  └── Vector embeddings (semantic search)                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    INTELLIGENCE LAYER                        │
│  • Semantic search (find similar by meaning)                 │
│  • Pattern detection (clustering)                            │
│  • Meta-skill suggestions (context-aware)                    │
│  • Automatic linking (connect related concepts)              │
│  • Reflection prompt generation (personalized)               │
│  • Spaced repetition (review meta-skills)                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    INTERFACE LAYER                           │
│  • Web dashboard (review, analyze, visualize)                │
│  • CLI (quick capture and access)                            │
│  • API (third-party integrations)                            │
│  • MCP tools (AI context provision)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Capture Layer

**Purpose**: Make it effortless to capture learning moments from anywhere.

**Interfaces**:
- **CLI Tool**: Quick capture from terminal (`lb q "question"`, `lb insight "..."`)
- **Web App**: Rich forms with context
- **MCP Server**: Automatic capture from AI conversations (Claude, etc.)
- **Browser Extension**: Capture from web browsing
- **Obsidian Plugin**: Bidirectional sync with notes
- **API**: Programmatic access

**What Gets Captured**:
- Questions (to AI, to yourself)
- Insights (aha moments, discoveries)
- Problem-solving attempts
- Reflections
- Blockers and how they're resolved
- Meta-skills discovered or applied
- AI conversations
- Emotional patterns
- Procrastination moments
- Time estimates vs actuals

### 2. Processing Layer

**Purpose**: Transform raw captures into searchable, linkable knowledge.

**Processes**:
1. **Embedding Generation**
   - Convert text to vector embeddings (OpenAI or local model)
   - Store in vector database for semantic search

2. **Metadata Extraction**
   - Detect entities (problems, meta-skills, tags)
   - Extract context (what problem were you working on?)
   - Timestamp and source tracking

3. **Automatic Linking**
   - Find semantically similar entries
   - Link to related problems
   - Connect to relevant meta-skills

4. **Classification**
   - Entry type detection
   - Sentiment analysis (for emotional patterns)
   - Priority/importance scoring

### 3. Storage Layer

**Technology**: PostgreSQL + pgvector

**Why This Choice**:
- Single database for structured + vector data
- Mature, reliable, self-hostable
- Good performance for hybrid queries
- Can use managed services (Supabase, Neon)

**Core Tables**: (See DATA_MODEL.md for details)
- `entries` - All captured items
- `meta_skills` - Meta-skills library
- `problems` - Long-term problems/projects
- `problem_sessions` - Work sessions on problems
- `reflections` - Daily/weekly reflections
- `ai_conversations` - AI interaction logs
- `connections` - Links between entries

### 4. Intelligence Layer

**Purpose**: Extract patterns, suggest insights, prompt reflection.

**Capabilities**:

1. **Semantic Search**
   - Find similar past experiences by meaning, not just keywords
   - "I'm stuck on async JavaScript" → finds all async struggles
   - Context-aware search (considers current problem)

2. **Pattern Detection**
   - Cluster similar entries to find patterns
   - "You always struggle with motivation on Mondays"
   - "You underestimate coding tasks by 50%"
   - "You procrastinate when tasks are ambiguous"

3. **Meta-Skill Suggestions**
   - When you describe a problem, suggest relevant meta-skills
   - Based on semantic similarity to past successful applications
   - Learn which skills work for which problem types

4. **Automatic Linking**
   - Connect new entries to related past entries
   - Build knowledge graph over time
   - Surface connections you didn't notice

5. **Reflection Prompt Generation**
   - Context-aware questions
   - Based on recent patterns
   - Adapted to your growth areas

6. **Spaced Repetition**
   - Review meta-skills at optimal intervals
   - Ensure you remember to apply what you've learned
   - Adapt intervals based on success rate

### 5. Interface Layer

**Web Dashboard**:
- Timeline view of all entries
- Graph visualization of connections
- Pattern analysis and insights
- Meta-skill library
- Reflection interface
- Analytics and progress tracking

**CLI Tool**:
- Quick capture commands
- Fast search and retrieval
- Daily reflection prompts
- System administration

**API**:
- RESTful endpoints for all operations
- Webhook support for integrations
- GraphQL for complex queries

**MCP Server**:
- Provides context to AI agents
- Captures AI conversations automatically
- Suggests meta-skills during problem-solving

---

## Key Features (Complete List)

### Phase 1: Foundation (MVP)
- Basic entry capture (questions, insights, reflections)
- Meta-skill tracking
- Semantic search
- Daily reflection prompts
- Timeline view
- CLI + Web interface

### Phase 2: Problem Tracking
- Long-term problem/project tracking
- Problem sessions with time tracking
- Blocker logging and resolution tracking
- Todo integration
- AI conversation linking
- Progress tracking

### Phase 3: Intelligence
- Pattern detection
- Automatic meta-skill suggestions
- Improved reflection prompts (context-aware)
- Automatic entry linking
- Procrastination detection
- Time estimation learning

### Phase 4: Integration
- MCP server for Claude/AI platforms
- Browser extension for web capture
- Obsidian plugin
- Notion integration
- Calendar integration
- Export/import capabilities

### Phase 5: Advanced Features
- Knowledge graph visualization
- Spaced repetition system
- Advanced analytics
- Emotional pattern tracking
- Habit formation support
- Goal tracking and alignment
- Team/collaboration features (optional)
- Mobile app (optional)

---

## Technology Stack

### Backend
- **Runtime**: Node.js / Bun
- **Language**: TypeScript
- **Database**: PostgreSQL + pgvector
- **ORM**: Drizzle or Prisma
- **API**: tRPC (type-safe) or REST
- **AI**: OpenAI API / Anthropic API
- **Embeddings**: OpenAI text-embedding-3-small or local model

### Frontend (Web)
- **Framework**: Next.js 14+ (App Router) or SvelteKit
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui or custom
- **Visualization**: D3.js / Recharts / Cytoscape.js (for graphs)
- **State**: Zustand or TanStack Query

### CLI
- **Framework**: oclif or Commander.js
- **Prompts**: Inquirer.js
- **Output**: Chalk for colors, Ora for spinners

### MCP Server
- **SDK**: @modelcontextprotocol/sdk
- **Integration**: Claude Desktop, Claude Code

### Browser Extension
- **Framework**: Plasmo or WebExtension API
- **Target**: Chrome, Firefox

### Obsidian Plugin
- **SDK**: Obsidian Plugin API
- **Language**: TypeScript

---

## Data Flow Examples

### Example 1: Capturing a Question to AI

```
1. You ask Claude: "How do I handle async errors in JavaScript?"
2. MCP server captures the question
3. Processing layer:
   - Generates embedding
   - Detects you're working on "JavaScript Learning" problem
   - Links to that problem
4. Storage: Entry saved with embedding
5. Intelligence:
   - Finds similar past questions
   - Suggests "Read documentation first" meta-skill
6. Response: AI gets context from past similar situations
```

### Example 2: Daily Reflection

```
1. Evening: CLI prompts "lb reflect"
2. System retrieves today's entries
3. Shows: questions asked, insights captured, time spent
4. Prompts: "What did you learn today?"
5. You answer, system:
   - Generates embedding
   - Links to related entries
   - Detects patterns (e.g., "You learned faster when you read docs first")
6. Suggests: Create meta-skill "Read Docs First"
```

### Example 3: Starting a New Problem

```
1. You describe problem: "Build a web scraper for research papers"
2. Intelligence layer:
   - Searches for similar past problems (semantic search)
   - Suggests meta-skills: "Divide and Conquer", "Find Examples First"
   - Shows: Past blockers you faced with scrapers
3. You start working (problem session begins)
4. System tracks:
   - Time spent
   - Questions asked to AI
   - Blockers encountered
5. When stuck: Prompt to log blocker
6. When solved: Reflection on what worked
```

---

## Security & Privacy

- Local-first option (SQLite instead of PostgreSQL)
- Self-hosting support
- Optional cloud sync
- Encryption at rest
- API key management for AI services
- No analytics/tracking by default
- Data export in open formats

---

## Success Metrics

How we know the system is working:

1. **Usage Frequency**: Daily active capture
2. **Reflection Rate**: Completing reflection prompts
3. **Meta-Skill Application**: Using suggested meta-skills
4. **Pattern Recognition**: Users noticing patterns themselves
5. **Problem Resolution**: Faster problem-solving over time
6. **Knowledge Retrieval**: Finding and using past insights

---

## Future Possibilities

- Team/shared knowledge bases
- Public meta-skill marketplace
- Integration with learning platforms
- Automated insight extraction from books/articles
- Voice capture
- Mobile apps
- Gamification (optional)
- AI agent that proactively suggests insights

---

## Next Steps

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for detailed implementation roadmap.
