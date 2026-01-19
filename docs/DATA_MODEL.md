# LifeBetter Data Model

This document defines the complete database schema for LifeBetter, including all tables, relationships, and vector embeddings.

## Technology Choice

**Primary Database**: PostgreSQL 15+ with pgvector extension

**Why**:
- Hybrid support: structured SQL data + vector embeddings
- Mature, reliable, well-documented
- Self-hostable or managed (Supabase, Neon, Railway)
- Good performance for our use case
- Rich querying capabilities (JSON, full-text search, vectors)

---

## Schema Overview

```
Core Data:
├── entries (all captured items)
├── meta_skills (meta-skill library)
├── problems (long-term projects/problems)
├── problem_sessions (work sessions)
├── reflections (structured reflections)
├── ai_conversations (AI interaction logs)
├── todos (task management)
└── connections (links between entries)

Supporting:
├── tags (tagging system)
├── entry_tags (many-to-many)
├── entry_meta_skills (many-to-many)
├── blockers (obstacles and resolutions)
└── spaced_repetition_items (for meta-skill review)
```

---

## Core Tables

### 1. entries

The central table for all captured knowledge.

```sql
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Content
  type VARCHAR(50) NOT NULL,  -- 'question', 'insight', 'reflection', 'attempt', 'blocker_resolved', etc.
  content TEXT NOT NULL,
  raw_content TEXT,  -- Original unprocessed content

  -- Vector embedding for semantic search
  embedding VECTOR(1536),  -- OpenAI text-embedding-3-small dimension

  -- Context
  source VARCHAR(50),  -- 'cli', 'web', 'mcp', 'obsidian', 'browser-ext'
  context JSONB,  -- Flexible context data

  -- Relationships
  problem_id UUID REFERENCES problems(id) ON DELETE SET NULL,
  session_id UUID REFERENCES problem_sessions(id) ON DELETE SET NULL,
  parent_entry_id UUID REFERENCES entries(id) ON DELETE SET NULL,  -- For threaded entries

  -- Metadata
  is_archived BOOLEAN DEFAULT false,
  importance INTEGER DEFAULT 0,  -- User-rated importance (-10 to +10)

  -- Search optimization
  search_vector TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', content)) STORED
);

-- Indexes
CREATE INDEX idx_entries_created_at ON entries(created_at DESC);
CREATE INDEX idx_entries_type ON entries(type);
CREATE INDEX idx_entries_problem_id ON entries(problem_id);
CREATE INDEX idx_entries_session_id ON entries(session_id);
CREATE INDEX idx_entries_search_vector ON entries USING GIN(search_vector);

-- Vector similarity search index
CREATE INDEX idx_entries_embedding ON entries USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

**Entry Types**:
- `question` - Questions asked to AI or yourself
- `insight` - Aha moments, discoveries
- `reflection` - Structured reflection answers
- `attempt` - Problem-solving attempt log
- `blocker_resolved` - How you overcame a blocker
- `note` - General notes
- `ai_response` - AI's response (optional, for full conversation tracking)
- `emotional_log` - Emotional state tracking
- `procrastination` - Procrastination moment captured
- `meta_skill_application` - Logged use of a meta-skill

---

### 2. meta_skills

The library of meta-skills (reusable problem-solving strategies).

```sql
CREATE TABLE meta_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Core fields
  name VARCHAR(200) NOT NULL UNIQUE,
  description TEXT NOT NULL,

  -- Vector embedding for semantic matching
  embedding VECTOR(1536),

  -- Examples and evidence
  examples TEXT[],  -- Array of example descriptions
  source VARCHAR(100),  -- 'discovered', 'imported', 'suggested_by_system'

  -- Effectiveness tracking
  times_applied INTEGER DEFAULT 0,
  times_successful INTEGER DEFAULT 0,

  -- Metadata
  category VARCHAR(100),  -- 'learning', 'focus', 'problem-solving', 'debugging', etc.
  difficulty VARCHAR(20),  -- 'beginner', 'intermediate', 'advanced'

  -- Spaced repetition
  next_review_date DATE,
  review_interval_days INTEGER DEFAULT 1,

  -- User customization
  is_active BOOLEAN DEFAULT true,
  personal_notes TEXT
);

