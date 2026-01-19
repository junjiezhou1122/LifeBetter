# Implementation Plan: Minimal Problem Tracker CLI

**Spec Reference:** [001-minimal-problem-tracker-cli.md](../specs/001-minimal-problem-tracker-cli.md)
**Date:** 2024-01-19
**Status:** Ready for Implementation

---

## Architecture Overview

```
lifebetter/
├── apps/
│   └── cli/
│       ├── src/
│       │   ├── index.ts           # CLI entry point & argument parsing
│       │   ├── commands/
│       │   │   ├── problem.ts     # 'lb p' command
│       │   │   ├── list.ts        # 'lb list' command
│       │   │   └── today.ts       # 'lb today' command
│       │   ├── storage.ts         # File I/O operations
│       │   └── types.ts           # TypeScript interfaces
│       ├── package.json
│       └── tsconfig.json
├── package.json                    # Root package.json (workspace)
└── tsconfig.json                   # Root tsconfig
```

## Implementation Steps

### Phase 1: Project Setup (15 minutes)

**Task 1.1: Initialize Project Structure**
- Create `apps/cli` directory
- Set up package.json with:
  - Name: `@lifebetter/cli`
  - Bin entry: `lb` → `dist/index.js`
  - Dependencies: none (use Node.js built-ins)
  - DevDependencies: `typescript`, `@types/node`
- Create tsconfig.json with:
  - Target: ES2022
  - Module: NodeNext
  - OutDir: dist
  - Strict mode enabled

**Task 1.2: Create Directory Structure**
```bash
mkdir -p apps/cli/src/commands
touch apps/cli/src/{index,storage,types}.ts
touch apps/cli/src/commands/{problem,list,today}.ts
```

### Phase 2: Core Storage Layer (20 minutes)

**Task 2.1: Define Types** (`src/types.ts`)
```typescript
export interface Problem {
  id: string;
  text: string;
  createdAt: string;
}

export interface Storage {
  problems: Problem[];
}
```

**Task 2.2: Implement Storage** (`src/storage.ts`)

Functions to implement:
1. `getStoragePath(): string`
   - Returns `~/.lifebetter/problems.json`
   - Uses `os.homedir()` for cross-platform support

2. `ensureStorageExists(): void`
   - Creates directory if it doesn't exist
   - Creates empty storage file if needed
   - Uses `fs.mkdirSync(recursive: true)`

3. `readStorage(): Storage`
   - Reads JSON file
   - Handles missing file (return empty storage)
   - Handles corrupted JSON (throw clear error)
   - Uses `fs.readFileSync` with UTF-8 encoding

4. `writeStorage(storage: Storage): void`
   - Writes JSON file atomically
   - Uses temp file + rename for atomicity
   - Pretty-prints JSON (2-space indent)
   - Uses `fs.writeFileSync` + `fs.renameSync`

5. `addProblem(text: string): Problem`
   - Generates UUID (use `crypto.randomUUID()`)
   - Creates Problem object with ISO timestamp
   - Reads storage, adds problem, writes back
   - Returns created problem

6. `getAllProblems(): Problem[]`
   - Reads storage
   - Returns problems in reverse chronological order
   - Returns empty array if no problems

7. `getTodayProblems(): Problem[]`
   - Gets all problems
   - Filters by today's date (00:00 to now)
   - Uses Date comparison

**Error Handling:**
- Wrap file operations in try-catch
- Provide clear error messages
- Exit with code 1 on errors

### Phase 3: Command Implementation (30 minutes)

**Task 3.1: Problem Command** (`src/commands/problem.ts`)
```typescript
export function problemCommand(text: string): void {
  // Validate input
  if (!text || text.trim().length === 0) {
    console.error('Error: Problem text is required');
    console.error('Usage: lb p <problem>');
    process.exit(1);
  }

  // Add problem
  try {
    addProblem(text.trim());
    console.log('✓ Problem logged');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}
```

**Task 3.2: List Command** (`src/commands/list.ts`)
```typescript
export function listCommand(): void {
  try {
    const problems = getAllProblems();

    if (problems.length === 0) {
      console.log('No problems logged yet');
      console.log('Try: lb p "Your first problem"');
      return;
    }

    console.log(`${problems.length} problem${problems.length === 1 ? '' : 's'} total\n`);

    problems.forEach((problem, index) => {
      const num = problems.length - index;
      const timeAgo = formatTimeAgo(problem.createdAt);
      console.log(`[${num}] ${timeAgo}`);
      console.log(`    ${problem.text}\n`);
    });
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}
```

**Task 3.3: Today Command** (`src/commands/today.ts`)
```typescript
export function todayCommand(): void {
  try {
    const problems = getTodayProblems();

    if (problems.length === 0) {
      console.log('No problems logged today');
      return;
    }

    console.log(`${problems.length} problem${problems.length === 1 ? '' : 's'} today\n`);

    problems.forEach((problem, index) => {
      const num = problems.length - index;
      const timeAgo = formatTimeAgo(problem.createdAt);
      console.log(`[${num}] ${timeAgo}`);
      console.log(`    ${problem.text}\n`);
    });
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}
```

