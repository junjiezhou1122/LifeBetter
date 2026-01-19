# Data Models & Database Schema

## Overview

LifeBetter uses a hybrid data model combining:
- **Structured relational data** (PostgreSQL) for entities and relationships
- **Vector embeddings** (pgvector) for semantic search and pattern detection

## Core Entities

### 1. Entry

The fundamental unit - any captured question, insight, or reflection.

```typescript
interface Entry {
  // Identity
  id: string;                    // UUID
  timestamp: Date;

  // Content
  type: EntryType;               // 'question' | 'insight' | 'reflection' | 'attempt' | 'blocker' | 'solution' | 'reading' | 'emotion' | 'custom'
  content: string;               // The actual entry text
  embedding: number[];           // 1536-dim vector for semantic search

  // Context
  source?: string;               // 'cli' | 'web' | 'mcp' | 'browser-ext' | 'obsidian' | 'notion' | 'mobile'
  context?: string;              // What were you doing when this was captured?
  location?: string;             // URL, file path, or other location reference

  // Relationships
  problemId?: string;            // Link to problem if related
  parentEntryId?: string;        // For threaded entries
  tags: string[];
  metaSkillIds: string[];        // Meta-skills applied or discovered

  // Metadata
  aiConversationId?: string;     // If from AI interaction
  energyLevel?: number;          // 1-10 scale
  mood?: string;
  private: boolean;              // Whether to exclude from sharing/export
}

type EntryType =
  | 'question'      // Question asked (to AI, yourself, others)
  | 'insight'       // Discovery or realization
  | 'reflection'    // Structured thinking about experience
  | 'attempt'       // Problem-solving attempt
  | 'blocker'       // Something preventing progress
  | 'solution'      // Solution discovered
  | 'reading'       // Note from reading (article, book, etc.)
  | 'emotion'       // Emotional pattern or trigger
  | 'custom';       // User-defined types
```

**PostgreSQL Schema:**
```sql
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),  -- pgvector extension

  source VARCHAR(50),
  context TEXT,
  location TEXT,

  problem_id UUID REFERENCES problems(id),
  parent_entry_id UUID REFERENCES entries(id),
  tags TEXT[],
  meta_skill_ids UUID[],

  ai_conversation_id UUID REFERENCES ai_conversations(id),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  mood VARCHAR(50),
  private BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_entries_timestamp ON entries(timestamp DESC);
CREATE INDEX idx_entries_type ON entries(type);
CREATE INDEX idx_entries_problem_id ON entries(problem_id);
CREATE INDEX idx_entries_embedding ON entries USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_entries_tags ON entries USING GIN(tags);
```

### 2. MetaSkill

Reusable problem-solving techniques or approaches.

```typescript
interface MetaSkill {
  // Identity
  id: string;
  name: string;                  // e.g., "Divide and Conquer"

  // Description
  description: string;           // What is this skill?
  whenToUse: string;            // When should you apply it?
  howToApply: string;           // Steps to apply it
  embedding: number[];          // For semantic matching

  // Learning
  source: 'discovered' | 'learned' | 'imported';
  discoveryDate: Date;
  lastUsed?: Date;
  timesUsed: number;

  // Effectiveness tracking
  effectiveness: {
    totalUses: number;
    successfulUses: number;
    failedUses: number;
    averageTimeToSolution?: number;  // In hours
  };

  // Examples
  exampleEntryIds: string[];    // Entries where this was used
  relatedProblemIds: string[]; // Problems solved with this

  // Spaced repetition
  nextReviewDate?: Date;
  reviewCount: number;
  easeFactor: number;           // For spaced repetition algorithm

  // Organization
  category?: string;            // e.g., "Learning", "Debugging", "Planning"
  tags: string[];
  relatedMetaSkillIds: string[];  // Similar or complementary skills

  // Metadata
  private: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**PostgreSQL Schema:**
```sql
CREATE TABLE meta_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  when_to_use TEXT,
  how_to_apply TEXT,
  embedding vector(1536),

  source VARCHAR(50) NOT NULL,
  discovery_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used TIMESTAMPTZ,
  times_used INTEGER DEFAULT 0,

  total_uses INTEGER DEFAULT 0,
  successful_uses INTEGER DEFAULT 0,
  failed_uses INTEGER DEFAULT 0,
  average_time_to_solution NUMERIC,

  example_entry_ids UUID[],
  related_problem_ids UUID[],

  next_review_date TIMESTAMPTZ,
  review_count INTEGER DEFAULT 0,
  ease_factor NUMERIC DEFAULT 2.5,

  category VARCHAR(100),
  tags TEXT[],
  related_meta_skill_ids UUID[],

  private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meta_skills_name ON meta_skills(name);
