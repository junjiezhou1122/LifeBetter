# Specification: Delete & AI Analysis Features

**Version:** 1.1-1.5
**Date:** 2024-01-19
**Status:** Draft

---

## Overview

Extending the LifeBetter CLI with two major feature sets:
1. **Delete functionality** - Remove mistyped or incorrect problems
2. **AI-powered analysis** - Automatic problem analysis, reviews, and summaries

## Feature 1: Delete by Partial Text Match

### User Stories

**Story 1: Delete a Mistyped Problem**
**As a** user
**I want to** delete a problem I mistyped
**So that** my problem history stays clean and accurate

**Acceptance Criteria:**
- User runs: `lb delete "mistyped text"`
- System searches for matching problems (case-insensitive)
- If one match: Shows problem and asks y/n confirmation
- If multiple matches: Shows interactive list with arrow key navigation
- If no matches: Shows helpful error message
- Problem is permanently deleted after confirmation

### Technical Requirements

**Command:** `lb delete <search-text>`

**Behavior:**
- Search is case-insensitive and matches partial text
- Single match: Simple y/n confirmation
- Multiple matches: Arrow key selection (↑↓), Enter to confirm, Esc to cancel
- Atomic deletion (no data corruption)
- Clear confirmation message after deletion

**Dependencies:**
- Interactive prompt library (prompts or inquirer)

## Feature 2: AI-Powered Problem Analysis

### User Stories

**Story 2: Instant Analysis After Logging**
**As a** user
**I want to** get immediate AI insights when I log a problem
**So that** I can quickly see if it's related to past problems or get instant suggestions

**Acceptance Criteria:**
- After `lb p "problem"`, AI analyzes the problem
- Shows quick insight (< 2 seconds)
- Identifies related problems
- Suggests potential solutions
- Can be disabled with `--no-ai` flag
- Works offline (graceful degradation)

**Story 3: On-Demand Review**
**As a** user
**I want to** review my problems with AI analysis
**So that** I can identify patterns and get comprehensive suggestions

**Acceptance Criteria:**
- `lb review` analyzes today's problems
- `lb review --all` analyzes all problems
- `lb review --last N` analyzes last N problems
- `lb review --from DATE --to DATE` analyzes date range
- `lb review --topic "keyword"` analyzes specific topic
- Shows patterns, suggestions, and resources
- Caches results to avoid repeated API calls

**Story 4: Periodic Summaries**
**As a** user
**I want to** see daily/weekly summaries of my problems
**So that** I can track my learning progress and identify trends

**Acceptance Criteria:**
- `lb summary` or `lb summary daily` shows today's summary
- `lb summary weekly` shows this week's summary
- `lb summary monthly` shows this month's summary
- Shows overview, patterns, trends, and recommendations
- Includes meta-learning insights
- Suggests focus areas for improvement

**Story 5: Flexible AI Configuration**
**As a** user
**I want to** configure which AI provider and model to use
**So that** I can use my preferred AI service or local models

**Acceptance Criteria:**
- `lb config setup` runs interactive configuration wizard
- `lb config set ai-provider <provider>` sets provider
- `lb config set api-base-url <url>` sets custom endpoint
- `lb config set ai-model <model>` sets model
- `lb config show` displays current configuration
- Supports: OpenAI, Anthropic, Ollama, custom endpoints
- Secure API key storage

### Technical Requirements

#### Configuration System

**Storage:** `~/.lifebetter/config.json`

**Config Schema:**
```typescript
interface Config {
  aiProvider: 'openai' | 'anthropic' | 'ollama' | 'custom';
  apiKey?: string;
  apiBaseUrl?: string;
  aiModel: string;
  aiEnabled: boolean;
  instantAnalysis: boolean;
  cacheEnabled: boolean;
  maxTokensPerRequest?: number;
  rateLimitPerMinute?: number;
}
```

#### Data Model Updates

```typescript
interface Problem {
  id: string;
  text: string;
  createdAt: string;
  aiAnalysis?: AIAnalysis;
  tags?: string[];
}

interface AIAnalysis {
  summary: string;
  relatedProblems: string[];
  suggestedSolutions: string[];
  category: string;
  analyzedAt: string;
  cached: boolean;
}
```

#### AI Provider Abstraction

```typescript
interface AIProvider {
  analyze(problem: Problem, context: Problem[]): Promise<AIAnalysis>;
  review(problems: Problem[], options: ReviewOptions): Promise<ReviewResult>;
  summarize(problems: Problem[], period: 'daily' | 'weekly' | 'monthly'): Promise<Summary>;
}
```

**Supported Providers:**
1. OpenAI (GPT-4o, GPT-4o-mini, GPT-3.5-turbo)
2. Anthropic (Claude 3.5 Sonnet, Claude 3 Opus)
3. Ollama (Local models)
4. Custom (Any OpenAI-compatible API)

#### Cost Management

1. **Caching:** Store AI analysis with each problem
2. **Rate Limiting:** Max 10 API calls per minute (configurable)
3. **Token Optimization:** Use smaller models for instant analysis
4. **Offline Mode:** Graceful degradation when API unavailable

#### Commands

**Delete:**
- `lb delete <search-text>` - Delete by partial text match

**Config:**
- `lb config setup` - Interactive configuration wizard
- `lb config set <key> <value>` - Set configuration value
- `lb config show` - Display current configuration

**Review:**
- `lb review` - Review today's problems
- `lb review --all` - Review all problems
- `lb review --last N` - Review last N problems
- `lb review --from DATE --to DATE` - Review date range
- `lb review --topic "keyword"` - Review specific topic

**Summary:**
- `lb summary` or `lb summary daily` - Daily summary
- `lb summary weekly` - Weekly summary
- `lb summary monthly` - Monthly summary

**Modified:**
- `lb p <problem> --no-ai` - Log without AI analysis

## Implementation Phases

### Phase 1: Delete Functionality (v1.1)
- Interactive delete with arrow key selection
- Partial text search
- Confirmation prompts

### Phase 2: AI Configuration (v1.2)
- Config management system
- Multiple AI provider support
- Interactive setup wizard

### Phase 3: Instant Analysis (v1.3)
- Auto-analyze after logging
- Caching system
- Related problem detection

### Phase 4: Review Command (v1.4)
- Deep analysis with filters
- Pattern detection
- Resource suggestions

### Phase 5: Summaries (v1.5)
- Daily/weekly/monthly summaries
- Trend analysis
- Meta-learning insights

## Success Metrics

- Delete: < 5 seconds to find and delete a problem
- Instant analysis: < 2 seconds response time
- Review: Identifies meaningful patterns in 80%+ of cases
- Summaries: Provides actionable insights
- Configuration: < 2 minutes to set up AI provider

## Dependencies

**New:**
- `prompts` or `inquirer` - Interactive CLI prompts
- `openai` - OpenAI API client
- `@anthropic-ai/sdk` - Anthropic API client
- `axios` - HTTP client for custom providers

**Existing:**
- Node.js 18+
- TypeScript 5+

## Future Enhancements

- Problem status tracking (solved/unsolved)
- Insights feature (log what you learned)
- Export to markdown/PDF
- Web dashboard
- Team collaboration features
