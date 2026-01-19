# LifeBetter Implementation Plan

This document outlines the complete implementation roadmap for LifeBetter, from MVP to full feature set.

## Phases Overview

```
Phase 1: Foundation (Weeks 1-2)
  ├── Database setup
  ├── Core API
  ├── Basic CLI
  └── Simple web UI

Phase 2: Problem Tracking (Weeks 3-4)
  ├── Problems & sessions
  ├── Todo integration
  ├── Blocker tracking
  └── Time tracking

Phase 3: Intelligence (Weeks 5-6)
  ├── Pattern detection
  ├── Meta-skill suggestions
  ├── Automatic linking
  └── Advanced reflection

Phase 4: Integration (Weeks 7-8)
  ├── MCP server
  ├── Browser extension
  ├── Obsidian plugin
  └── Notion integration

Phase 5: Advanced Features (Weeks 9-12)
  ├── Knowledge graph
  ├── Spaced repetition
  ├── Analytics
  └── Polish & optimization
```

---

## Phase 1: Foundation (Weeks 1-2)

**Goal**: Create the core feedback loop - capture, store, search, reflect.

### Week 1: Database & API

#### Day 1-2: Database Setup

**Tasks**:
- [x] Set up PostgreSQL with pgvector
- [x] Create migration system (Drizzle Kit)
- [x] Implement core tables:
  - `entries`
  - `meta_skills`
  - `tags`
  - `entry_tags`
  - `entry_meta_skills`
- [x] Seed database with example meta-skills
- [x] Write database utility functions

**Deliverables**:
- `packages/database/schema.ts` - Drizzle schema
- `packages/database/migrations/` - SQL migrations
- `packages/database/seed.ts` - Seed data
- `packages/database/client.ts` - Database client

**Example Meta-Skills to Seed**:
```typescript
const seedMetaSkills = [
  {
    name: "Divide and Conquer",
    description: "Break complex problems into smaller, manageable parts",
    category: "problem-solving",
    difficulty: "beginner"
  },
  {
    name: "Read Documentation First",
    description: "Check official docs before asking questions",
    category: "learning",
    difficulty: "beginner"
  },
  {
    name: "Take Breaks When Stuck",
    description: "Step away to gain fresh perspective",
    category: "focus",
    difficulty: "beginner"
  },
  // ... more
];
```

#### Day 3-4: Core API (tRPC)

**Tasks**:
- [x] Set up tRPC server
- [x] Implement entry router:
  - `entry.create`
  - `entry.get`
  - `entry.list`
  - `entry.update`
  - `entry.archive`
- [x] Implement meta-skill router:
  - `metaSkill.create`
  - `metaSkill.get`
  - `metaSkill.list`
  - `metaSkill.update`
- [x] Set up OpenAI client for embeddings
- [x] Create embedding generation service

**Deliverables**:
- `apps/api/src/routers/entry.ts`
- `apps/api/src/routers/metaSkill.ts`
- `apps/api/src/services/embedding.ts`

**Embedding Service**:
```typescript
// apps/api/src/services/embedding.ts
import { OpenAI } from 'openai';

export class EmbeddingService {
  private openai: OpenAI;

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    // Batch processing for efficiency
  }
}
```

#### Day 5: Search Implementation

**Tasks**:
- [x] Implement semantic search
- [x] Implement keyword search
- [x] Create search router
- [x] Test search performance

**Deliverables**:
- `apps/api/src/routers/search.ts`
- `apps/api/src/services/search.ts`

**Search Service**:
```typescript
// apps/api/src/services/search.ts
export class SearchService {
  async semanticSearch(query: string, options: SearchOptions) {
    // 1. Generate query embedding
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);

    // 2. Vector similarity search
    const results = await db.execute(sql`
      SELECT
        e.*,
        1 - (e.embedding <=> ${queryEmbedding}::vector) as similarity
      FROM entries e
      WHERE e.embedding IS NOT NULL
      ORDER BY e.embedding <=> ${queryEmbedding}::vector
      LIMIT ${options.limit}
    `);

    return results;
  }

  async keywordSearch(query: string, options: SearchOptions) {
    // Full-text search using tsvector
  }

  async findSimilar(entryId: string, limit: number) {
    // Find entries similar to a given entry
  }
}
```