CREATE INDEX idx_meta_skills_category ON meta_skills(category);
CREATE INDEX idx_meta_skills_next_review ON meta_skills(next_review_date);
CREATE INDEX idx_meta_skills_embedding ON meta_skills USING ivfflat (embedding vector_cosine_ops);
```

### 3. ProblemProject

Long-term problems or projects being solved.

```typescript
interface ProblemProject {
  // Identity
  id: string;
  title: string;
  description: string;
  embedding: number[];

  // Status
  status: 'active' | 'blocked' | 'solved' | 'abandoned';
  priority: 'low' | 'medium' | 'high' | 'urgent';

  // Timeline
  startedAt: Date;
  targetCompletionDate?: Date;
  completedAt?: Date;
  lastWorkedOn?: Date;

  // Problem-solving
  attempts: ProblemAttempt[];
  blockers: Blocker[];
  metaSkillsApplied: string[];  // Meta-skill IDs

  // Learning
  whatLearned: string[];        // Key learnings
  whatWorked: string[];
  whatDidntWork: string[];

  // Context
  context?: string;             // Why are you solving this?
  relatedProblems: string[];    // Similar problems you've solved

  // Tracking
  totalTimeSpent: number;       // Minutes
  estimatedTime?: number;       // Initial estimate
  sessions: ProblemSession[];

  // Organization
  tags: string[];
  category?: string;

  // Integration
  externalLinks: {              // Link to external tools
    notion?: string;
    obsidian?: string;
    github?: string;
    other?: Record<string, string>;
  };

  createdAt: Date;
  updatedAt: Date;
}

interface ProblemAttempt {
  id: string;
  timestamp: Date;
  approach: string;             // What did you try?
  outcome: 'success' | 'partial' | 'failed' | 'abandoned';
  whatHappened: string;
  metaSkillsUsed: string[];
  entryIds: string[];           // Related entries
  timeSpent: number;            // Minutes
}

interface Blocker {
  id: string;
  description: string;
  detectedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
  howResolved?: string;
  relatedEntryIds: string[];
}

interface ProblemSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  focusQuality: number;         // 1-10
  energyLevel: number;          // 1-10
  activities: SessionActivity[];
  distractions: Distraction[];
  aiConversations: string[];    // AI conversation IDs
  entryIds: string[];
  outcome?: string;
}

interface SessionActivity {
  timestamp: Date;
  type: 'coding' | 'reading' | 'debugging' | 'planning' | 'researching' | 'asking-ai' | 'other';
  description: string;
  duration: number;             // Minutes
}

interface Distraction {
  timestamp: Date;
  type: string;
  duration: number;             // Minutes
  trigger?: string;
}
```

**PostgreSQL Schema:**
```sql
CREATE TABLE problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  embedding vector(1536),

  status VARCHAR(50) NOT NULL,
  priority VARCHAR(50) NOT NULL,

  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  target_completion_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_worked_on TIMESTAMPTZ,

  meta_skills_applied UUID[],
  what_learned TEXT[],
  what_worked TEXT[],
  what_didnt_work TEXT[],

  context TEXT,
  related_problems UUID[],

  total_time_spent INTEGER DEFAULT 0,  -- minutes
  estimated_time INTEGER,

  tags TEXT[],
  category VARCHAR(100),

  external_links JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE problem_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approach TEXT NOT NULL,
  outcome VARCHAR(50) NOT NULL,
  what_happened TEXT,
  meta_skills_used UUID[],
  entry_ids UUID[],
  time_spent INTEGER,  -- minutes

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE blockers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolution TEXT,
  how_resolved TEXT,
  related_entry_ids UUID[],

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE problem_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  focus_quality INTEGER CHECK (focus_quality BETWEEN 1 AND 10),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  activities JSONB,  -- Array of SessionActivity
  distractions JSONB,  -- Array of Distraction
  ai_conversation_ids UUID[],
  entry_ids UUID[],
  outcome TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_problems_status ON problems(status);