CREATE INDEX idx_meta_skills_name ON meta_skills(name);
CREATE INDEX idx_meta_skills_category ON meta_skills(category);
CREATE INDEX idx_meta_skills_next_review ON meta_skills(next_review_date) WHERE is_active = true;
CREATE INDEX idx_meta_skills_embedding ON meta_skills USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

**Common Meta-Skills** (examples):
- "Divide and Conquer" - Break complex problems into smaller parts
- "Read Documentation First" - Check official docs before asking AI
- "Write Tests First" - TDD approach
- "Take Breaks When Stuck" - Avoid burnout, fresh perspective
- "Ask 'Why' Five Times" - Root cause analysis
- "Prototype Before Planning" - Learn by doing for exploratory tasks

---

### 3. problems

Long-term problems or projects you're working on.

```sql
CREATE TABLE problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Core fields
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'active',  -- 'active', 'stuck', 'solved', 'abandoned'

  -- Vector embedding
  embedding VECTOR(1536),

  -- Categorization
  category VARCHAR(100),  -- 'coding', 'learning', 'career', 'personal', etc.
  priority INTEGER DEFAULT 0,

  -- Problem-solving metadata
  initial_approach TEXT,  -- What you tried first
  solution TEXT,  -- How it was solved (when solved)
  solved_at TIMESTAMPTZ,

  -- Time tracking
  estimated_hours FLOAT,
  actual_hours FLOAT,

  -- Reflection
  lessons_learned TEXT,
  what_worked TEXT,
  what_didnt_work TEXT,

  -- External links
  external_links JSONB,  -- Links to related resources, PRs, docs

  -- Metadata
  is_archived BOOLEAN DEFAULT false
);

CREATE INDEX idx_problems_status ON problems(status);
CREATE INDEX idx_problems_category ON problems(category);
CREATE INDEX idx_problems_created_at ON problems(created_at DESC);
CREATE INDEX idx_problems_embedding ON problems USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

---

### 4. problem_sessions

Individual work sessions on a problem (time-tracked).

```sql
CREATE TABLE problem_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,

  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,  -- Calculated from start/end

  -- Session details
  goal TEXT,  -- What you wanted to accomplish
  accomplished TEXT,  -- What you actually did

  -- Tracking
  focus_level INTEGER,  -- 1-10 self-rating
  energy_level INTEGER,  -- 1-10 self-rating
  interruptions INTEGER DEFAULT 0,

  -- Post-session reflection
  what_learned TEXT,
  next_steps TEXT,

  -- Metadata
  context JSONB  -- Flexible data (environment, tools used, etc.)
);

CREATE INDEX idx_problem_sessions_problem_id ON problem_sessions(problem_id);
CREATE INDEX idx_problem_sessions_started_at ON problem_sessions(started_at DESC);
```

---

### 5. reflections

Structured daily/weekly/monthly reflections.

```sql
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Type and scope
  type VARCHAR(50) NOT NULL,  -- 'daily', 'weekly', 'monthly', 'problem_completion'
  date DATE NOT NULL,

  -- Standard reflection questions (flexible)
  what_learned TEXT,
  what_worked TEXT,
  what_to_improve TEXT,
  gratitude TEXT,
  challenges TEXT,

  -- Custom questions (JSONB for flexibility)
  custom_responses JSONB,

  -- Detected patterns (filled by system)
  patterns_detected TEXT[],
  suggested_meta_skills UUID[],  -- References to meta_skills

  -- Linked entries
  entry_ids UUID[],  -- Entries from this period

  -- Metadata
  mood INTEGER,  -- 1-10 rating
  energy INTEGER  -- 1-10 rating
);

CREATE INDEX idx_reflections_date ON reflections(date DESC);
CREATE INDEX idx_reflections_type ON reflections(type);
CREATE UNIQUE INDEX idx_reflections_type_date ON reflections(type, date);
```

---

### 6. ai_conversations

Logs of AI interactions (questions + responses).

```sql
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Platform
  platform VARCHAR(50),  -- 'claude-desktop', 'chatgpt-web', 'claude-code', etc.
  conversation_id VARCHAR(500),  -- Platform's conversation ID if available

  -- Content
  user_message TEXT NOT NULL,
  ai_response TEXT,

  -- Embeddings
  user_message_embedding VECTOR(1536),
  ai_response_embedding VECTOR(1536),

  -- Context
  problem_id UUID REFERENCES problems(id) ON DELETE SET NULL,
  session_id UUID REFERENCES problem_sessions(id) ON DELETE SET NULL,

  -- Metadata
  was_helpful BOOLEAN,  -- User feedback
  tags TEXT[],

  -- Link to entries (this creates an entry automatically)
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE
);

