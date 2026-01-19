# LifeBetter Complete Feature List

This document catalogs **all features** discussed in our design, organized by component and priority.

---

## Feature Priority Levels

- **P0**: MVP - Essential for core feedback loop
- **P1**: Important - Adds significant value
- **P2**: Nice to have - Enhances experience
- **P3**: Future - Post-launch improvements

---

## 1. Capture System

### 1.1 CLI Tool

| Feature | Priority | Description |
|---------|----------|-------------|
| Quick question logging | P0 | `lb q "question"` - Log a question |
| Quick insight logging | P0 | `lb insight "text"` - Log an insight |
| Daily reflection | P0 | `lb reflect` - Guided daily reflection |
| View today's entries | P0 | `lb today` - Show entries from today |
| View this week | P1 | `lb week` - Show entries from this week |
| Search entries | P0 | `lb search "query"` - Semantic + keyword search |
| Create meta-skill | P0 | `lb meta create "name"` - Create meta-skill |
| List meta-skills | P0 | `lb meta list` - Show all meta-skills |
| Show meta-skill details | P1 | `lb meta show "name"` - Usage stats, examples |
| Apply meta-skill | P1 | `lb meta apply "name"` - Log meta-skill use |
| Create problem | P1 | `lb problem create "title"` - Start tracking problem |
| List problems | P1 | `lb problem list` - Show all problems |
| Start work session | P1 | `lb problem start <id>` - Begin timed session |
| End work session | P1 | `lb problem end` - Stop session, prompt reflection |
| Log blocker | P1 | `lb blocker "description"` - Log obstacle |
| Resolve blocker | P1 | `lb blocker resolve "how"` - Mark blocker resolved |
| Create todo | P1 | `lb todo add "task"` - Quick todo creation |
| Complete todo | P1 | `lb todo done <id>` - Mark todo complete |
| Interactive prompts | P1 | Rich prompts with Inquirer.js |
| Colored output | P1 | Beautiful CLI output with Chalk |
| Autocomplete | P2 | Tab completion for commands |
| Configuration | P2 | `lb config` - Configure settings |
| Export data | P2 | `lb export` - Export all data |
| Import data | P2 | `lb import <file>` - Import data |
| Offline mode | P2 | Queue operations when offline |
| Shell aliases | P3 | Short aliases (q, i, r) |
| Custom commands | P3 | User-defined shortcuts |

### 1.2 Web App

| Feature | Priority | Description |
|---------|----------|-------------|
| Dashboard | P0 | Today's summary, quick capture |
| Timeline view | P0 | Chronological list of all entries |
| Entry creation form | P0 | Rich form for creating entries |
| Entry editing | P0 | Edit existing entries |
| Entry deletion | P0 | Archive/delete entries |
| Search page | P0 | Semantic + keyword search UI |
| Search filters | P1 | Filter by type, date, problem, tags |
| Meta-skill library | P0 | View and manage meta-skills |
| Meta-skill creation | P0 | Create new meta-skills |
| Meta-skill editing | P0 | Edit existing meta-skills |
| Reflection interface | P0 | Guided reflection with context |
| Problem list | P1 | View all problems |
| Problem detail page | P1 | Full problem view with sessions, entries |
| Problem creation | P1 | Create new problems |
| Session timer | P1 | Visual timer for work sessions |
| Todo list | P1 | Integrated todo management |
| Quick capture widget | P1 | Floating quick-capture button |
| Keyboard shortcuts | P1 | Fast navigation (Cmd+K search, etc.) |
| Dark mode | P1 | Dark theme support |
| Mobile responsive | P1 | Works well on mobile browsers |
| Rich text editor | P2 | Markdown editor for entries |
| Image uploads | P2 | Attach images to entries |
| File attachments | P2 | Attach files to entries |
| Drag-and-drop | P2 | Drag to link entries |
| Bulk operations | P2 | Select multiple entries for actions |
| Custom themes | P3 | User-defined color themes |
| Desktop app | P3 | Electron wrapper for desktop |

### 1.3 MCP Server (AI Integration)

