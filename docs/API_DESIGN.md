# LifeBetter API Design

This document defines the complete API surface for LifeBetter, including REST endpoints, tRPC procedures, and MCP tools.

## API Philosophy

1. **Type-Safe**: Use tRPC for end-to-end type safety
2. **Simple REST fallback**: For third-party integrations
3. **Real-time capable**: WebSocket support for live updates
4. **Versioned**: Support API versioning from day one
5. **Well-documented**: OpenAPI/Swagger for REST, auto-generated docs for tRPC

---

## Technology Choices

### Primary API: tRPC

**Why tRPC**:
- End-to-end type safety (TypeScript client/server)
- No code generation needed
- Great DX for our own clients (web, CLI)
- Built-in React Query integration
- WebSocket support for subscriptions

### Secondary API: REST

**Why Also REST**:
- Third-party integrations (Obsidian, Zapier, etc.)
- Standard HTTP semantics
- Easier for non-TypeScript clients

### Real-time: WebSockets

**Use Cases**:
- Live reflection prompts
- Background processing status
- Pattern detection notifications
- Spaced repetition reminders

---

## tRPC Router Structure

```typescript
// apps/api/src/routers/index.ts

import { router } from '../trpc';
import { entryRouter } from './entry';
import { metaSkillRouter } from './metaSkill';
import { problemRouter } from './problem';
import { reflectionRouter } from './reflection';
import { aiRouter } from './ai';
import { searchRouter } from './search';
import { intelligenceRouter } from './intelligence';
import { adminRouter } from './admin';

export const appRouter = router({
  entry: entryRouter,
  metaSkill: metaSkillRouter,
  problem: problemRouter,
  reflection: reflectionRouter,
  ai: aiRouter,
  search: searchRouter,
  intelligence: intelligenceRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
```

---

## API Endpoints by Feature

### 1. Entries

#### Create Entry

```typescript
// tRPC
entry.create({
  type: 'question' | 'insight' | 'reflection' | ...,
  content: string,
  problemId?: string,
  sessionId?: string,
  tags?: string[],
  metaSkillIds?: string[],
  context?: Record<string, any>
})
```

```http
POST /api/entries
Content-Type: application/json

{
  "type": "question",
  "content": "How do I handle async errors in JS?",
  "problemId": "uuid",
  "tags": ["javascript", "async"]
}
```

#### Get Entry

```typescript
// tRPC
entry.get({ id: string })
```

```http
GET /api/entries/:id
```

#### List Entries

```typescript
// tRPC
entry.list({
  limit?: number,
  offset?: number,
  type?: string,
  problemId?: string,
  startDate?: Date,
  endDate?: Date,
  tags?: string[]
})
```

```http
GET /api/entries?limit=50&type=question&startDate=2024-01-01
```

#### Update Entry

```typescript
// tRPC
entry.update({
  id: string,
  content?: string,
  tags?: string[],
  metaSkillIds?: string[],
  importance?: number
})
```

```http
PATCH /api/entries/:id
Content-Type: application/json

{
  "content": "Updated content",
  "importance": 5
}
```

#### Delete Entry (Archive)

```typescript
// tRPC
entry.archive({ id: string })
```

```http
DELETE /api/entries/:id
```

---

### 2. Meta-Skills

#### Create Meta-Skill

```typescript
// tRPC
metaSkill.create({
  name: string,
  description: string,
  category?: string,
  difficulty?: 'beginner' | 'intermediate' | 'advanced',
  examples?: string[]
})
```

```http
POST /api/meta-skills
Content-Type: application/json

{
  "name": "Divide and Conquer",
  "description": "Break complex problems into smaller, manageable parts",
  "category": "problem-solving",
  "difficulty": "beginner"
}
```

#### List Meta-Skills

```typescript
// tRPC
metaSkill.list({
  category?: string,
  isActive?: boolean,
  sortBy?: 'name' | 'timesApplied' | 'effectiveness'
})
```

```http
GET /api/meta-skills?category=problem-solving&sortBy=effectiveness
```

#### Get Meta-Skill with Usage Stats

```typescript
// tRPC
metaSkill.get({ id: string })

// Returns:
{
  id: string,
  name: string,
  description: string,
  timesApplied: number,
  timesSuccessful: number,
  successRate: number,
  recentApplications: Entry[],
  nextReviewDate: Date
}
```

#### Update Meta-Skill

```typescript
// tRPC
metaSkill.update({
  id: string,
  name?: string,
  description?: string,
  isActive?: boolean,
  personalNotes?: string
})
```

#### Log Meta-Skill Application