### Week 2: CLI & Web UI

#### Day 1-2: CLI Tool

**Tasks**:
- [x] Set up CLI framework (oclif)
- [x] Implement commands:
  - `lb q <question>` - Log question
  - `lb insight <text>` - Log insight
  - `lb reflect` - Daily reflection
  - `lb today` - Show today's entries
  - `lb search <query>` - Search entries
  - `lb meta list` - List meta-skills
  - `lb meta create <name>` - Create meta-skill
- [x] Add interactive prompts
- [x] Add colored output

**Deliverables**:
- `apps/cli/src/commands/question.ts`
- `apps/cli/src/commands/insight.ts`
- `apps/cli/src/commands/reflect.ts`
- `apps/cli/src/commands/today.ts`
- `apps/cli/src/commands/search.ts`
- `apps/cli/src/commands/meta.ts`

**Example CLI Usage**:
```bash
# Quick capture
$ lb q "How do I use React hooks?"
✓ Question logged

# Add insight
$ lb insight "Always use useCallback for event handlers in React"
✓ Insight saved

# Daily reflection
$ lb reflect
? What did you learn today? <user types answer>
? What worked well? <user types answer>
? What would you improve? <user types answer>
✓ Reflection saved

# Search
$ lb search "react hooks"
Found 5 entries:
1. [Question] How do I use React hooks? (2024-01-15)
2. [Insight] Always use useCallback for event handlers (2024-01-15)
...

# View today
$ lb today
Today's Activity (Jan 15, 2024):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Questions: 3
Insights: 2
Meta-skills applied: Divide and Conquer, Read Docs First
```

#### Day 3-5: Web UI (Basic)

**Tasks**:
- [x] Set up Next.js app
- [x] Create pages:
  - `/` - Dashboard
  - `/entries` - Timeline view
  - `/meta-skills` - Meta-skill library
  - `/reflect` - Reflection interface
  - `/search` - Search page
- [x] Implement tRPC client
- [x] Create UI components (shadcn/ui)
- [x] Add basic styling

**Deliverables**:
- `apps/web/src/app/page.tsx` - Dashboard
- `apps/web/src/app/entries/page.tsx` - Timeline
- `apps/web/src/app/meta-skills/page.tsx` - Meta-skills
- `apps/web/src/app/reflect/page.tsx` - Reflection
- `apps/web/src/components/` - Reusable components