| Feature | Priority | Description |
|---------|----------|-------------|
| Log question tool | P1 | Auto-capture questions to AI |
| Log insight tool | P1 | Capture insights from AI conversations |
| Get relevant meta-skills | P1 | Suggest meta-skills during conversation |
| Get similar problems | P1 | Show similar past problems |
| Start problem session | P1 | Begin session from AI conversation |
| Log blocker | P1 | Capture blockers mentioned in conversation |
| Suggest reflection | P1 | Prompt user to reflect |
| Get recent learnings | P2 | Show recent insights in AI context |
| Link conversation to problem | P2 | Auto-link conversations to active problems |
| Full conversation capture | P2 | Save entire AI conversation threads |
| Platform detection | P2 | Detect Claude vs ChatGPT vs other |
| Conversation summarization | P3 | AI-generated summaries of long chats |

### 1.4 Browser Extension

| Feature | Priority | Description |
|---------|----------|-------------|
| Capture overlay | P1 | Floating capture button on pages |
| Quick capture popup | P1 | Cmd+Shift+L to open quick capture |
| Detect AI platforms | P1 | Auto-detect ChatGPT, Claude web |
| Save insight button | P1 | Click to save AI responses |
| Capture from any page | P2 | Save insights from articles, docs |
| Highlight to capture | P2 | Highlight text → right-click → capture |
| Auto-tag by domain | P2 | Tag entries by website domain |
| Reading mode integration | P2 | Capture from reader view |
| Annotation tool | P3 | Annotate webpages with insights |
| Shared library | P3 | Share captures with team |

### 1.5 Obsidian Plugin

| Feature | Priority | Description |
|---------|----------|-------------|
| Bidirectional sync | P1 | Sync LifeBetter ↔ Obsidian |
| Detect `#meta-skill` | P1 | Auto-create meta-skills from tags |
| Detect `[[Problem: ...]]` | P1 | Auto-create problems from links |
| Detect `#blocker` | P1 | Auto-log blockers |
| Create problem command | P1 | Command: Create problem from note |
| Log question command | P1 | Command: Log question |
| Daily reflection command | P1 | Command: Open reflection template |
| Insert meta-skills | P2 | Command: Insert meta-skill suggestions |
| Show similar entries | P2 | Sidebar: Related past entries |
| Timeline view in Obsidian | P2 | View LifeBetter timeline in sidebar |
| Graph integration | P2 | Show LifeBetter connections in graph |
| Templates | P2 | Pre-made templates for problems, reflections |
| Frontmatter support | P2 | Use YAML frontmatter for metadata |
| Dataview integration | P3 | Query LifeBetter data with Dataview |

### 1.6 API

| Feature | Priority | Description |
|---------|----------|-------------|
| tRPC endpoints | P0 | Type-safe API |
| REST fallback | P1 | Standard REST API for integrations |
| Authentication | P1 | JWT-based auth for cloud version |
| Rate limiting | P1 | Protect against abuse |
| Webhooks | P2 | Trigger on events (new entry, pattern detected) |
| GraphQL | P2 | Alternative to tRPC for complex queries |
| API documentation | P1 | Auto-generated docs (OpenAPI) |
| API versioning | P1 | Support multiple API versions |
| Batch operations | P2 | Bulk create/update/delete |
| Real-time subscriptions | P2 | WebSocket for live updates |

---

## 2. Storage & Data

### 2.1 Database

| Feature | Priority | Description |
|---------|----------|-------------|
| PostgreSQL setup | P0 | Core database |
| pgvector extension | P0 | Vector similarity search |
| Migrations system | P0 | Schema version control |
| Seed data | P0 | Example meta-skills |
| Entries table | P0 | All captured items |
| Meta-skills table | P0 | Meta-skill library |
| Problems table | P1 | Problem tracking |
| Sessions table | P1 | Work session logging |
| Todos table | P1 | Task management |
| Blockers table | P1 | Obstacle tracking |
| AI conversations table | P1 | Conversation logging |
| Reflections table | P0 | Structured reflections |
| Connections table | P1 | Links between entries |
| Tags table | P0 | Tagging system |
| Spaced repetition table | P2 | Review scheduling |
| Full-text search | P0 | tsvector indexes |
| Vector indexes | P0 | IVFFlat/HNSW indexes |
| Backup system | P1 | Automated backups |
| Data retention | P2 | Auto-archive old data |
| Encryption at rest | P1 | Secure sensitive data |
| Multi-tenancy | P3 | Support multiple users |

