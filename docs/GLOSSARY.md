# LifeBetter Glossary

This document defines all key terms, concepts, and terminology used throughout the LifeBetter system.

---

## Core Concepts

### Meta-Learning
**Definition**: Learning about learning; the process of understanding and improving how you learn and solve problems.

**In LifeBetter**: The core focus - not just capturing what you learn, but learning *how* you learn best.

**Example**: Instead of just learning "React hooks", you learn "I learn frameworks faster when I build small examples first" (a meta-skill).

---

### Meta-Skill
**Definition**: A reusable problem-solving strategy or approach that can be applied across different contexts.

**In LifeBetter**: The fundamental unit of improvement. Meta-skills are discovered, tracked, and suggested.

**Examples**:
- "Divide and Conquer" - Break complex problems into smaller parts
- "Read Documentation First" - Check official docs before asking questions
- "Take Breaks When Stuck" - Step away to gain fresh perspective
- "Write Tests First" - TDD approach
- "Ask 'Why' Five Times" - Root cause analysis

**Not Meta-Skills** (too specific):
- "Use React hooks" - This is knowledge, not a strategy
- "Fix this bug" - This is a task, not a reusable approach

---

### Entry
**Definition**: Any captured item in LifeBetter - a question, insight, reflection, note, etc.

**Types**:
- `question` - Questions you ask
- `insight` - Discoveries or aha moments
- `reflection` - Structured reflection responses
- `attempt` - Problem-solving attempt logs
- `blocker_resolved` - How you overcame an obstacle
- `note` - General notes
- `ai_response` - AI's response (optional)
- `emotional_log` - Emotional state tracking
- `procrastination` - Procrastination moment
- `meta_skill_application` - Logged use of a meta-skill

**Properties**: All entries have content, timestamp, type, optional embedding, tags, and links to problems/meta-skills.

---

### Embedding
**Definition**: A vector representation of text (array of numbers) that captures semantic meaning.

**In LifeBetter**: Every entry is converted to a 1536-dimensional vector using OpenAI's text-embedding-3-small model.

**Purpose**: Enables semantic search - finding similar entries by meaning, not just keywords.

**Example**:
- Text: "How to stay focused while learning?"
- Embedding: [0.023, -0.145, 0.089, ..., 0.234] (1536 numbers)

---

### Semantic Search
**Definition**: Search by meaning rather than exact keyword matching.

**In LifeBetter**: Uses vector similarity (cosine distance) to find related entries.