CREATE INDEX idx_problems_priority ON problems(priority);
CREATE INDEX idx_problems_embedding ON problems USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_problem_attempts_problem_id ON problem_attempts(problem_id);
CREATE INDEX idx_blockers_problem_id ON blockers(problem_id);
CREATE INDEX idx_problem_sessions_problem_id ON problem_sessions(problem_id);
```

### 4. Reflection

Structured thinking about experiences.

```typescript
interface Reflection {
  // Identity
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'problem' | 'adhoc';

  // Time period
  date: Date;
  periodStart?: Date;
  periodEnd?: Date;

  // Content
  prompt: string;               // What question prompted this?
  response: string;             // Your reflection
  embedding: number[];

  // Structured reflection
  whatWorked: string[];
  whatDidntWork: string[];
  whatLearned: string[];
  patternsNoticed: string[];
  metaSkillsDiscovered: string[];  // Meta-skill IDs

  // Context
  relatedEntryIds: string[];
  relatedProblemIds: string[];
  mood?: string;
  energyLevel?: number;

  // Follow-up
  actionItems: string[];
  goalsForNext: string[];

  createdAt: Date;
  updatedAt: Date;
}
```

**PostgreSQL Schema:**
```sql
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,

  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  embedding vector(1536),

  what_worked TEXT[],
  what_didnt_work TEXT[],
  what_learned TEXT[],
  patterns_noticed TEXT[],
  meta_skills_discovered UUID[],

  related_entry_ids UUID[],
  related_problem_ids UUID[],
  mood VARCHAR(50),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),

  action_items TEXT[],
  goals_for_next TEXT[],

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reflections_type ON reflections(type);
CREATE INDEX idx_reflections_date ON reflections(date DESC);
CREATE INDEX idx_reflections_embedding ON reflections USING ivfflat (embedding vector_cosine_ops);
```

### 5. AIConversation

Captures conversations with AI assistants.

```typescript
interface AIConversation {
  // Identity
  id: string;
  platform: 'chatgpt' | 'claude-app' | 'claude-code' | 'gemini' | 'other';

  // Content
  messages: AIMessage[];
  summary?: string;             // AI-generated summary
  embedding: number[];          // Of the whole conversation

  // Context
  problemId?: string;
  relatedEntryIds: string[];
  metaSkillsDiscussed: string[];

  // Metadata
  startedAt: Date;
  endedAt?: Date;
  totalMessages: number;

  // Extraction
  insightsExtracted: string[];  // Entry IDs created from this
  questionsAsked: string[];
  solutionsFound: string[];

  createdAt: Date;
  updatedAt: Date;
}

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  embedding?: number[];
}
```

**PostgreSQL Schema:**
```sql
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) NOT NULL,

  messages JSONB NOT NULL,  -- Array of AIMessage
  summary TEXT,
  embedding vector(1536),

  problem_id UUID REFERENCES problems(id),
  related_entry_ids UUID[],
  meta_skills_discussed UUID[],

  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  total_messages INTEGER DEFAULT 0,

  insights_extracted UUID[],  -- Entry IDs
  questions_asked TEXT[],
  solutions_found TEXT[],

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_platform ON ai_conversations(platform);
CREATE INDEX idx_ai_conversations_problem_id ON ai_conversations(problem_id);
CREATE INDEX idx_ai_conversations_started_at ON ai_conversations(started_at DESC);
```

### 6. Pattern

Automatically detected behavioral or thinking patterns.

```typescript
interface Pattern {
  // Identity
  id: string;
  type: 'behavioral' | 'thinking' | 'emotional' | 'temporal' | 'problem-solving';

  // Description
  name: string;
  description: string;
  confidence: number;           // 0-1, how confident is the detection?

  // Evidence
  evidenceEntryIds: string[];
  evidenceProblemIds: string[];
  firstDetected: Date;
  lastSeen: Date;
  occurrences: number;

  // Insights
  isPositive: boolean;          // Good pattern or bad?
  suggestion?: string;          // How to leverage or change it