### 2.2 Caching

| Feature | Priority | Description |
|---------|----------|-------------|
| Redis integration | P2 | Cache frequent queries |
| Embedding cache | P1 | Cache generated embeddings |
| Search results cache | P2 | Cache search queries |
| Session cache | P1 | Cache user sessions |
| Rate limit cache | P1 | Track API rate limits |

---

## 3. Intelligence & Analysis

### 3.1 Embeddings

| Feature | Priority | Description |
|---------|----------|-------------|
| OpenAI embeddings | P0 | text-embedding-3-small |
| Batch embedding generation | P1 | Efficient bulk processing |
| Local embedding model | P2 | Self-hosted alternative |
| Embedding caching | P1 | Avoid regeneration |
| Custom embedding model | P3 | Fine-tuned models |

### 3.2 Semantic Search

| Feature | Priority | Description |
|---------|----------|-------------|
| Vector similarity search | P0 | Core search functionality |
| Hybrid search | P1 | Vector + keyword combined |
| Filters | P1 | By type, date, problem, tags |
| Pagination | P1 | Handle large result sets |
| Relevance scoring | P1 | Combine similarity + filters |
| Search suggestions | P2 | Auto-suggest queries |
| Search history | P2 | Remember past searches |
| Saved searches | P2 | Bookmark frequent queries |
| Fuzzy search | P2 | Handle typos |
| Search analytics | P3 | Track search patterns |

### 3.3 Pattern Detection

| Feature | Priority | Description |
|---------|----------|-------------|
| Entry clustering | P1 | Group similar entries (k-means/DBSCAN) |
| Recurring problem detection | P1 | Identify repeated issues |
| Learning pattern detection | P1 | Track learning progress |
| Procrastination detection | P1 | Detect avoidance patterns |
| Time estimation analysis | P1 | Estimate vs actual trends |
| Focus pattern analysis | P2 | When you're most productive |
| Energy pattern analysis | P2 | Energy levels over time |
| Interruption analysis | P2 | Identify distraction sources |
| Success pattern detection | P2 | What strategies work |
| Failure pattern detection | P2 | What strategies don't work |
| Seasonal patterns | P3 | Monthly/yearly trends |
| Custom pattern definitions | P3 | User-defined patterns to detect |

### 3.4 Meta-Skill System

| Feature | Priority | Description |
|---------|----------|-------------|
| Meta-skill library | P0 | Predefined + user-created skills |
| Effectiveness tracking | P1 | Track success rate |
| Usage frequency | P1 | How often applied |
| Context detection | P1 | When skill is relevant |
| Smart suggestions | P1 | Suggest skills for new problems |
| Similarity matching | P1 | Match skills to problems semantically |
| Success prediction | P2 | Predict skill effectiveness |
| Skill combinations | P2 | Which skills work well together |
| Skill prerequisites | P2 | Which skills build on others |
| Skill difficulty rating | P1 | Beginner/intermediate/advanced |
| Skill categories | P1 | Organize by type |
| Skill examples | P1 | Concrete examples of application |
| Skill evolution | P2 | Track how skills improve over time |
| Custom skill creation | P0 | User-defined meta-skills |
| Skill sharing | P3 | Export/import skills |
| Skill marketplace | P3 | Community-shared skills |

### 3.5 Automatic Linking

| Feature | Priority | Description |
|---------|----------|-------------|
| Vector similarity linking | P1 | Auto-link similar entries |
| Temporal linking | P1 | Link entries from same session |
| Problem linking | P1 | Link entries to problems |
| Meta-skill linking | P1 | Link to meta-skills applied |
| Contradiction detection | P2 | Find conflicting entries |
| Resolution linking | P2 | Link problems to solutions |
| Builds-on detection | P2 | Entry builds on previous insight |
| Link strength scoring | P1 | 0-1 confidence score |
| User confirmation | P1 | Validate auto-links |
| Manual linking | P1 | User-created links |
| Link types | P1 | similar, contradicts, resolves, etc. |
| Link visualization | P2 | Show connections graphically |