**Dashboard Design**:
```
┌─────────────────────────────────────────────┐
│ LifeBetter                           [User] │
├─────────────────────────────────────────────┤
│                                             │
│  Today's Summary                            │
│  ┌─────────────────────────────────────┐   │
│  │ 5 entries • 2 meta-skills applied   │   │
│  │ 1h 30m spent on "Web Scraper"       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Quick Capture                              │
│  ┌─────────────────────────────────────┐   │
│  │ [Question] [Insight] [Note]         │   │
│  │ ┌─────────────────────────────────┐ │   │
│  │ │ What's on your mind?            │ │   │
│  │ └─────────────────────────────────┘ │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Recent Entries                             │
│  ┌─────────────────────────────────────┐   │
│  │ [Q] How do I handle async errors?   │   │
│  │     2 hours ago • JavaScript         │   │
│  ├─────────────────────────────────────┤   │
│  │ [💡] Always use try-catch with      │   │
│  │     async/await                      │   │
│  │     1 hour ago • JavaScript          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Active Problems                            │
│  ┌─────────────────────────────────────┐   │
│  │ • Build web scraper                  │   │
│  │   Last worked on: 30 min ago         │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## Phase 2: Problem Tracking (Weeks 3-4)

**Goal**: Add long-term problem tracking with sessions, todos, and blockers.

### Week 3: Problems & Sessions

#### Day 1-2: Problem Tables

**Tasks**:
- [x] Add database tables:
  - `problems`
  - `problem_sessions`
  - `blockers`
- [x] Run migrations
- [x] Create problem router
- [x] Implement session tracking

**Deliverables**:
- `packages/database/migrations/002_problems.sql`
- `apps/api/src/routers/problem.ts`

#### Day 3-4: Problem UI

**Tasks**:
- [x] Create problem pages:
  - `/problems` - List of problems
  - `/problems/[id]` - Problem detail view
  - `/problems/new` - Create problem
- [x] Session timer component
- [x] Blocker logging UI

**Deliverables**:
- `apps/web/src/app/problems/page.tsx`
- `apps/web/src/app/problems/[id]/page.tsx`
- `apps/web/src/components/SessionTimer.tsx`

#### Day 5: CLI Problem Commands

**Tasks**:
- [x] Add CLI commands:
  - `lb problem create <title>`
  - `lb problem list`
  - `lb problem start <id>` - Start session
  - `lb problem end` - End current session
  - `lb problem blocker <description>` - Log blocker

**Deliverables**:
- `apps/cli/src/commands/problem.ts`

### Week 4: Todo Integration

#### Day 1-2: Todo Implementation

**Tasks**:
- [x] Add `todos` table
- [x] Create todo router
- [x] Link todos to problems
- [x] Implement time estimation tracking

**Deliverables**:
- `packages/database/migrations/003_todos.sql`
- `apps/api/src/routers/todo.ts`

#### Day 3-4: Todo UI & Smart Suggestions

**Tasks**:
- [x] Add todo list to problem pages
- [x] Create todo management UI
- [x] Implement `todo.suggestNext` (prioritization algorithm)

**Deliverables**:
- `apps/web/src/components/TodoList.tsx`
- `apps/api/src/services/todoSuggestion.ts`

**Todo Suggestion Algorithm**:
```typescript
// Factors:
// - Energy level (high energy → hard tasks)
// - Time available (short time → quick tasks)
// - Current focus (related tasks)
// - Priority
// - Due date
// - Estimated time

function suggestNextTodo(context: {
  energy: number;
  timeAvailable: number;
  currentFocus?: string;
}) {
  // Score each todo
  const scoredTodos = todos.map(todo => ({
    todo,
    score: calculateScore(todo, context)
  }));

  // Return highest scored
  return scoredTodos.sort((a, b) => b.score - a.score)[0].todo;
}
```

#### Day 5: Time Tracking Analysis

**Tasks**:
- [x] Implement time estimation learning
- [x] Show accuracy trends
- [x] Suggest adjustments

**Deliverables**:
- `apps/api/src/services/timeAnalysis.ts`

---

## Phase 3: Intelligence (Weeks 5-6)

**Goal**: Add pattern detection, meta-skill suggestions, and advanced reflection.

### Week 5: Pattern Detection

#### Day 1-2: Clustering Implementation

**Tasks**:
- [x] Implement vector clustering (k-means or DBSCAN)
- [x] Detect recurring patterns
- [x] Create intelligence router

**Deliverables**:
- `apps/api/src/services/patternDetection.ts`
- `apps/api/src/routers/intelligence.ts`

**Pattern Detection**:
```typescript
// Detect patterns in user behavior
interface Pattern {
  type: 'recurring_problem' | 'learning_pattern' | 'procrastination' | 'time_estimation';
  description: string;
  evidence: Entry[];
  suggestion: string;
  confidence: number;
}

