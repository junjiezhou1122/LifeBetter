# Specification: Search Functionality

**Version:** 1.0
**Status:** Draft
**Created:** 2025-01-19
**Author:** LifeBetter Team

## Overview

Add search functionality to LifeBetter CLI to help users quickly find problems by text matching with highlighted results.

## User Stories

### US-1: Basic Text Search
**As a** user
**I want to** search my problems by keyword
**So that** I can quickly find specific problems I've logged

**Acceptance Criteria:**
- User can run `lb search <query>` to search problems
- Search is case-insensitive
- Search matches partial text in problem descriptions
- Results show matching problems in reverse chronological order
- Matching text is highlighted in orange (theme color)
- Shows count of results found
- Shows helpful message when no results found

### US-2: Short Alias
**As a** user
**I want to** use a short command alias
**So that** I can search faster

**Acceptance Criteria:**
- `lb s <query>` works as alias for `lb search <query>`
- Both commands have identical behavior

### US-3: Multi-word Search
**As a** user
**I want to** search with multiple words
**So that** I can find more specific problems

**Acceptance Criteria:**
- `lb search "react hooks"` searches for "react hooks" as a phrase
- `lb search react hooks` also works (joins words with spaces)
- Search handles special characters gracefully

## Technical Requirements

### Command Interface
```bash
lb search <query>
lb search "multi word query"
lb s <query>
```

### Display Format
```
🔍 Found 3 problems matching "react"

[15] 2 hours ago
    How to optimize React component rendering?

[12] Yesterday at 3:45 PM
    React hooks vs class components - which is better?

[8] Jan 15 at 10:30 AM
    Setting up React with TypeScript
```

### Implementation Details

**New Files:**
- `apps/cli/src/commands/search.ts` - Search command handler

**Modified Files:**
- `apps/cli/src/index.ts` - Add search command routing
- `apps/cli/src/ui.ts` - Add text highlighting utility

**Dependencies:**
- Use existing `searchProblems()` from `storage.ts`
- Use existing `formatTimeAgo()` from `storage.ts`
- Use chalk for text highlighting (already installed)

### Text Highlighting

**Function signature:**
```typescript
function highlightMatch(text: string, query: string): string
```

**Behavior:**
- Case-insensitive matching
- Preserve original case in display
- Highlight all occurrences of query in text
- Use orange color (#f97316) for highlights
- Handle edge cases (empty query, special regex characters)

### Error Handling

**No query provided:**
```
✗ Please provide a search query
Usage: lb search <query>
```

**No results found:**
```
⚠ No problems found matching "xyz"
Try: lb list - to see all problems
```

**Empty problem list:**
```
ℹ No problems logged yet
Try: lb p "Your first problem"
```

## Testing Scenarios

### Test 1: Basic Search
```bash
lb p "How to learn React"
lb p "React hooks tutorial"
lb p "Python basics"
lb search "react"
# Expected: Shows 2 results with "react" highlighted
```

### Test 2: Case Insensitive
```bash
lb search "REACT"
lb search "React"
lb search "react"
# Expected: All return same results
```

### Test 3: Multi-word Search
```bash
lb search "react hooks"
# Expected: Shows problems containing "react hooks"
```

### Test 4: No Results
```bash
lb search "nonexistent"
# Expected: Shows warning message
```

### Test 5: Short Alias
```bash
lb s "react"
# Expected: Same as lb search "react"
```

### Test 6: Special Characters
```bash
lb p "What is C++?"
lb search "C++"
# Expected: Finds the problem, handles + correctly
```

## Success Metrics

- Search returns results in < 100ms for typical problem lists
- Highlighting is visually clear and consistent with theme
- No crashes on edge cases (empty query, special chars)
- Users can easily scan results to find what they need

## Future Enhancements (Out of Scope)

- Filter by category: `lb search "react" --category Frontend`
- Filter by date: `lb search "react" --from 2024-01-01`
- Search in AI analysis summaries
- Fuzzy matching for typos
- Search history
- Regular expression support

## Dependencies

- Existing: chalk, storage.ts functions
- No new npm packages required

## Risks & Mitigations

**Risk:** Special regex characters in query break search
**Mitigation:** Escape special characters before matching

**Risk:** Very long problem lists slow down search
**Mitigation:** Current implementation is O(n) which is fine for CLI use case

## Timeline

- Spec review: 10 minutes
- Implementation: 30 minutes
- Testing: 15 minutes
- Total: ~1 hour