**Task 3.4: Time Formatting Utility**
```typescript
function formatTimeAgo(isoDate: string): string {
  const now = new Date();
  const then = new Date(isoDate);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays === 1) return `Yesterday at ${then.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  return then.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
```

### Phase 4: CLI Entry Point (15 minutes)

**Task 4.1: Implement Main** (`src/index.ts`)
```typescript
#!/usr/bin/env node

import { problemCommand } from './commands/problem.js';
import { listCommand } from './commands/list.js';
import { todayCommand } from './commands/today.js';

const args = process.argv.slice(2);
const command = args[0];

// Ensure storage exists on every run
import { ensureStorageExists } from './storage.js';
ensureStorageExists();

switch (command) {
  case 'p':
  case 'problem':
    problemCommand(args.slice(1).join(' '));
    break;

  case 'list':
    listCommand();
    break;

  case 'today':
    todayCommand();
    break;

  case '--version':
  case '-v':
    console.log('lifebetter v1.0.0');
    break;

  case '--help':
  case '-h':
  case undefined:
    console.log('LifeBetter - Problem Tracker CLI\n');
    console.log('Usage:');
    console.log('  lb p <problem>    Log a problem');
    console.log('  lb list           List all problems');
    console.log('  lb today          Show today\'s problems');
    console.log('  lb --version      Show version');
    console.log('  lb --help         Show this help');
    break;

  default:
    console.error(`Unknown command: ${command}`);
    console.error('Run "lb --help" for usage');
    process.exit(1);
}
```

### Phase 5: Build & Package (10 minutes)

**Task 5.1: Configure Build**

`apps/cli/package.json`:
```json
{
  "name": "@lifebetter/cli",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "lb": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "prepublishOnly": "npm run build"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

`apps/cli/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Task 5.2: Build & Link**
```bash
cd apps/cli
npm install
npm run build
npm link  # Makes 'lb' available globally
```

### Phase 6: Testing (20 minutes)

**Task 6.1: Manual Testing Checklist**

Test Case 1: First Run
```bash
lb p "My first problem"
# Expected: ✓ Problem logged
# Verify: ~/.lifebetter/problems.json exists
```

Test Case 2: List Empty
```bash
rm -rf ~/.lifebetter
lb list
# Expected: "No problems logged yet"
```

Test Case 3: Log Multiple Problems
```bash
lb p "Problem 1"
lb p "Problem 2"
lb p "Problem 3"
lb list
# Expected: Shows 3 problems, newest first
```

Test Case 4: Today Filter
```bash
lb today
# Expected: Shows only today's problems
```

Test Case 5: Error Handling
```bash
lb p
# Expected: Error message + usage
lb unknown
# Expected: Unknown command error
```

Test Case 6: Multi-word Problems
```bash
lb p How do I handle async errors?
# Expected: ✓ Problem logged (entire text captured)
```

Test Case 7: Special Characters
```bash
lb p "Why doesn't this work?"
# Expected: ✓ Problem logged (apostrophe preserved)
```

**Task 6.2: Edge Cases**
- Empty problem text
- Very long problem text (1000+ chars)
- Unicode characters
- Corrupted JSON file
- No write permissions

## Technical Decisions

### Why No CLI Framework?
- **Decision:** Use plain Node.js argument parsing
- **Rationale:**
  - Only 3 simple commands
  - No complex options or flags
  - Reduces dependencies and bundle size
  - Faster startup time

### Why JSON Storage?
- **Decision:** Use JSON file instead of database
- **Rationale:**
  - Human-readable
  - Easy to backup/sync
  - No setup required
  - Sufficient for 1000s of entries
  - Can migrate to DB later if needed

### Why Node 18+?
- **Decision:** Require Node.js 18 or higher
- **Rationale:**
  - Native `crypto.randomUUID()` (no dependencies)
  - Native fetch (future-proofing)
  - Better performance
  - LTS version

### Why TypeScript?
- **Decision:** Write in TypeScript, compile to JavaScript
- **Rationale:**
  - Type safety prevents bugs
  - Better IDE support
  - Self-documenting code
  - Standard for modern Node.js projects

## Risk Mitigation

### Risk: Data Corruption
- **Mitigation:** Atomic writes using temp file + rename
- **Fallback:** Backup file before write operations

### Risk: Concurrent Writes
- **Mitigation:** Not addressed in v1 (rare for single-user CLI)
- **Future:** Add file locking if needed

### Risk: Large File Performance
- **Mitigation:** JSON parsing is fast for <10MB files
- **Future:** Migrate to database if >10k entries

### Risk: Cross-Platform Issues
- **Mitigation:** Use Node.js path utilities (`os.homedir()`, `path.join()`)
- **Testing:** Test on macOS, Linux, Windows

## Success Criteria

- [ ] User can install with `npm install -g`
- [ ] User can log a problem in <5 seconds
- [ ] Commands execute in <100ms
- [ ] Storage file is human-readable
- [ ] Error messages are clear and actionable
- [ ] Works on macOS, Linux, Windows

## Next Steps After Implementation

1. **User Testing:** Use the tool yourself for 1 week
2. **Gather Feedback:** What's missing? What's annoying?
3. **Iterate:** Add most-requested feature
4. **Document:** Write user guide with examples
5. **Publish:** Publish to npm registry

## Future Enhancements (Not in v1)

- Problem status (solved/unsolved)
- Add insights to problems
- Search functionality
- Export to markdown
- Sync across devices
- Web dashboard

---

**Ready to implement!** Follow the phases in order for a smooth build process.