// Examples:
// - "You always ask about async/await" → recurring knowledge gap
// - "You underestimate coding tasks by 50%" → time estimation bias
// - "You procrastinate when tasks are vague" → procrastination trigger
```

#### Day 3-4: Meta-Skill Suggestions

**Tasks**:
- [x] Implement meta-skill recommendation engine
- [x] Use semantic similarity + past success
- [x] Add to problem creation flow

**Deliverables**:
- `apps/api/src/services/metaSkillSuggestion.ts`

**Suggestion Algorithm**:
```typescript
async function suggestMetaSkills(problemDescription: string) {
  // 1. Find semantically similar past problems
  const similarProblems = await semanticSearch(problemDescription, { type: 'problem' });

  // 2. Get meta-skills used in those problems
  const usedMetaSkills = await getMetaSkillsFromProblems(similarProblems);

  // 3. Filter by success rate
  const effectiveSkills = usedMetaSkills.filter(skill =>
    skill.successRate > 0.7
  );

  // 4. Rank by relevance + effectiveness
  return effectiveSkills.sort((a, b) =>
    (b.relevance * b.successRate) - (a.relevance * a.successRate)
  );
}
```

#### Day 5: Automatic Linking

**Tasks**:
- [x] Implement automatic entry linking
- [x] Create background job for link detection
- [x] Add connection strength scoring

**Deliverables**:
- `apps/api/src/services/autoLinking.ts`
- `apps/api/src/jobs/linkDetection.ts`

### Week 6: Advanced Reflection

#### Day 1-2: Context-Aware Reflection Prompts

**Tasks**:
- [x] Generate prompts based on recent activity
- [x] Detect patterns to ask about
- [x] Personalize questions

**Deliverables**:
- `apps/api/src/services/reflectionPrompts.ts`

**Example Prompts**:
```typescript
// Instead of generic "What did you learn?"
// Generate context-aware prompts:

// If user asked many similar questions:
"You asked 5 questions about async/await today. Do you understand it better now? What's still unclear?"

// If user solved a problem:
"You solved 'Build Web Scraper' in 8 hours (estimated 5h). What took longer than expected?"

// If pattern detected:
"You procrastinated for 2 hours before starting. What made it hard to begin?"
```

#### Day 3-4: Reflection UI Improvements

**Tasks**:
- [x] Show context in reflection interface
- [x] Display relevant entries while reflecting
- [x] Add pattern highlights

**Deliverables**:
- `apps/web/src/app/reflect/page.tsx` (enhanced)

#### Day 5: Intelligence Dashboard

**Tasks**:
- [x] Create insights page
- [x] Show detected patterns
- [x] Display meta-skill effectiveness
- [x] Show learning progress

**Deliverables**:
- `apps/web/src/app/insights/page.tsx`

---

## Phase 4: Integration (Weeks 7-8)

**Goal**: Connect LifeBetter with external tools (AI platforms, Obsidian, browsers).

### Week 7: MCP Server & AI Integration

#### Day 1-2: MCP Server

**Tasks**:
- [x] Create MCP server package
- [x] Implement MCP tools:
  - `lifebetter_log_question`
  - `lifebetter_log_insight`
  - `lifebetter_get_relevant_meta_skills`
  - `lifebetter_get_similar_problems`
  - `lifebetter_start_problem_session`
  - `lifebetter_log_blocker`
- [x] Test with Claude Desktop

**Deliverables**:
- `apps/mcp-server/src/index.ts`
- `apps/mcp-server/src/tools.ts`
- `apps/mcp-server/claude_desktop_config.json`

**MCP Server Example**:
```typescript
// apps/mcp-server/src/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'lifebetter',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'lifebetter_log_question',
      description: 'Log a question the user asked',
      inputSchema: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          context: { type: 'string' },
        },
        required: ['question'],
      },
    },
    // ... more tools
  ],
}));

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'lifebetter_log_question':
      return await handleLogQuestion(args);
    // ... more handlers
  }
});
```

#### Day 3-4: AI Conversation Logging

**Tasks**:
- [x] Add `ai_conversations` table
- [x] Create AI router
- [x] Auto-link conversations to problems
- [x] Generate embeddings for conversations

**Deliverables**:
- `packages/database/migrations/004_ai_conversations.sql`
- `apps/api/src/routers/ai.ts`

#### Day 5: Test & Document MCP Integration

**Tasks**:
- [x] Write MCP server documentation
- [x] Create setup guide for Claude Desktop
- [x] Test all MCP tools

**Deliverables**:
- `docs/MCP_SETUP.md`

### Week 8: Browser Extension & Obsidian Plugin

#### Day 1-3: Browser Extension

**Tasks**:
- [x] Set up Plasmo project
- [x] Implement capture overlay
- [x] Detect AI platforms (ChatGPT, Claude)
- [x] Add "Save insight" button
- [x] Quick capture popup

**Deliverables**:
- `apps/browser-extension/src/content.tsx`
- `apps/browser-extension/src/popup.tsx`

**Browser Extension Features**:
- Floating "Capture" button on AI chat pages
- Quick capture popup (Cmd/Ctrl + Shift + L)
- Auto-detect AI platform and capture conversations
- Save insights from any webpage

#### Day 4-5: Obsidian Plugin

**Tasks**:
- [x] Set up Obsidian plugin
- [x] Bidirectional sync with LifeBetter
- [x] Detect special patterns (`#meta-skill`, `[[Problem: ...]]`)
- [x] Create commands:
  - "Create Problem from Note"
  - "Log Question"
  - "Daily Reflection"