CREATE INDEX idx_ai_conversations_created_at ON ai_conversations(created_at DESC);
CREATE INDEX idx_ai_conversations_problem_id ON ai_conversations(problem_id);
CREATE INDEX idx_ai_conversations_platform ON ai_conversations(platform);
```

---

### 7. todos

Task management integrated with problems.

```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Content
  title VARCHAR(500) NOT NULL,
  description TEXT,

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending',  -- 'pending', 'in_progress', 'completed', 'cancelled'
  completed_at TIMESTAMPTZ,

  -- Relationships
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  parent_todo_id UUID REFERENCES todos(id) ON DELETE CASCADE,  -- For subtasks

  -- Planning
  estimated_minutes INTEGER,
  actual_minutes INTEGER,

  -- Prioritization
  priority INTEGER DEFAULT 0,
  due_date DATE,

  -- Context
  context_needed JSONB,  -- What's needed to complete this (energy, time, tools)

  -- Metadata
  is_archived BOOLEAN DEFAULT false
);

CREATE INDEX idx_todos_status ON todos(status);
CREATE INDEX idx_todos_problem_id ON todos(problem_id);
CREATE INDEX idx_todos_due_date ON todos(due_date) WHERE status NOT IN ('completed', 'cancelled');
```

---

### 8. connections

Explicit links between entries (automatic + manual).

```sql
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Links
  from_entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  to_entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,

  -- Type and strength
  connection_type VARCHAR(50) NOT NULL,  -- 'similar', 'contradiction', 'builds_on', 'resolves', etc.
  strength FLOAT DEFAULT 0.5,  -- 0.0 to 1.0 (from similarity score)

  -- Source
  created_by VARCHAR(50) NOT NULL,  -- 'system', 'user'

  -- Validation
  user_confirmed BOOLEAN,  -- Did user validate this connection?

  UNIQUE(from_entry_id, to_entry_id, connection_type)
);

CREATE INDEX idx_connections_from ON connections(from_entry_id);
CREATE INDEX idx_connections_to ON connections(to_entry_id);
CREATE INDEX idx_connections_type ON connections(connection_type);
```

---

### 9. blockers

Obstacles encountered and how they were resolved.

```sql
CREATE TABLE blockers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,

  -- Content
  description TEXT NOT NULL,
  category VARCHAR(100),  -- 'technical', 'knowledge_gap', 'external_dependency', 'motivation'

  -- Context
  problem_id UUID REFERENCES problems(id) ON DELETE SET NULL,
  session_id UUID REFERENCES problem_sessions(id) ON DELETE SET NULL,

  -- Resolution
  how_resolved TEXT,
  time_to_resolve_minutes INTEGER,

  -- Learning
  what_learned TEXT,
  prevention_strategy TEXT,  -- How to avoid this in the future

  -- Links
  related_entry_ids UUID[]
);

CREATE INDEX idx_blockers_problem_id ON blockers(problem_id);
CREATE INDEX idx_blockers_category ON blockers(category);
CREATE INDEX idx_blockers_created_at ON blockers(created_at DESC);
```

---

### 10. spaced_repetition_items

For reviewing meta-skills at optimal intervals.

```sql
CREATE TABLE spaced_repetition_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- What to review
  item_type VARCHAR(50) NOT NULL,  -- 'meta_skill', 'insight', 'lesson'
  item_id UUID NOT NULL,  -- Reference to meta_skills.id or entries.id

  -- Spaced repetition data
  next_review_date DATE NOT NULL,
  interval_days INTEGER NOT NULL DEFAULT 1,
  ease_factor FLOAT NOT NULL DEFAULT 2.5,

  -- Review history
  review_count INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  last_review_quality INTEGER,  -- 1-5 (how well you remembered)

  -- Status
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_sr_next_review ON spaced_repetition_items(next_review_date) WHERE is_active = true;
CREATE INDEX idx_sr_item ON spaced_repetition_items(item_type, item_id);
```

---

## Supporting Tables

### tags

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  color VARCHAR(7),  -- Hex color
  description TEXT
);

CREATE INDEX idx_tags_name ON tags(name);
```