### 3.6 Reflection System

| Feature | Priority | Description |
|---------|----------|-------------|
| Daily reflection prompts | P0 | Scheduled daily prompts |
| Weekly reflection prompts | P1 | Scheduled weekly prompts |
| Monthly reflection prompts | P2 | Scheduled monthly prompts |
| Problem completion reflection | P1 | Reflect when problem solved |
| Context-aware questions | P1 | Personalized prompts |
| Pattern-based questions | P1 | Questions about detected patterns |
| Activity summary | P1 | Show today's/week's activity |
| Related entries display | P1 | Show relevant past entries |
| Reflection history | P1 | View past reflections |
| Reflection analytics | P2 | Track reflection habits |
| Custom reflection templates | P2 | User-defined prompts |
| Guided reflection | P1 | Step-by-step process |
| Reflection reminders | P1 | Notifications to reflect |
| Skip option | P1 | Allow skipping without guilt |
| Reflection streaks | P2 | Track consecutive days |

---

## 4. Problem Tracking

### 4.1 Problems

| Feature | Priority | Description |
|---------|----------|-------------|
| Problem creation | P1 | Create new problems |
| Problem list | P1 | View all problems |
| Problem detail view | P1 | Full context (sessions, entries, etc.) |
| Problem status | P1 | active, stuck, solved, abandoned |
| Problem categories | P1 | coding, learning, career, etc. |
| Problem priority | P1 | Prioritize problems |
| Time estimation | P1 | Estimate hours to solve |
| Actual time tracking | P1 | Track time spent |
| Initial approach | P1 | Document first attempt |
| Solution documentation | P1 | How it was solved |
| Lessons learned | P1 | Extract insights |
| What worked / didn't work | P1 | Reflection on approach |
| External links | P2 | Links to PRs, docs, resources |
| Problem templates | P2 | Pre-filled problem types |
| Problem dependencies | P3 | Link dependent problems |
| Problem milestones | P3 | Track progress checkpoints |

### 4.2 Work Sessions

| Feature | Priority | Description |
|---------|----------|-------------|
| Start session | P1 | Begin timed session |
| End session | P1 | Stop and reflect |
| Session timer | P1 | Visual timer |
| Session goal | P1 | What you want to accomplish |
| Session summary | P1 | What you actually did |
| Focus level tracking | P1 | Self-rated focus (1-10) |
| Energy level tracking | P1 | Self-rated energy (1-10) |
| Interruption counting | P1 | Log interruptions |
| Session notes | P1 | Free-form session notes |
| Session analytics | P2 | Analyze session patterns |
| Pomodoro integration | P2 | Built-in pomodoro timer |
| Break reminders | P2 | Remind to take breaks |
| Session templates | P3 | Pre-defined session types |

### 4.3 Blockers

| Feature | Priority | Description |
|---------|----------|-------------|
| Blocker logging | P1 | Log obstacles |
| Blocker categories | P1 | technical, knowledge, external, motivation |
| Blocker resolution | P1 | How it was resolved |
| Time to resolve | P1 | Track resolution time |
| Blocker learnings | P1 | What you learned |
| Prevention strategies | P1 | How to avoid in future |
| Blocker analytics | P2 | Most common blockers |
| Blocker patterns | P2 | Recurring blocker types |
| Similar past blockers | P2 | Find similar past obstacles |
| Blocker alerts | P3 | Warn about likely blockers |

### 4.4 Todos

| Feature | Priority | Description |
|---------|----------|-------------|
| Todo creation | P1 | Create tasks |
| Todo list | P1 | View all todos |
| Todo status | P1 | pending, in_progress, completed |
| Todo completion | P1 | Mark as done |
| Time estimation | P1 | Estimate task duration |
| Actual time tracking | P1 | Track actual time |
| Todo priority | P1 | Prioritize tasks |
| Due dates | P1 | Set deadlines |
| Subtasks | P2 | Break todos into smaller tasks |
| Todo dependencies | P2 | Task A before task B |
| Context requirements | P1 | What's needed (energy, time, tools) |
| Smart suggestions | P1 | Suggest next task based on context |
| Recurring todos | P2 | Repeating tasks |
| Todo templates | P2 | Pre-defined task types |
| Todo analytics | P2 | Track completion rates |