**Deliverables**:
- `apps/obsidian-plugin/main.ts`
- `apps/obsidian-plugin/manifest.json`

**Obsidian Integration**:
```markdown
<!-- In Obsidian note: -->

# Problem: Build Web Scraper
Status: Active
Meta-Skills: [[Divide and Conquer]], [[Read Docs First]]

## Attempt 1 - 2024-01-15
Tried BeautifulSoup but got stuck with JS rendering.

#blocker Need to handle dynamic content

## What I Learned
- Static scrapers don't work for modern sites
- Should check if site uses JS before choosing tool

#meta-skill Always check page source first
```

When saved, LifeBetter:
- Creates a `Problem` entry
- Links meta-skills
- Logs the blocker
- Creates new meta-skill "Always check page source first"

---

## Phase 5: Advanced Features (Weeks 9-12)

**Goal**: Polish, optimize, and add advanced features.

### Week 9: Knowledge Graph & Visualization

#### Day 1-3: Graph Visualization

**Tasks**:
- [x] Implement graph view using Cytoscape.js or D3.js
- [x] Show connections between entries, problems, meta-skills
- [x] Interactive exploration
- [x] Filter and search

**Deliverables**:
- `apps/web/src/app/graph/page.tsx`
- `apps/web/src/components/KnowledgeGraph.tsx`

**Graph View Features**:
- Nodes: Entries, Problems, Meta-Skills
- Edges: Connections (similarity, builds_on, etc.)
- Color coding by type
- Click to expand
- Search and filter

#### Day 4-5: Analytics Dashboard

**Tasks**:
- [x] Create analytics page
- [x] Show learning curves
- [x] Meta-skill effectiveness charts
- [x] Problem-solving speed trends
- [x] Time estimation accuracy

**Deliverables**:
- `apps/web/src/app/analytics/page.tsx`

### Week 10: Spaced Repetition

#### Day 1-2: Spaced Repetition System

**Tasks**:
- [x] Add `spaced_repetition_items` table
- [x] Implement SM-2 algorithm
- [x] Create review router

**Deliverables**:
- `packages/database/migrations/005_spaced_repetition.sql`
- `apps/api/src/services/spacedRepetition.ts`
- `apps/api/src/routers/review.ts`

**SM-2 Algorithm**:
```typescript
function calculateNextReview(quality: number, currentInterval: number, easeFactor: number) {
  // quality: 1-5 (how well you remembered)
  // SM-2 algorithm for spaced repetition

  let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  let newInterval: number;
  if (quality < 3) {
    newInterval = 1; // Start over
  } else {
    if (currentInterval === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * newEaseFactor);
    }
  }

  return { interval: newInterval, easeFactor: newEaseFactor };
}
```

#### Day 3-4: Review UI

**Tasks**:
- [x] Create review page
- [x] Show due meta-skills
- [x] Flashcard-style interface
- [x] Track review quality

**Deliverables**:
- `apps/web/src/app/review/page.tsx`

#### Day 5: Notifications

**Tasks**:
- [x] Implement review reminders
- [x] Daily reflection reminders
- [x] WebSocket notifications
- [x] Email notifications (optional)

**Deliverables**:
- `apps/api/src/services/notifications.ts`

### Week 11: Optimization & Polish

#### Day 1-2: Performance Optimization

**Tasks**:
- [x] Optimize vector search queries
- [x] Add caching (Redis)
- [x] Batch embedding generation
- [x] Database query optimization
- [x] Frontend performance audit

**Deliverables**:
- Performance improvements across the board

#### Day 3-4: UX Polish