**Example**:
- Query: "stay focused"
- Finds: "avoid distractions", "pomodoro technique", "deep work" (even though they don't contain "focused")

**vs Keyword Search**: Traditional search only finds exact word matches.

---

### Vector Similarity
**Definition**: A measure of how close two vectors (embeddings) are in high-dimensional space.

**In LifeBetter**: Uses cosine similarity (0 = completely different, 1 = identical).

**Purpose**: Determines which entries are semantically related.

**Implementation**: PostgreSQL's pgvector extension with `<=>` operator.

---

### Problem
**Definition**: A long-term challenge or project you're working on.

**In LifeBetter**: Problems are tracked from start to finish with sessions, entries, todos, and blockers.

**Examples**:
- "Build web scraper for research papers"
- "Learn React and TypeScript"
- "Improve focus and productivity"

**Properties**: Title, description, status, category, time estimates, solution, lessons learned.

---

### Problem Session
**Definition**: A time-tracked work session on a specific problem.

**In LifeBetter**: Sessions capture what you did, how focused you were, and what you learned.

**Properties**: Start/end time, goal, accomplishments, focus level, energy level, interruptions, learnings.

**Purpose**: Track actual work patterns and improve time estimation.

---

### Blocker
**Definition**: An obstacle that prevents progress on a problem.

**In LifeBetter**: Blockers are logged with how they were resolved and what was learned.

**Categories**:
- `technical` - Technical issues (bugs, errors)
- `knowledge_gap` - Don't know how to do something
- `external_dependency` - Waiting on others
- `motivation` - Lack of motivation or clarity

**Purpose**: Learn from obstacles and avoid them in the future.

---

### Reflection
**Definition**: Structured thinking about your experiences, patterns, and learnings.

**In LifeBetter**: Guided reflection prompts based on your recent activity.

**Types**:
- `daily` - End-of-day reflection
- `weekly` - Weekly review
- `monthly` - Monthly review
- `problem_completion` - After solving a problem

**Purpose**: Extract insights, notice patterns, consolidate learning.

---

### Pattern
**Definition**: A recurring behavior, tendency, or situation detected by the system.

**In LifeBetter**: Automatically detected through clustering and analysis.

**Examples**:
- "You always underestimate coding tasks by 50%"
- "You procrastinate when tasks are vague"
- "You learn faster with small examples"
- "You ask similar questions about async/await"

**Purpose**: Make the invisible visible - notice what you don't naturally notice.

---

### Connection
**Definition**: A link between two entries showing their relationship.

**In LifeBetter**: Connections are created automatically (via similarity) or manually by users.

**Types**:
- `similar` - Semantically similar
- `contradiction` - Conflicting ideas
- `builds_on` - Extends previous idea
- `resolves` - Solves a problem
- `related` - General relationship

**Purpose**: Build a knowledge graph over time.

---

### Knowledge Graph
**Definition**: A network visualization of entries, problems, and meta-skills with their connections.

**In LifeBetter**: Interactive graph showing how your knowledge is interconnected.

**Nodes**: Entries, problems, meta-skills
**Edges**: Connections between them

**Purpose**: Explore your learning journey visually, discover unexpected connections.

---

### Spaced Repetition
**Definition**: A learning technique where review intervals increase over time based on how well you remember.

**In LifeBetter**: Used to review meta-skills at optimal intervals so you don't forget them.

**Algorithm**: SM-2 (SuperMemo 2)

**Purpose**: Ensure you remember and apply meta-skills when needed.

---

### Context-Aware
**Definition**: Adapting behavior based on current situation and history.

**In LifeBetter**: Reflection prompts, meta-skill suggestions, and search results are context-aware.

**Example**: Instead of generic "What did you learn?", system asks "You asked 5 questions about async/await. Do you understand it better now?"

---

## Technical Terms

### tRPC
**Definition**: TypeScript Remote Procedure Call - a framework for building type-safe APIs.

**In LifeBetter**: Primary API layer, provides end-to-end type safety.

**Benefit**: Client and server share types, no code generation needed.

---

### pgvector
**Definition**: PostgreSQL extension for vector similarity search.

**In LifeBetter**: Stores embeddings and performs similarity queries.

**Key Feature**: Hybrid queries (SQL + vector search in one database).

---

### MCP (Model Context Protocol)
**Definition**: A protocol for AI agents to access external tools and context.

**In LifeBetter**: MCP server provides LifeBetter tools to Claude and other AI agents.

**Purpose**: Automatic capture of AI conversations, context provision to AI.

---

### Drizzle ORM
**Definition**: TypeScript ORM (Object-Relational Mapping) for SQL databases.

**In LifeBetter**: Database access layer with type safety.

**Benefit**: Write TypeScript, get SQL; migrations as code.

---

### Monorepo
**Definition**: Single repository containing multiple related projects.

**In LifeBetter**: All apps (API, web, CLI, MCP, extensions) in one repo.

**Tool**: Turborepo for build orchestration.

---

### Embedding Model
**Definition**: AI model that converts text to vector representations.

**In LifeBetter**: OpenAI text-embedding-3-small (1536 dimensions).

**Alternative**: Local models (sentence-transformers) for self-hosting.

---

### Vector Index
**Definition**: Data structure for fast similarity search in high-dimensional space.

**In LifeBetter**: IVFFlat index (for <1M vectors) or HNSW (for larger datasets).

**Purpose**: Make vector search fast (milliseconds instead of seconds).

---

### Cosine Similarity
**Definition**: Measure of similarity between two vectors based on angle.

**Formula**: `similarity = 1 - (vector1 <=> vector2)` in pgvector

**Range**: 0 (completely different) to 1 (identical)

---

## Feature Terms

### Quick Capture
**Definition**: Fast, low-friction way to log entries.

**In LifeBetter**: CLI commands, keyboard shortcuts, floating buttons.

**Purpose**: Reduce friction so you actually capture things.

---

### Timeline View
**Definition**: Chronological display of all entries.

**In LifeBetter**: Main view for browsing your history.

**Features**: Filter by type, date, problem, tag; group by day/week/month.

---

### Semantic Suggestion
**Definition**: Recommendations based on meaning, not rules.

**In LifeBetter**: Meta-skill suggestions use semantic similarity to past problems.

**Example**: "Build web scraper" → suggests skills used in similar past projects.

---

### Automatic Linking
**Definition**: System-generated connections between related entries.

**In LifeBetter**: Background process that finds similar entries and creates links.

**User Action**: Can confirm or reject suggested links.

---

### Hybrid Search
**Definition**: Combining multiple search methods (vector + keyword + filters).

**In LifeBetter**: Semantic search + full-text search + metadata filters.

**Purpose**: Best of both worlds - meaning and precision.

---

## User Experience Terms

### Feedback Loop
**Definition**: A cycle where output influences future input.

**In LifeBetter**: The core loop - capture → reflect → improve → apply → notice → capture.

**Purpose**: Continuous improvement through iteration.

---

### Friction
**Definition**: Resistance or difficulty in performing an action.

**In LifeBetter**: We minimize friction in capture (quick commands, auto-capture).

**Goal**: Make it easier to capture than to skip.

---

### Context Window
**Definition**: The relevant information shown when making a decision.

**In LifeBetter**: When reflecting, system shows today's entries, patterns, related past entries.

**Purpose**: Make better decisions with full context.

---

### Progressive Disclosure
**Definition**: Showing information gradually as needed, not all at once.

**In LifeBetter**: Simple capture, detailed view on demand; basic features first, advanced later.

**Purpose**: Don't overwhelm users.

---

## Data Terms

### P0, P1, P2, P3 (Priority Levels)
**Definition**: Feature priority classification.

**In LifeBetter**:
- **P0**: MVP - Essential for core functionality
- **P1**: Important - Adds significant value
- **P2**: Nice to have - Enhances experience
- **P3**: Future - Post-launch improvements

---

### CRUD
**Definition**: Create, Read, Update, Delete - basic data operations.

**In LifeBetter**: All entities support CRUD via API.

---

### Soft Delete
**Definition**: Marking data as deleted without actually removing it.

**In LifeBetter**: Entries are archived, not deleted (can be restored).

**Purpose**: Prevent accidental data loss.

---

### Migration
**Definition**: Versioned database schema changes.

**In LifeBetter**: Drizzle migrations track all schema changes.

**Purpose**: Reproducible database setup, rollback capability.

---

## Workflow Terms

### Session
**Definition**: A focused work period on a specific problem.

**In LifeBetter**: Time-tracked with goal, accomplishments, and reflection.

---

### Streak
**Definition**: Consecutive days of performing an action.

**In LifeBetter**: Reflection streaks track daily reflection habit.

**Purpose**: Encourage consistency.

---

### Effectiveness
**Definition**: How well a meta-skill works for you.

**In LifeBetter**: Tracked as success rate (times successful / times applied).

**Purpose**: Learn which strategies work best for you personally.

---

## Integration Terms

### Bidirectional Sync
**Definition**: Two-way data synchronization between systems.

**In LifeBetter**: Obsidian plugin syncs both ways (LifeBetter ↔ Obsidian).

**Purpose**: Work in either tool, data stays in sync.

---

### Webhook
**Definition**: HTTP callback triggered by events.

**In LifeBetter**: Notify external systems when events occur (new entry, pattern detected).

**Purpose**: Integrate with other tools (Zapier, IFTTT, etc.).

---

### MCP Tool
**Definition**: A function exposed to AI agents via Model Context Protocol.

**In LifeBetter**: Tools like `lifebetter_log_question`, `lifebetter_get_relevant_meta_skills`.

**Purpose**: Let AI agents interact with LifeBetter.

---

## Acronyms

- **AI**: Artificial Intelligence
- **API**: Application Programming Interface
- **CLI**: Command Line Interface
- **CRUD**: Create, Read, Update, Delete
- **DB**: Database
- **DX**: Developer Experience
- **FAQ**: Frequently Asked Questions
- **GDPR**: General Data Protection Regulation
- **GUI**: Graphical User Interface
- **HTTP**: Hypertext Transfer Protocol
- **JSON**: JavaScript Object Notation
- **JWT**: JSON Web Token
- **MCP**: Model Context Protocol
- **MVP**: Minimum Viable Product
- **ORM**: Object-Relational Mapping
- **PKM**: Personal Knowledge Management
- **REST**: Representational State Transfer
- **SDK**: Software Development Kit
- **SQL**: Structured Query Language
- **TDD**: Test-Driven Development
- **UI**: User Interface
- **UX**: User Experience
- **UUID**: Universally Unique Identifier
- **YAML**: YAML Ain't Markup Language

---

## Common Phrases

### "Close the loop"
**Meaning**: Complete the feedback cycle from learning to application.

**In LifeBetter**: The system helps you close loops by reminding you to apply what you've learned.

---

### "Notice patterns"
**Meaning**: Become aware of recurring behaviors or situations.

**In LifeBetter**: The core value proposition - making invisible patterns visible.

---

### "Extract meta-skills"
**Meaning**: Identify reusable strategies from specific experiences.

**In LifeBetter**: The process of generalizing from "I solved this problem this way" to "This approach works for this type of problem".

---

### "Context-aware prompts"
**Meaning**: Questions personalized based on your recent activity.

**In LifeBetter**: Reflection prompts that reference what you actually did, not generic questions.

---

### "Semantic similarity"
**Meaning**: How similar two pieces of text are in meaning.

**In LifeBetter**: The basis for finding related entries, suggesting meta-skills, detecting patterns.

---

### "Self-hosted"
**Meaning**: Running software on your own infrastructure.

**In LifeBetter**: Option to run entirely on your own machine/server for privacy.

---

### "Type-safe"
**Meaning**: Compile-time checking of data types to prevent errors.

**In LifeBetter**: End-to-end TypeScript ensures API calls match expected types.

---

## Related Concepts (Not in LifeBetter, but relevant)

### Zettelkasten
**Definition**: Note-taking method focused on connecting ideas.

**Relation to LifeBetter**: Similar philosophy of linking knowledge, but LifeBetter focuses on meta-learning.

---

### Second Brain
**Definition**: External system for storing and organizing knowledge.

**Relation to LifeBetter**: LifeBetter is more focused on extracting insights than storing raw knowledge.

---

### Deliberate Practice
**Definition**: Focused practice with feedback to improve performance.

**Relation to LifeBetter**: LifeBetter provides the feedback loop for deliberate practice.

---

### Metacognition
**Definition**: Awareness and understanding of one's own thought processes.

**Relation to LifeBetter**: The psychological foundation of meta-learning.

---

## Usage Examples

### "I logged an entry"
**Meaning**: I captured a question, insight, or note in LifeBetter.

---

### "The system detected a pattern"
**Meaning**: LifeBetter's intelligence layer identified a recurring behavior.

---

### "I applied a meta-skill"
**Meaning**: I consciously used a problem-solving strategy I've learned.

---

### "I did my daily reflection"
**Meaning**: I completed the daily reflection prompts.

---

### "The semantic search found related entries"
**Meaning**: Vector similarity search returned entries with similar meaning.

---

### "I'm tracking this as a problem"
**Meaning**: I created a Problem entry to track a long-term challenge.

---

### "I hit a blocker"
**Meaning**: I encountered an obstacle that stopped my progress.

---

### "I started a session"
**Meaning**: I began a time-tracked work session on a problem.

---

## Questions?

If you encounter a term not defined here, please:
1. Check the main documentation
2. Open an issue to request definition
3. Submit a PR to add it

---

*This glossary is a living document. Terms will be added as the system evolves.*