### entry_tags (many-to-many)

```sql
CREATE TABLE entry_tags (
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,

  PRIMARY KEY (entry_id, tag_id)
);

CREATE INDEX idx_entry_tags_entry ON entry_tags(entry_id);
CREATE INDEX idx_entry_tags_tag ON entry_tags(tag_id);
```

### entry_meta_skills (many-to-many)

```sql
CREATE TABLE entry_meta_skills (
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  meta_skill_id UUID NOT NULL REFERENCES meta_skills(id) ON DELETE CASCADE,

  -- Context
  applied BOOLEAN DEFAULT false,  -- Was skill applied, or just mentioned?
  effectiveness INTEGER,  -- 1-10 rating (if applied)

  PRIMARY KEY (entry_id, meta_skill_id)
);

CREATE INDEX idx_entry_meta_skills_entry ON entry_meta_skills(entry_id);
CREATE INDEX idx_entry_meta_skills_skill ON entry_meta_skills(meta_skill_id);
```

---

## Vector Search Queries

### Example: Find Similar Entries

```sql
-- Find entries similar to a given entry
SELECT
  e.id,
  e.content,
  e.type,
  e.created_at,
  1 - (e.embedding <=> $1::vector) as similarity
FROM entries e
WHERE e.embedding IS NOT NULL
  AND e.id != $2  -- Exclude the query entry itself
ORDER BY e.embedding <=> $1::vector
LIMIT 10;
```

### Example: Suggest Meta-Skills for a Problem

```sql
-- Find meta-skills semantically similar to problem description
SELECT
  ms.id,
  ms.name,
  ms.description,
  ms.times_successful,
  ms.times_applied,
  1 - (ms.embedding <=> $1::vector) as relevance
FROM meta_skills ms
WHERE ms.is_active = true
  AND ms.embedding IS NOT NULL
ORDER BY ms.embedding <=> $1::vector
LIMIT 5;
```

### Example: Hybrid Search (Vector + Filters)

```sql
-- Semantic search with type filter
SELECT
  e.id,
  e.content,
  e.type,
  e.created_at,
  1 - (e.embedding <=> $1::vector) as similarity
FROM entries e
WHERE e.type = $2
  AND e.created_at > $3
  AND e.embedding IS NOT NULL
ORDER BY e.embedding <=> $1::vector
LIMIT 20;
```

---

## Migrations Strategy

1. Use a migration tool: **Drizzle Kit** or **Prisma Migrate**
2. Version all schema changes
3. Support rollback
4. Seed with example meta-skills
5. Include pgvector extension setup

---

## Data Integrity

**Triggers**:
- Update `updated_at` on all tables automatically
- Recalculate `actual_hours` on problems when sessions end
- Auto-archive old entries (optional)

**Constraints**:
- Ensure embedding dimensions are consistent (1536)
- Validate entry types against enum
- Ensure session durations are positive

**Cascading Deletes**:
- Deleting a problem cascades to sessions, todos
- Deleting an entry cascades to connections, tags
- Soft-delete option for entries (archive instead of delete)

---

## Performance Considerations

1. **Vector Index**: Use IVFFlat for <1M vectors, switch to HNSW for larger datasets
2. **Partitioning**: Consider partitioning `entries` by date for large datasets
3. **Caching**: Cache frequent queries (popular meta-skills, recent entries)
4. **Batch Embedding**: Generate embeddings in batches, not one-by-one
5. **Materialized Views**: For complex analytics queries

---

## Privacy & Security

- No PII stored without consent
- Encryption at rest (database level)
- Embeddings are not reversible to original text
- API keys stored securely (environment variables, not in DB)
- Export all data in JSON format on demand
- Right to be forgotten: full data deletion

---

## Next Steps

See [API_DESIGN.md](./API_DESIGN.md) for the API layer on top of this data model.
