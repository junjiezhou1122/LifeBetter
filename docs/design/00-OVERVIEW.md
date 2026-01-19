# LifeBetter - Comprehensive System Design

## Vision

LifeBetter is a meta-learning system that creates continuous feedback loops for personal improvement by capturing experiences, extracting insights, and helping you apply learned meta-skills to future challenges.

## Core Problem

People struggle with:
- No self-feedback loops for improvement
- Reading insights but not applying them
- Making same mistakes repeatedly without noticing patterns
- Asking questions but not tracking what they learn
- Learning techniques but forgetting to use them when needed
- Unable to extract meta-skills from experiences
- AI conversations scattered across platforms with no learning retention

## Core Solution

Create a continuous feedback loop:

```
NOTICING → CAPTURING → REFLECTING → IMPROVING → REMEMBERING → APPLYING
    ↑                                                              ↓
    └──────────────────── feedback loop ─────────────────────────┘
```

## Key Principles

1. **Notice First** - You can't improve what you don't notice
2. **Meta-skills are Active Tools** - Not just tracked, but actively suggested when solving new problems
3. **Extensible System** - Design for discovering new problem types and modules over time
4. **Integration-Friendly** - Works with existing tools (Obsidian, Notion, AI platforms) via MCP, plugins, APIs
5. **Start Simple, Design Complete** - Build incrementally but with full architecture in mind
6. **Semantic Understanding** - Use vector embeddings for intelligent pattern matching and retrieval

## System Components

### 1. Capture Layer
Multiple entry points for logging experiences:
- CLI tool for quick capture
- Web application for detailed entry
- MCP server for AI conversation capture
- Browser extension for insights from reading
- Obsidian/Notion plugins for integration
- Mobile app (future)

### 2. Storage Layer
Hybrid database approach:
- **PostgreSQL + pgvector** for structured data and semantic search
- Structured tables for entries, problems, meta-skills, reflections
- Vector embeddings for semantic similarity and pattern detection

### 3. Processing Layer
Intelligence that transforms raw data into insights:
- Embedding generation (OpenAI/local models)
- Metadata extraction
- Entity detection (problems, meta-skills, patterns)
- Automatic linking of related concepts

### 4. Intelligence Layer
Advanced features that create value:
- Semantic search across all entries
- Pattern detection through clustering
- Meta-skill suggestion based on context
- Automatic reflection prompt generation
- Similar problem retrieval
- Spaced repetition for meta-skills

### 5. Interface Layer
Multiple ways to interact with the system:
- Web dashboard for review and analysis
- CLI for quick access
- REST API for integrations
- MCP tools for AI context provision
- GraphQL API (optional)

## Core Data Models

### Entry
The fundamental unit of capture - any question, insight, or reflection

### Problem Project
Long-term problems being solved, with attempts, blockers, and solutions

### Meta-Skill
Reusable problem-solving techniques learned from experience

### Reflection
Structured thinking about what worked, what didn't, and what was learned

### Pattern
Automatically detected behavioral or thinking patterns

### Connection
Links between related entries, meta-skills, and problems

## Implementation Philosophy

**Build for the complete vision, implement in phases**

- Phase 1: Foundation (core capture, storage, basic search)
- Phase 2: Intelligence (semantic search, pattern detection, suggestions)
- Phase 3: Integration (MCP, browser extension, plugins)
- Phase 4: Advanced (graph visualization, spaced repetition, analytics)
- Phase 5+: Extensibility (custom modules, community meta-skills, mobile)

## Success Metrics

The system succeeds when users:
1. Actually use it daily (low friction capture)
2. Notice patterns they wouldn't have seen otherwise
3. Apply meta-skills to new problems effectively
4. Make fewer repeated mistakes
5. Retain and apply insights from AI conversations
6. Feel they're improving at problem-solving over time

## Next Steps

See detailed documentation:
- [Data Models](./01-DATA-MODELS.md)
- [System Architecture](./02-ARCHITECTURE.md)
- [API Design](./03-API-DESIGN.md)
- [Implementation Phases](./04-IMPLEMENTATION-PHASES.md)
- [Integration Strategy](./05-INTEGRATION.md)
- [AI & Vector Search](./06-AI-VECTOR-SEARCH.md)
