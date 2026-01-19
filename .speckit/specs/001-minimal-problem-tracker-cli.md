# Specification: Minimal Problem Tracker CLI

**Version:** 1.0
**Date:** 2024-01-19
**Status:** Draft

---

## Overview

A minimal command-line tool that allows users to log problems they're working on and list them later. This is the foundation of the LifeBetter system, focusing on the core insight: **the main thing is solving problems, not just logging questions**.

## Problem Statement

Users need a fast, frictionless way to:
1. Log problems they're trying to solve
2. View their problem history
3. See what they're working on today

The tool must be so simple that it takes less than 5 seconds to log a problem, with zero setup friction.

## Goals

### Primary Goals
- Enable users to capture problems the moment they encounter them
- Provide a simple way to review past problems
- Store data locally in a human-readable format

### Non-Goals (for v1)
- No database setup required
- No semantic search or AI features
- No web interface
- No problem status tracking (open/closed)
- No time tracking or sessions

## User Stories

### Story 1: Log a Problem
**As a** developer
**I want to** quickly log a problem I'm trying to solve
**So that** I can track what I'm working on without breaking my flow

**Acceptance Criteria:**
- User runs: `lb p "How do I handle async errors in JavaScript?"`
- Problem is saved with timestamp
- User sees confirmation: "Problem logged"
- Takes less than 2 seconds to execute

### Story 2: List All Problems
**As a** user
**I want to** see all problems I've logged
**So that** I can review my problem-solving history

**Acceptance Criteria:**
- User runs: `lb list`
- Shows all problems with timestamps
- Most recent problems appear first
- Each entry is numbered for reference

### Story 3: View Today's Problems
**As a** user
**I want to** see what problems I worked on today
**So that** I can reflect on my daily progress

**Acceptance Criteria:**
- User runs: `lb today`
- Shows only problems logged today
- Displays count: "3 problems today"
- Shows timestamps in friendly format (e.g., "2 hours ago")

## Technical Requirements

### Functional Requirements

1. **Command: `lb p <problem>`**
   - Accepts problem text as argument
   - Supports multi-word problems (quoted or unquoted)
   - Stores: problem text, timestamp, unique ID
   - Returns: confirmation message

2. **Command: `lb list`**
   - Displays all problems in reverse chronological order
   - Format: `[ID] [timestamp] problem text`
   - Handles empty state gracefully

3. **Command: `lb today`**
   - Filters problems from current day (00:00 to now)
   - Same display format as `list`
   - Shows count summary

### Non-Functional Requirements

1. **Performance**
   - Command execution < 100ms for up to 1000 entries
   - Startup time < 50ms

2. **Storage**
   - Data stored in `~/.lifebetter/problems.json`
   - Human-readable JSON format
   - Automatic directory creation on first run

3. **Reliability**
   - Atomic writes (no data corruption)
   - Graceful error handling
   - Clear error messages

4. **Usability**
   - Zero configuration required
   - Works immediately after installation
   - Intuitive command names

## Data Model

```typescript
interface Problem {
  id: string;           // UUID v4
  text: string;         // Problem description
  createdAt: string;    // ISO 8601 timestamp
}

interface Storage {
  problems: Problem[];
}
```

### Storage Format Example

```json
{
  "problems": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "text": "How do I handle async errors in JavaScript?",
      "createdAt": "2024-01-19T10:30:00.000Z"
    },
    {
      "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "text": "Why is my React component re-rendering infinitely?",
      "createdAt": "2024-01-19T14:15:00.000Z"
    }
  ]
}
```

## User Interface

### Command Examples

```bash
# Log a problem
$ lb p "How do I handle async errors?"
✓ Problem logged

# Log with quotes (for special characters)
$ lb p "Why doesn't my API call work?"
✓ Problem logged

# List all problems
$ lb list
3 problems total

[3] 2 hours ago
    Why doesn't my API call work?

[2] 5 hours ago
    How do I handle async errors?

[1] Yesterday at 3:45 PM
    React component re-rendering infinitely

# View today's problems
$ lb today
2 problems today

[3] 2 hours ago
    Why doesn't my API call work?

[2] 5 hours ago
    How do I handle async errors?
```

### Error Handling

```bash
# No problem text provided
$ lb p
Error: Problem text is required
Usage: lb p <problem>

# Storage directory not writable
$ lb p "test"
Error: Cannot write to ~/.lifebetter/
Please check directory permissions
```

## Success Metrics

### Quantitative
- Installation to first use: < 2 minutes
- Time to log a problem: < 5 seconds
- Command execution time: < 100ms

### Qualitative
- User can explain the tool to someone else in one sentence
- User logs at least 3 problems in the first day
- User finds the tool "frictionless"

## Dependencies

### Runtime
- Node.js 18+ (for native fetch, better performance)
- No external runtime dependencies

### Development
- TypeScript 5+
- No CLI framework (keep it minimal)
- No database libraries

## Installation

```bash
# Global installation
npm install -g lifebetter

# Verify installation
lb --version

# First use (automatic setup)
lb p "My first problem"
```

## Future Considerations

Features explicitly deferred to later versions:

1. **Problem Status** - Mark problems as solved/unsolved
2. **Insights** - Log what you learned from solving problems
3. **Search** - Find problems by keyword or semantic meaning
4. **Tags** - Categorize problems
5. **Export** - Export to other formats
6. **Sync** - Cloud synchronization

## Open Questions

1. Should `lb p` support multi-line problems?
   - **Decision:** No, keep it simple. Use quotes for long text.

2. Should we show problem IDs in the list?
   - **Decision:** Yes, for future reference (e.g., adding insights to a problem)

3. What happens if storage file is corrupted?
   - **Decision:** Show error, create backup, start fresh

4. Should we support aliases (e.g., `lb problem` = `lb p`)?
   - **Decision:** Not in v1, keep it minimal

## Appendix

### Related Documents
- [LifeBetter Architecture](../../docs/ARCHITECTURE.md)
- [LifeBetter Data Model](../../docs/DATA_MODEL.md)

### References
- Spec-Driven Development: https://github.com/github/spec-kit
- LifeBetter Philosophy: Focus on problems, not just questions