```typescript
// tRPC
metaSkill.logApplication({
  metaSkillId: string,
  entryId?: string,  // Optional: link to entry
  effectiveness?: number,  // 1-10 rating
  notes?: string
})
```

#### Review Meta-Skill (Spaced Repetition)

```typescript
// tRPC
metaSkill.review({
  id: string,
  quality: number  // 1-5: how well you remembered
})

// Updates spaced repetition schedule
```

---

### 3. Problems

#### Create Problem

```typescript
// tRPC
problem.create({
  title: string,
  description?: string,
  category?: string,
  priority?: number,
  estimatedHours?: number,
  initialApproach?: string
})
```

```http
POST /api/problems
Content-Type: application/json

{
  "title": "Build web scraper for research papers",
  "description": "Need to extract papers from arXiv",
  "category": "coding",
  "estimatedHours": 8
}
```

#### List Problems

```typescript
// tRPC
problem.list({
  status?: 'active' | 'stuck' | 'solved' | 'abandoned',
  category?: string,
  sortBy?: 'created' | 'updated' | 'priority'
})
```

#### Get Problem with Full Context

```typescript
// tRPC
problem.get({ id: string })

// Returns:
{
  ...problemFields,
  sessions: ProblemSession[],
  entries: Entry[],
  todos: Todo[],
  blockers: Blocker[],
  aiConversations: AIConversation[],
  suggestedMetaSkills: MetaSkill[],
  similarPastProblems: Problem[],
  totalTimeSpent: number,
  progress: number  // 0-100%
}
```

#### Update Problem

```typescript
// tRPC
problem.update({
  id: string,
  title?: string,
  description?: string,
  status?: string,
  solution?: string,
  lessonsLearned?: string
})
```

#### Mark Problem as Solved

```typescript
// tRPC
problem.solve({
  id: string,
  solution: string,
  lessonsLearned?: string,
  whatWorked?: string,
  whatDidntWork?: string
})
```

---

### 4. Problem Sessions

#### Start Session

```typescript
// tRPC
problem.startSession({
  problemId: string,
  goal?: string
})

// Returns: { sessionId: string, startedAt: Date }
```

#### End Session

```typescript
// tRPC
problem.endSession({
  sessionId: string,
  accomplished?: string,
  focusLevel?: number,
  energyLevel?: number,
  whatLearned?: string,
  nextSteps?: string
})
```

#### Get Active Session

```typescript
// tRPC
problem.getActiveSession()

// Returns current session or null
```

---

### 5. Reflections

#### Create Reflection

```typescript
// tRPC
reflection.create({
  type: 'daily' | 'weekly' | 'monthly' | 'problem_completion',
  date: Date,
  whatLearned?: string,
  whatWorked?: string,
  whatToImprove?: string,
  gratitude?: string,
  challenges?: string,
  customResponses?: Record<string, any>,
  mood?: number,
  energy?: number
})
```

#### Get Reflection Prompts

```typescript
// tRPC
reflection.getPrompts({ type: 'daily' | 'weekly' | 'monthly' })

// Returns context-aware prompts:
{
  prompts: [
    {
      question: "What did you learn today?",
      context: "You worked on 'Web Scraper' for 3 hours",
      relatedEntries: Entry[]
    },
    {
      question: "You asked 5 questions about async/await. Do you understand it better now?",
      context: "Pattern detected: multiple async questions",
      relatedEntries: Entry[]
    }
  ],
  todaysSummary: {
    entriesCreated: number,
    problemsWorkedOn: Problem[],
    timeSpent: number,
    metaSkillsApplied: MetaSkill[]
  }
}
```

#### Get Past Reflections

```typescript
// tRPC
reflection.list({
  type?: string,
  startDate?: Date,
  endDate?: Date
})
```

---

### 6. AI Conversations

#### Log AI Conversation

```typescript
// tRPC
ai.logConversation({
  platform: 'claude-desktop' | 'chatgpt-web' | 'claude-code',
  userMessage: string,
  aiResponse?: string,
  problemId?: string,
  sessionId?: string,
  wasHelpful?: boolean
})
```

#### Get Conversations

```typescript
// tRPC
ai.list({
  problemId?: string,
  platform?: string,
  startDate?: Date,
  endDate?: Date
})
```

#### Link Conversation to Problem

```typescript
// tRPC
ai.linkToProblem({
  conversationId: string,
  problemId: string
})
```

---

### 7. Search & Retrieval

#### Semantic Search