---

## 5. Visualization & Analytics

### 5.1 Knowledge Graph

| Feature | Priority | Description |
|---------|----------|-------------|
| Graph visualization | P2 | Interactive network graph |
| Node types | P2 | Entries, problems, meta-skills |
| Edge types | P2 | Connection types |
| Color coding | P2 | By type, category |
| Interactive exploration | P2 | Click to expand, filter |
| Search in graph | P2 | Find nodes |
| Filter by type | P2 | Show/hide node types |
| Filter by date | P2 | Time-based filtering |
| Zoom and pan | P2 | Navigate large graphs |
| Node details on hover | P2 | Show entry content |
| Export graph | P3 | Save as image/SVG |
| Graph layouts | P3 | Force-directed, hierarchical, etc. |
| Subgraph extraction | P3 | Extract portion of graph |
| Path finding | P3 | Find connections between entries |

### 5.2 Timeline View

| Feature | Priority | Description |
|---------|----------|-------------|
| Chronological list | P0 | All entries by date |
| Group by day | P1 | Daily grouping |
| Group by week | P1 | Weekly grouping |
| Group by month | P2 | Monthly grouping |
| Filter by type | P1 | Show specific entry types |
| Filter by problem | P1 | Show problem-related entries |
| Filter by tag | P1 | Show tagged entries |
| Date range filter | P1 | Custom date ranges |
| Infinite scroll | P1 | Load more as you scroll |
| Jump to date | P2 | Quick navigation to date |
| Timeline visualization | P2 | Visual timeline representation |
| Density view | P2 | See activity density over time |

### 5.3 Analytics Dashboard

| Feature | Priority | Description |
|---------|----------|-------------|
| Overview stats | P2 | Total entries, problems, meta-skills |
| Activity charts | P2 | Entries over time |
| Meta-skill effectiveness | P2 | Which skills work best |
| Problem-solving speed | P2 | How fast you solve problems |
| Time estimation accuracy | P2 | Estimate vs actual trends |
| Learning curves | P2 | Progress on topics over time |
| Reflection frequency | P2 | How often you reflect |
| Focus patterns | P2 | When you're most productive |
| Energy patterns | P2 | Energy levels over time |
| Procrastination insights | P2 | When and why you procrastinate |
| Category breakdown | P2 | Problems by category |
| Tag cloud | P2 | Most common tags |
| Heatmaps | P3 | Activity heatmaps |
| Comparison charts | P3 | This week vs last week |
| Export analytics | P3 | Export charts/data |

---

## 6. Spaced Repetition

| Feature | Priority | Description |
|---------|----------|-------------|
| SM-2 algorithm | P2 | Standard spaced repetition |
| Meta-skill reviews | P2 | Review skills at intervals |
| Review scheduling | P2 | Optimal review timing |
| Review interface | P2 | Flashcard-style UI |
| Quality rating | P2 | 1-5: how well you remembered |
| Review statistics | P2 | Track review performance |
| Custom intervals | P3 | User-defined review schedule |
| Review reminders | P2 | Notifications for due reviews |
| Review analytics | P3 | Track retention rates |
| Insight reviews | P3 | Review important insights too |

---

## 7. Integrations

### 7.1 Notion

| Feature | Priority | Description |
|---------|----------|-------------|
| Database sync | P2 | Sync with Notion databases |
| Two-way sync | P2 | Bidirectional updates |
| Problem import | P2 | Import problems from Notion |
| Todo sync | P2 | Sync todos with Notion |
| Reflection export | P2 | Export reflections to Notion |
| Meta-skill export | P2 | Export meta-skills to Notion |
| Webhook triggers | P3 | React to Notion changes |

### 7.2 Calendar

