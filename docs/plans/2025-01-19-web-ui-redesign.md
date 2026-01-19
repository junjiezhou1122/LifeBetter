# Web UI Redesign - Better UX & Plan Agent

**Date**: 2025-01-19
**Status**: Draft
**Goal**: Improve web UI interactivity and add intelligent planning system

## Problems with Current Design

### 1. Adding Problems is Not Simple
- Current: Click button → Modal pops up → Fill form → Submit
- Problem: Too many steps, not quick enough
- User wants: Very simple, fast way to add problems

### 2. Modal UX is Poor
- Black overlay blocks everything
- Small modal in center feels disconnected
- Not interactive or beautiful
- Feels like interruption rather than flow

### 3. Missing Smart Planning
- No intelligent task prioritization
- No daily/weekly planning suggestions
- No notifications about what to work on

## Proposed Solutions

### Solution 1: Inline Quick Add for Problems

**Design A: Floating Quick Add Bar**
```
┌─────────────────────────────────────────────────────┐
│ 📊 Kanban Board                    [Quick Add: ___] │
│                                     [+ Add Problem]  │
└─────────────────────────────────────────────────────┘
```
- Always visible at top
- Type and press Enter to add
- Optional: Click to expand for priority selection

**Design B: First Column Quick Add**
```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ BACKLOG  │ TODO     │ IN PROG  │ BLOCKED  │ DONE     │
├──────────┼──────────┼──────────┼──────────┼──────────┤
│ [+ Add]  │          │          │          │          │
│ ________ │          │          │          │          │
│          │          │          │          │          │
│ [Card 1] │          │          │          │          │
│ [Card 2] │          │          │          │          │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```
- Quick add directly in Backlog column
- Inline, no modal needed

**Recommendation**: Design B - More natural, follows Kanban pattern

### Solution 2: Sidebar Panel System (Instead of Modals)

**Design: Right Sidebar Panel**
```
┌────────────────────────────────────┬──────────────────┐
│ Main Kanban Board                  │ [X] Close        │
│                                    │                  │
│ ┌──────┬──────┬──────┬──────┐     │ AI Breakdown     │
│ │BACK  │TODO  │PROG  │DONE  │     │ ──────────────── │
│ │      │      │      │      │     │                  │
│ │[Card]│      │      │      │     │ Problem:         │
│ │      │      │      │      │     │ "Build auth..."  │
│ └──────┴──────┴──────┴──────┘     │                  │
│                                    │ [Generate Tasks] │
│                                    │                  │
│                                    │ Suggested:       │
│                                    │ □ Task 1         │
│                                    │ □ Task 2         │
│                                    │ □ Task 3         │
│                                    │                  │
│                                    │ [Create All]     │
└────────────────────────────────────┴──────────────────┘
```

**Benefits**:
- No black overlay blocking view
- Can still see and interact with board
- Feels like part of the interface
- Smooth slide-in animation
- Can be resized or collapsed

### Solution 3: Smart Notifications & Plan Agent

**Design: Left Sidebar for Notifications**
```
┌──────────────────┬─────────────────────────────────────┐
│ 🎯 Today's Plan  │ Main Kanban Board                   │
│ ──────────────── │                                     │
│                  │ ┌──────┬──────┬──────┬──────┐      │
│ High Priority:   │ │BACK  │TODO  │PROG  │DONE  │      │
│ 🔴 Fix auth bug  │ │      │      │      │      │      │
│ 🟠 Deploy API    │ │      │      │      │      │      │
│                  │ └──────┴──────┴──────┴──────┘      │
│ Blocked:         │                                     │
│ ⚠️  2 tasks      │                                     │
│                  │                                     │
│ Blocking Others: │                                     │
│ ⚠️  1 task       │                                     │
│                  │                                     │
│ [Refresh Plan]   │                                     │
└──────────────────┴─────────────────────────────────────┘
```

**Plan Agent Features**:
- Analyzes all problems/tasks
- Calculates smart priorities based on:
  - Dependencies (blocking/blocked)
  - Due dates
  - Age (how long in backlog)
  - Estimated effort
  - Current status
- Generates daily plan: "What should I work on today?"
- Shows notifications:
  - High priority items
  - Blocked items
  - Items blocking others
  - Overdue items

## Implementation Plan

### Phase 1: Fix Environment & Quick Add
1. Fix API key configuration for AI breakdown
2. Implement inline quick add in Backlog column
3. Remove "Add Problem" button modal

### Phase 2: Sidebar Panel System
1. Create reusable Sidebar component
2. Replace all modals with sidebar panels:
   - AI Breakdown → Right sidebar
   - Add Task → Right sidebar
3. Add smooth animations

### Phase 3: Plan Agent & Notifications
1. Create `/api/plan` endpoint
2. Implement Plan Agent logic:
   - Priority calculation algorithm
   - Daily plan generation
   - Notification generation
3. Create left sidebar for notifications
4. Add "Refresh Plan" button
5. Auto-refresh on data changes

### Phase 4: Future - Calendar Integration
1. Add date/time fields to tasks
2. Create calendar view
3. Integrate with Google Calendar API
4. Drag tasks to calendar slots

## Technical Details

### Sidebar Component API
```typescript
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  side: 'left' | 'right';
  width?: string; // default: '400px'
  children: React.ReactNode;
}
```

### Plan Agent Algorithm
```typescript
interface PlanResult {
  todaysPlan: Task[];
  highPriority: Task[];
  blocked: Task[];
  blockingOthers: Task[];
  suggestions: string[];
}

function calculatePriority(task: Task): number {
  let score = 0;

  // Blocking others = highest priority
  if (task.blocking?.length > 0) score += 100;

  // Being blocked = lower priority
  if (task.blockedBy?.length > 0) score -= 50;

  // Age factor (older = higher priority)
  const ageInDays = daysSince(task.createdAt);
  if (ageInDays > 7) score += 30;
  if (ageInDays > 14) score += 50;

  // Status factor
  if (task.status === 'in_progress') score += 40;
  if (task.status === 'todo') score += 20;

  // Manual priority
  const priorityScores = { urgent: 80, high: 60, medium: 40, low: 20 };
  score += priorityScores[task.priority];

  return score;
}
```

## Questions for User

1. **Quick Add**: Do you prefer Design A (floating bar) or Design B (inline in column)?
2. **Sidebar Width**: Should sidebars be fixed width or resizable?
3. **Plan Agent**: Should it auto-refresh or manual refresh only?
4. **Notifications**: Should they be dismissible or always visible?

## Next Steps

1. Get user approval on design
2. Implement Phase 1 (Quick Add + Fix API)
3. Implement Phase 2 (Sidebar System)
4. Implement Phase 3 (Plan Agent)
5. Test and iterate