```typescript
// tRPC
search.semantic({
  query: string,
  limit?: number,
  type?: string,  // Filter by entry type
  problemId?: string,  // Filter by problem
  startDate?: Date,
  endDate?: Date
})

// Returns:
{
  results: Array<{
    entry: Entry,
    similarity: number,  // 0-1
    reason: string  // Why this was matched
  }>
}
```

#### Keyword Search

```typescript
// tRPC
search.keyword({
  query: string,
  limit?: number,
  filters?: { ... }
})
```

#### Find Similar Entries

```typescript
// tRPC
search.findSimilar({
  entryId: string,
  limit?: number
})
```

#### Timeline View

```typescript
// tRPC
search.timeline({
  startDate: Date,
  endDate: Date,
  groupBy?: 'day' | 'week' | 'month'
})

// Returns entries grouped by time period
```

---

### 8. Intelligence (Pattern Detection & Suggestions)

#### Detect Patterns

```typescript
// tRPC
intelligence.detectPatterns({
  startDate?: Date,
  endDate?: Date,
  minClusterSize?: number
})

// Returns:
{
  patterns: Array<{
    type: 'recurring_problem' | 'learning_pattern' | 'procrastination' | 'time_estimation',
    description: string,
    evidence: Entry[],
    suggestion: string,
    confidence: number  // 0-1
  }>
}
```

#### Suggest Meta-Skills for Problem

```typescript
// tRPC
intelligence.suggestMetaSkills({
  problemDescription: string,
  problemId?: string
})

// Returns:
{
  suggestions: Array<{
    metaSkill: MetaSkill,
    relevance: number,  // 0-1
    reason: string,
    pastSuccesses: Entry[]  // When you used this skill successfully
  }>
}
```

#### Get Insights

```typescript
// tRPC
intelligence.getInsights()

// Returns:
{
  insights: Array<{
    type: 'pattern' | 'meta_skill_suggestion' | 'procrastination_alert' | 'progress_update',
    title: string,
    description: string,
    actionable: boolean,
    suggestedAction?: string,
    relatedEntries: Entry[]
  }>
}
```

#### Analyze Learning Progress

```typescript
// tRPC
intelligence.analyzeLearning({
  topic: string,
  startDate?: Date,
  endDate?: Date
})

// Returns:
{
  topic: string,
  questionsAsked: number,
  insightsGained: number,
  problemsSolved: number,
  metaSkillsLearned: MetaSkill[],
  learningCurve: Array<{ date: Date, knowledgeLevel: number }>,
  suggestedNextSteps: string[]
}
```

---

### 9. Todos

#### Create Todo

```typescript
// tRPC
todo.create({
  title: string,
  description?: string,
  problemId?: string,
  parentTodoId?: string,
  estimatedMinutes?: number,
  dueDate?: Date,
  priority?: number
})
```

#### List Todos

```typescript
// tRPC
todo.list({
  status?: 'pending' | 'in_progress' | 'completed',
  problemId?: string,
  dueDate?: Date,
  sortBy?: 'priority' | 'dueDate' | 'created'
})
```

#### Update Todo Status

```typescript
// tRPC
todo.updateStatus({
  id: string,
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled',
  actualMinutes?: number  // When completing
})
```

#### Suggest Next Task

```typescript
// tRPC
todo.suggestNext({
  energy: number,  // 1-10
  timeAvailable: number,  // minutes
  currentFocus?: string
})

// Returns prioritized todo based on context
```

---

### 10. Admin & Configuration

#### Export All Data

```typescript
// tRPC
admin.exportData({ format: 'json' | 'csv' })

// Returns download link or data blob
```

#### Import Data

```typescript
// tRPC
admin.importData({
  format: 'json' | 'csv',
  data: any
})
```

#### Get Statistics

```typescript
// tRPC
admin.getStats()

// Returns:
{
  totalEntries: number,
  totalMetaSkills: number,
  totalProblems: number,
  problemsSolved: number,
  totalReflections: number,
  averageReflectionFrequency: number,
  mostUsedMetaSkills: MetaSkill[],
  activeProblems: number,
  storageUsed: number  // bytes
}
```

#### Configure Settings

```typescript
// tRPC
admin.updateSettings({
  reflectionSchedule: {
    daily: { enabled: boolean, time: string },
    weekly: { enabled: boolean, dayOfWeek: number, time: string }
  },
  embeddingProvider: 'openai' | 'local',
  spacedRepetition: {
    enabled: boolean,
    remindersEnabled: boolean
  }
})
```

---

## MCP Server Tools

For AI agents (Claude, etc.) to use via Model Context Protocol.

### Available Tools