  // Status
  status: 'detected' | 'confirmed' | 'dismissed';
  userFeedback?: string;

  createdAt: Date;
  updatedAt: Date;
}
```

**PostgreSQL Schema:**
```sql
CREATE TABLE patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  confidence NUMERIC NOT NULL CHECK (confidence BETWEEN 0 AND 1),

  evidence_entry_ids UUID[],
  evidence_problem_ids UUID[],
  first_detected TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  occurrences INTEGER DEFAULT 1,

  is_positive BOOLEAN,
  suggestion TEXT,

  status VARCHAR(50) NOT NULL DEFAULT 'detected',
  user_feedback TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patterns_type ON patterns(type);
CREATE INDEX idx_patterns_status ON patterns(status);
CREATE INDEX idx_patterns_first_detected ON patterns(first_detected DESC);
```

### 7. Connection

Explicit links between entities.

```typescript
interface Connection {
  id: string;
  fromType: 'entry' | 'problem' | 'meta-skill' | 'reflection' | 'pattern';
  fromId: string;
  toType: 'entry' | 'problem' | 'meta-skill' | 'reflection' | 'pattern';
  toId: string;

  connectionType: 'related' | 'caused-by' | 'solved-by' | 'similar-to' | 'opposite-of' | 'prerequisite-for' | 'custom';
  strength: number;             // 0-1, how strong is this connection?

  reason?: string;              // Why are these connected?
  auto: boolean;                // Auto-detected or manual?

  createdAt: Date;
}
```

**PostgreSQL Schema:**
```sql
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_type VARCHAR(50) NOT NULL,
  from_id UUID NOT NULL,
  to_type VARCHAR(50) NOT NULL,
  to_id UUID NOT NULL,

  connection_type VARCHAR(50) NOT NULL,
  strength NUMERIC CHECK (strength BETWEEN 0 AND 1),
  reason TEXT,
  auto BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(from_type, from_id, to_type, to_id, connection_type)
);

CREATE INDEX idx_connections_from ON connections(from_type, from_id);
CREATE INDEX idx_connections_to ON connections(to_type, to_id);
```

## Supporting Tables

### Todo Integration

```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  status VARCHAR(50) NOT NULL,
  priority VARCHAR(50),

  problem_id UUID REFERENCES problems(id),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  estimated_duration INTEGER,  -- minutes
  actual_duration INTEGER,

  tags TEXT[],

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### User Preferences

```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,  -- For future multi-user support

  -- Reflection settings
  daily_reflection_time TIME,
  daily_reflection_enabled BOOLEAN DEFAULT TRUE,
  weekly_reflection_day INTEGER,  -- 0-6 (Sunday-Saturday)
  weekly_reflection_enabled BOOLEAN DEFAULT TRUE,

  -- Notification settings
  notifications_enabled BOOLEAN DEFAULT TRUE,
  notification_channels JSONB,  -- email, push, etc.

  -- Spaced repetition settings
  meta_skill_review_enabled BOOLEAN DEFAULT TRUE,
  review_cards_per_day INTEGER DEFAULT 5,

  -- Display settings
  default_view VARCHAR(50) DEFAULT 'dashboard',
  theme VARCHAR(50) DEFAULT 'light',

  -- Integration settings
  integrations JSONB,  -- Obsidian, Notion, etc.

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Embedding Strategy

All text-heavy entities get vector embeddings for semantic search:

### What Gets Embedded:
1. **Entries** - Full content
2. **MetaSkills** - Concatenation of name + description + whenToUse
3. **Problems** - Title + description + context
4. **Reflections** - Prompt + response
5. **AIConversations** - Summary of entire conversation
6. **AIMessages** - Individual messages (optional, for fine-grained search)

### Embedding Generation:
- **Option 1**: OpenAI `text-embedding-3-small` (1536 dims, $0.02/1M tokens)
- **Option 2**: OpenAI `text-embedding-3-large` (3072 dims, better quality)
- **Option 3**: Local model (e.g., `all-MiniLM-L6-v2`) for privacy

### When to Generate:
- On creation (async background job)
- On significant updates
- Batch regeneration if embedding model changes

## Vector Search Operations

```typescript
interface VectorSearchService {
  // Find similar entries
  findSimilarEntries(
    entryId: string,
    limit?: number,
    filters?: { type?: string; dateRange?: [Date, Date] }
  ): Promise<Array<{ entry: Entry; similarity: number }>>;