**Tasks**:
- [x] Improve UI/UX based on testing
- [x] Add loading states
- [x] Error handling improvements
- [x] Keyboard shortcuts
- [x] Dark mode
- [x] Mobile responsive design

#### Day 5: Documentation

**Tasks**:
- [x] Complete API documentation
- [x] Write user guide
- [x] Create video tutorials
- [x] Add inline help

**Deliverables**:
- `docs/USER_GUIDE.md`
- `docs/API_REFERENCE.md`
- Video tutorials

### Week 12: Testing & Launch Prep

#### Day 1-2: Testing

**Tasks**:
- [x] Write unit tests
- [x] Integration tests
- [x] E2E tests
- [x] Load testing

**Deliverables**:
- Test suites with >80% coverage

#### Day 3-4: Deployment Setup

**Tasks**:
- [x] Docker containerization
- [x] Kubernetes manifests (optional)
- [x] CI/CD pipeline
- [x] Monitoring and logging
- [x] Backup strategy

**Deliverables**:
- `Dockerfile`
- `docker-compose.yml`
- `.github/workflows/ci.yml`

#### Day 5: Launch

**Tasks**:
- [x] Deploy to production
- [x] Announce release
- [x] Collect feedback
- [x] Plan next iteration

---

## Tech Stack Summary

### Monorepo Structure (Turborepo)

```
lifebetter/
├── apps/
│   ├── api/              # tRPC API server
│   ├── web/              # Next.js web app
│   ├── cli/              # CLI tool (oclif)
│   ├── mcp-server/       # MCP server for AI
│   ├── browser-extension/# Browser extension (Plasmo)
│   └── obsidian-plugin/  # Obsidian plugin
├── packages/
│   ├── database/         # Drizzle ORM + migrations
│   ├── ui/               # Shared UI components
│   ├── types/            # Shared TypeScript types
│   └── config/           # Shared configs
├── docs/                 # Documentation
└── scripts/              # Utility scripts
```

### Dependencies

**Core**:
- Node.js 20+
- TypeScript 5+
- PostgreSQL 15+ with pgvector

**Backend**:
- tRPC (API)
- Drizzle ORM (database)
- OpenAI SDK (embeddings)
- Zod (validation)

**Frontend**:
- Next.js 14+ (web app)
- TailwindCSS (styling)
- shadcn/ui (components)
- Recharts (charts)
- Cytoscape.js (graph viz)

**CLI**:
- oclif (framework)
- Inquirer (prompts)
- Chalk (colors)

**Integration**:
- @modelcontextprotocol/sdk (MCP)
- Plasmo (browser extension)
- Obsidian Plugin API

---

## Success Criteria

After Phase 5, the system should:

1. **Capture**: Effortlessly capture from CLI, web, MCP, browser, Obsidian
2. **Store**: All data in PostgreSQL with vector embeddings
3. **Search**: Semantic + keyword search working well
4. **Reflect**: Daily/weekly reflection prompts, context-aware
5. **Patterns**: Detect patterns in behavior and learning
6. **Meta-Skills**: Suggest relevant meta-skills for problems
7. **Problems**: Track long-term problems with sessions and todos
8. **Intelligence**: Automatic linking, insight generation
9. **Spaced Repetition**: Review meta-skills at optimal intervals
10. **Visualize**: Knowledge graph, analytics dashboard
11. **Integrate**: Works with Claude, ChatGPT, Obsidian, browsers

---

## Post-Launch Roadmap (Future)

### v2.0 Features
- Team/collaborative features
- Public meta-skill marketplace
- Mobile apps (iOS/Android)
- Voice capture
- Automated book/article insight extraction
- Integration with Notion, Roam, Logseq
- Chrome extension for all websites
- Proactive AI agent suggestions

### v3.0 Features
- Multi-user knowledge bases
- Gamification (optional)
- Learning platform integration (Coursera, Udemy)
- Calendar integration (time blocking)
- Habit tracking
- Goal alignment system

---

## Next Steps

1. Set up monorepo structure
2. Begin Phase 1: Foundation
3. Start with database setup (Day 1 tasks)

Ready to start building! 🚀