```typescript
// MCP Server: apps/mcp-server/src/tools.ts

export const mcpTools = [
  {
    name: "lifebetter_log_question",
    description: "Log a question the user asked during conversation",
    inputSchema: {
      type: "object",
      properties: {
        question: { type: "string" },
        context: { type: "string" },
        problemId: { type: "string" }
      },
      required: ["question"]
    }
  },
  {
    name: "lifebetter_log_insight",
    description: "Log an insight or discovery the user made",
    inputSchema: {
      type: "object",
      properties: {
        insight: { type: "string" },
        source: { type: "string" },
        problemId: { type: "string" }
      },
      required: ["insight"]
    }
  },
  {
    name: "lifebetter_get_relevant_meta_skills",
    description: "Get meta-skills relevant to the current problem",
    inputSchema: {
      type: "object",
      properties: {
        problemDescription: { type: "string" }
      },
      required: ["problemDescription"]
    }
  },
  {
    name: "lifebetter_get_similar_problems",
    description: "Find similar problems the user solved before",
    inputSchema: {
      type: "object",
      properties: {
        problemDescription: { type: "string" },
        limit: { type: "number" }
      },
      required: ["problemDescription"]
    }
  },
  {
    name: "lifebetter_start_problem_session",
    description: "Start tracking a work session on a problem",
    inputSchema: {
      type: "object",
      properties: {
        problemId: { type: "string" },
        goal: { type: "string" }
      },
      required: ["problemId"]
    }
  },
  {
    name: "lifebetter_log_blocker",
    description: "Log a blocker the user is facing",
    inputSchema: {
      type: "object",
      properties: {
        description: { type: "string" },
        category: { type: "string" },
        problemId: { type: "string" }
      },
      required: ["description"]
    }
  },
  {
    name: "lifebetter_suggest_reflection",
    description: "Prompt the user to reflect on their progress",
    inputSchema: {
      type: "object",
      properties: {
        context: { type: "string" }
      }
    }
  }
];
```

### Example MCP Usage

```typescript
// When user asks Claude a question:
await use_mcp_tool("lifebetter_log_question", {
  question: "How do I handle async errors in JavaScript?",
  context: "Learning async/await",
  problemId: "uuid-of-javascript-learning-problem"
});

// Claude gets relevant meta-skills:
const metaSkills = await use_mcp_tool("lifebetter_get_relevant_meta_skills", {
  problemDescription: "Handling async errors in JavaScript"
});

// Claude suggests: "Based on your past experience, try 'Read Documentation First' - you've successfully used this for similar JavaScript questions."
```

---

## WebSocket Events

### Client → Server

```typescript
// Subscribe to events
{
  type: 'subscribe',
  channel: 'reflections' | 'insights' | 'patterns'
}

// Unsubscribe
{
  type: 'unsubscribe',
  channel: 'reflections'
}
```

### Server → Client

```typescript
// Reflection prompt
{
  type: 'reflection_prompt',
  data: {
    type: 'daily',
    prompts: ReflectionPrompt[]
  }
}

// New insight detected
{
  type: 'insight_detected',
  data: {
    insight: Insight
  }
}

// Pattern detected
{
  type: 'pattern_detected',
  data: {
    pattern: Pattern
  }
}

// Spaced repetition reminder
{
  type: 'review_reminder',
  data: {
    metaSkills: MetaSkill[]
  }
}
```

---

## Authentication & Authorization

### Auth Strategy

- **Local/Self-hosted**: No auth required (single user)
- **Cloud/Multi-user**: JWT-based auth

```typescript
// tRPC context with auth
export const createContext = async ({ req, res }) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = token ? await verifyToken(token) : null;

  return {
    user,
    db,
    redis
  };
};

// Protected procedure
const protectedProcedure = procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { user: ctx.user } });
});
```

---

## Rate Limiting

For cloud deployment:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

---

## Error Handling

### Standard Error Response

```typescript
{
  error: {
    code: 'NOT_FOUND' | 'BAD_REQUEST' | 'UNAUTHORIZED' | 'INTERNAL_SERVER_ERROR',
    message: string,
    details?: any
  }
}
```

### tRPC Error Handling

```typescript
import { TRPCError } from '@trpc/server';

throw new TRPCError({
  code: 'BAD_REQUEST',
  message: 'Invalid entry type',
  cause: originalError
});
```

---

## API Versioning

```typescript
// URL-based versioning
app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);

// tRPC router versioning
export const appRouter = router({
  v1: v1Router,
  v2: v2Router
});
```

---

## Next Steps

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for the step-by-step build plan.