  // Search by semantic meaning
  searchByMeaning(
    query: string,
    limit?: number,
    filters?: any
  ): Promise<Array<{ entry: Entry; similarity: number }>>;

  // Find relevant meta-skills for a problem
  suggestMetaSkills(
    problemDescription: string,
    limit?: number
  ): Promise<Array<{ metaSkill: MetaSkill; relevance: number }>>;

  // Find similar past problems
  findSimilarProblems(
    problemId: string,
    limit?: number
  ): Promise<Array<{ problem: ProblemProject; similarity: number }>>;

  // Cluster entries to detect patterns
  detectClusters(
    entryIds: string[],
    numClusters: number
  ): Promise<Array<{ clusterId: number; entryIds: string[]; centroid: number[] }>>;
}
```

## Data Relationships

```
Entry
  ├─> Problem (optional)
  ├─> MetaSkills (many)
  ├─> AIConversation (optional)
  └─> Parent Entry (optional, for threading)

Problem
  ├─> Attempts (many)
  ├─> Blockers (many)
  ├─> Sessions (many)
  ├─> MetaSkills (many)
  └─> Entries (many)

MetaSkill
  ├─> Example Entries (many)
  ├─> Related Problems (many)
  └─> Related MetaSkills (many)

Reflection
  ├─> Entries (many)
  ├─> Problems (many)
  └─> MetaSkills Discovered (many)

AIConversation
  ├─> Problem (optional)
  ├─> Entries (many, extracted insights)
  └─> MetaSkills Discussed (many)

Pattern
  ├─> Evidence Entries (many)
  └─> Evidence Problems (many)

Connection
  ├─> From Entity (any type)
  └─> To Entity (any type)
```

## Data Lifecycle

### Creation Flow
1. User creates entry (CLI/Web/MCP)
2. Entry saved to database
3. Background job generates embedding
4. Background job detects entities (problems, meta-skills)
5. Background job creates connections
6. Background job checks for patterns

### Update Flow
1. User updates entity
2. Entity updated in database
3. If significant change, regenerate embedding
4. Update related connections
5. Invalidate relevant caches

### Deletion Flow
1. User deletes entity
2. Soft delete (mark as deleted) or hard delete
3. Cascade delete or nullify relationships
4. Clean up orphaned connections
5. Update statistics and aggregates

## Performance Considerations

### Indexing Strategy
- B-tree indexes for exact lookups (IDs, timestamps)
- GIN indexes for array fields (tags, related IDs)
- IVFFlat indexes for vector similarity search
- Partial indexes for common filters (active problems, recent entries)

### Caching
- Cache user preferences
- Cache frequently accessed meta-skills
- Cache embedding computations
- Cache vector search results (with TTL)

### Partitioning
- Partition entries by timestamp (monthly/yearly)
- Partition AI conversations by platform and timestamp
- Keep recent data in hot storage, archive old data

### Batch Operations
- Batch embedding generation
- Batch pattern detection
- Batch connection creation
- Background jobs for expensive operations

## Data Privacy & Security

### Privacy Levels
- **Public**: Can be shared with community
- **Private**: Only visible to user
- **Encrypted**: Encrypted at rest for sensitive data

### Export/Import
- Full data export in JSON format
- Selective export (date range, types)
- Import from backup
- Migration between instances

### Backup Strategy
- Daily automated backups
- Point-in-time recovery
- Export before major operations
- User-initiated backups

## Extension Points

### Custom Entry Types
Users can define custom entry types with schemas:
```typescript
interface CustomEntryType {
  name: string;
  schema: JSONSchema;
  displayTemplate: string;
  captureForm: FormDefinition;
}
```

### Custom Fields
Add arbitrary metadata to any entity:
```sql
ALTER TABLE entries ADD COLUMN custom_fields JSONB;
```

### Custom Patterns
Define pattern detection rules:
```typescript
interface CustomPattern {
  name: string;
  detectionRule: (entries: Entry[]) => boolean;
  suggestion: string;
}
```

This data model provides a solid foundation that can scale from MVP to full system while maintaining flexibility for future extensions.