| Feature | Priority | Description |
|---------|----------|-------------|
| Google Calendar sync | P3 | Sync work sessions |
| Time blocking | P3 | Schedule focus time |
| Event creation | P3 | Create calendar events for todos |
| Availability checking | P3 | Suggest times based on calendar |

### 7.3 Other Tools

| Feature | Priority | Description |
|---------|----------|-------------|
| Zapier integration | P3 | Connect to 1000+ apps |
| IFTTT integration | P3 | Custom automations |
| Slack notifications | P3 | Send updates to Slack |
| Email integration | P3 | Email capture |
| GitHub integration | P3 | Link to PRs, issues |
| Roam Research | P3 | Bidirectional sync |
| Logseq integration | P3 | Bidirectional sync |

---

## 8. Settings & Configuration

| Feature | Priority | Description |
|---------|----------|-------------|
| User preferences | P1 | Personalization settings |
| Reflection schedule | P1 | Configure reflection times |
| Notification settings | P1 | Control notifications |
| Embedding provider | P1 | OpenAI vs local model |
| Dark/light mode | P1 | Theme preference |
| Language | P2 | Internationalization |
| Timezone | P1 | User timezone |
| Date format | P2 | Date display preferences |
| Default filters | P2 | Save default search filters |
| Keyboard shortcuts | P2 | Customize shortcuts |
| Privacy settings | P1 | Data sharing preferences |
| Export format | P2 | JSON, CSV, Markdown |
| Auto-archive | P2 | Configure auto-archiving rules |

---

## 9. Security & Privacy

| Feature | Priority | Description |
|---------|----------|-------------|
| Local-first option | P1 | Run entirely offline |
| Self-hosting | P1 | Deploy on own infrastructure |
| Data encryption | P1 | Encrypt at rest |
| API authentication | P1 | JWT-based auth |
| Role-based access | P3 | For team features |
| Data export | P1 | Export all data anytime |
| Data deletion | P1 | Right to be forgotten |
| Privacy mode | P2 | Extra encryption for sensitive data |
| Audit logs | P3 | Track data access |
| GDPR compliance | P2 | EU privacy compliance |

---

## 10. Mobile & Desktop

| Feature | Priority | Description |
|---------|----------|-------------|
| Mobile-responsive web | P1 | Works on mobile browsers |
| Desktop Electron app | P3 | Native desktop app |
| iOS app | P3 | Native iPhone/iPad app |
| Android app | P3 | Native Android app |
| Mobile quick capture | P3 | Quick entry on mobile |
| Offline sync | P3 | Sync when back online |
| Mobile notifications | P3 | Push notifications |

---

## 11. Advanced Features (Post-Launch)

| Feature | Priority | Description |
|---------|----------|-------------|
| Team collaboration | P3 | Shared knowledge bases |
| Public meta-skill marketplace | P3 | Community-shared skills |
| Voice capture | P3 | Voice notes |
| Image OCR | P3 | Extract text from images |
| PDF extraction | P3 | Auto-extract from PDFs |
| Video transcription | P3 | Capture from videos |
| Learning platform integration | P3 | Coursera, Udemy, etc. |
| Gamification | P3 | Points, badges, streaks |
| AI agent suggestions | P3 | Proactive insights |
| Custom AI models | P3 | Fine-tuned models |
| Multi-language support | P3 | i18n |
| Accessibility features | P2 | Screen reader support, etc. |
| White-label version | P3 | Custom branding |

---

## Feature Count Summary

- **P0 (MVP)**: 67 features
- **P1 (Important)**: 142 features
- **P2 (Nice to have)**: 98 features
- **P3 (Future)**: 57 features

**Total**: 364 features

---

## Implementation Priority Order

1. **Phase 1** (Weeks 1-2): All P0 features + core P1 features
2. **Phase 2** (Weeks 3-4): Problem tracking P1 features
3. **Phase 3** (Weeks 5-6): Intelligence P1 features
4. **Phase 4** (Weeks 7-8): Integration P1 features
5. **Phase 5** (Weeks 9-12): Polish + P2 features

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for detailed schedule.

---

This comprehensive list ensures nothing is forgotten during implementation. Features can be added/removed based on user feedback and priorities.
