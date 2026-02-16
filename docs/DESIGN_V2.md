# LifeBetter 2.0 — 设计文档

> **一个像人一样从经验中学习的 AI 任务系统，用得越多越聪明。**

---

## 1. 项目定位

LifeBetter 2.0 是一个**会自主学习的智能任务系统**。

核心公式：

```
任务拆解 + AI Agent 自动执行 + 从经验中自动学习 = 越用越聪明的助手
```

它不是 TODO 应用，不是代码生成器，而是一个**模拟人类学习过程的执行系统**。

### 1.1 核心理念

> 任何复杂任务都可以被拆解，拆解到足够小时，AI Agent 就能自动完成它。

LifeBetter 2.0 是**思维框架 + AI 执行引擎**的融合体：

1. **用 Principle（原则）指导思考** — 怎么拆解？先做什么？
2. **用 Agent 自动执行** — 拆解后的小任务交给 AI 去做
3. **用反馈闭环学习** — 每次执行的结果反哺到下一次决策

```
┌─────────────────────────────────────────────────────┐
│                  LifeBetter 2.0                     │
│                                                     │
│   🧠 Think          ⚡ Execute         🔄 Learn    │
│   ┌─────────┐      ┌─────────┐      ┌─────────┐   │
│   │Principles│─────▶│ Agent   │─────▶│Feedback │   │
│   │ 原则指导 │      │ 自动执行 │      │ 反馈学习 │   │
│   └─────────┘      └─────────┘      └─────────┘   │
│        ▲                                    │       │
│        └────────────────────────────────────┘       │
└─────────────────────────────────────────────────────┘
```

---

## 2. 三大支柱

### 2.1 Principle（原则）= 自动学会的 Meta-Skill

#### 核心洞察

**Principle 不是预定义的，是系统从经验中自动发现的。**

就像人类从经验中"悟"出道理一样——AI 也需要走同样的路：

```
❌ 传统思路：人工定义原则 → 手动应用到任务
✅ 正确思路：执行任务 → 积累经验 → 自动提炼出 Principle → 下次相似场景自动触发
```

#### 学习过程

```
第1次：做任务A，花了10小时，发现80%的价值来自20%的工作
第2次：做任务B，又发现类似模式
第3次：系统自动提炼出 "80/20法则" 这个 Principle
第4次：遇到任务C，系统识别到相似场景，自动建议应用这个原则
```

#### Principle 的六大特性

1. **自动学习**：从成功和失败中提炼，不需要人工定义
2. **按需触发**：只在匹配的场景下激活，不是每次都用
3. **持续进化**：随着经验增加，Principle 会被修正和细化
4. **跨领域迁移**：从编程中学到的模式可能适用于写作
5. **关系网络**：原则之间有互补、前置、冲突关系
6. **实时干预**：可以在 Agent 执行过程中实时指导

#### 种子原则（来自 Obsidian Meta-Learning）

Obsidian 中已有的原则作为**种子知识**，系统在此基础上自主成长：

| 种子原则 | 来源 | 含义 |
|---------|------|------|
| 80/20 法则 | 经验积累 | 20% 的努力产出 80% 的价值 |
| 分解原则 | 经验积累 | 大问题拆成小问题 |
| 反馈环 | 经验积累 | 做 → 检查 → 调整 → 再做 |
| 混合优于纯粹 | 经验积累 | 人+AI > 纯人 or 纯AI |
| 先验证再扩展 | 经验积累 | 先跑通最小方案 |

#### Principle 的进化

Principle 不是固定的，会随经验修正：

```
v1: "大任务要拆成小任务"
v2: "大任务要拆成小任务，但拆的粒度不超过4小时"（经验修正）
v3: "大任务要拆成小任务，粒度根据领域调整：编码4小时，设计2小时"（进一步细化）
```

### 2.2 Agent-Free 执行

不搞复杂的 Agent 框架，直接调用现有终端工具：

```
Claude Code  ─┐
OpenCode     ─┤──▶ PTY (终端) ──▶ 代码修改
Codex CLI    ─┘
```

核心原则：
- **简单可靠**：直接调用终端，不造轮子
- **并行执行**：支持 3-12 个 Agent 同时工作
- **隔离安全**：每个任务在独立 Git Worktree 中执行

### 2.3 经验驱动的反馈闭环

```
执行 → 复盘 → 提炼 → 指导下一次执行
```

不是简单记录"成功/失败"，而是深度分析**为什么**：

```
浅层记录：任务A成功了，花了2小时
深层记录：任务A成功了，因为先写了测试再改代码，避免了3次回退
```

**失败比成功更有价值**——失败往往能发现新的 Principle。

---

## 3. 任务生命周期

每个任务经历 6 个阶段：

```
CAPTURE → DECOMPOSE → SPEC → EXECUTE → VALIDATE → INTEGRATE
 描述目标   原则指导拆解  生成规格  Agent执行   QA验证     合并+复盘
```

### 详细流程

```
┌─────────┐    ┌───────────┐    ┌────────┐
│ CAPTURE │───▶│ DECOMPOSE │───▶│  SPEC  │
│ "重构认证" │   │ 拆成4个子任务│   │ 生成规格 │
└─────────┘    └───────────┘    └────────┘
                                     │
                          ┌──────────▼──────────┐
                          │      EXECUTE        │
                          │                     │
                          │  ┌───────────────┐  │
                          │  │ Git Worktree  │  │
                          │  │ (隔离环境)     │  │
                          │  │               │  │
                          │  │ Agent 在这里   │  │
                          │  │ 独立工作       │  │
                          │  └───────────────┘  │
                          └──────────┬──────────┘
                                     │
                          ┌──────────▼──────────┐
                          │     VALIDATE        │
                          │  · lint 检查         │
                          │  · 单元测试          │
                          │  · 构建测试          │
                          │  · AI 代码审查       │
                          └──────────┬──────────┘
                                     │
                          ┌──────────▼──────────┐
                          │    INTEGRATE        │
                          │  · 合并到主分支      │
                          │  · 生成 Checkpoint  │
                          │  · 自动复盘          │
                          │  · 提炼经验          │
                          └─────────────────────┘
```

### 3.1 CAPTURE（捕获）

用户用自然语言描述目标，系统记录原始意图。

### 3.2 DECOMPOSE（拆解）

系统结合已有 Principle 自动拆解任务：

```
用户输入: "重构用户认证系统"
                │
                ▼
┌──────────────────────────────────┐
│ 系统自动匹配 Principle:          │
│                                  │
│ 1. 分解原则 → 拆成子任务          │
│ 2. 先验证再扩展 → 先跑通登录      │
│ 3. 80/20 → 优先做核心逻辑        │
└──────────────────────────────────┘
                │
                ▼
        自动拆解为:
        ├── [高优] 核心登录逻辑重构
        ├── [高优] 密码加密升级
        ├── [中优] OAuth 集成
        └── [低优] UI 美化
```

### 3.3 SPEC（规格生成）

借鉴 Auto-Claude 的 Spec-First 方法，执行前先生成规格：

```typescript
interface TaskSpec {
  goal: string;                    // 目标
  approach: string;                // 实现方案
  steps: string[];                 // 具体步骤
  acceptanceCriteria: string[];    // 验收标准
  estimatedTime: number;           // 预估时间
  principlesApplied: string[];     // 应用的原则
}
```

### 3.4 EXECUTE（执行）

Agent 在隔离的 Git Worktree 中执行任务。

### 3.5 VALIDATE（验证）

自动 QA 验证循环：

```
Build → QA Check → Pass? → 继续
             │
             └── Fail → AI 修复 → 重新检查
```

### 3.6 INTEGRATE（整合）

合并结果 + 生成 Checkpoint + 自动复盘提炼经验。

---

## 4. 技术架构

### 4.1 四层执行架构

```
┌─────────────────────────────────────────────────────┐
│  Layer 1: Task State Machine (状态机)               │
│  pending → queued → running → done/failed           │
├─────────────────────────────────────────────────────┤
│  Layer 2: Agent Executor (执行器)                   │
│  · 任务队列管理                                      │
│  · 最多 3-12 个 Agent 并行执行                       │
│  · 自动调度：空闲时拉取下一个任务                      │
├─────────────────────────────────────────────────────┤
│  Layer 3: Agent Session (PTY 会话管理)              │
│  · node-pty 管理终端会话                             │
│  · 解析 Agent 输出，提取进度事件                      │
│  · 支持多轮交互 (sendFollowUp)                      │
├─────────────────────────────────────────────────────┤
│  Layer 4: Real-time UI (实时更新)                   │
│  · WebSocket 推送状态                                │
│  · 进度条、当前步骤显示                               │
│  · 完成后展示结果摘要                                 │
└─────────────────────────────────────────────────────┘
```

### 4.2 Git Worktree 隔离

每个任务在独立的 Git 分支中工作，主分支始终安全：

```bash
# 任务开始时
git worktree add -b task-001 ./worktrees/task-001 main

# Agent 在 ./worktrees/task-001 中工作（不影响主分支）

# 任务完成后
git merge task-001
git worktree remove ./worktrees/task-001
```

### 4.3 并行执行与智能合并

```
┌─────────┐  ┌─────────┐  ┌─────────┐
│ Agent 1 │  │ Agent 2 │  │ Agent 3 │
│ 登录重构 │  │ 密码加密 │  │ OAuth   │
│ worktree │  │ worktree │  │ worktree│
│  /t-001  │  │  /t-002  │  │  /t-003 │
└────┬─────┘  └────┬─────┘  └────┬────┘
     │             │             │
     └─────────────┼─────────────┘
                   │
            ┌──────▼──────┐
            │ AI Merge    │
            │ 智能合并冲突  │
            └──────┬──────┘
                   │
            ┌──────▼──────┐
            │    main     │
            └─────────────┘
```

---

## 5. 智能层：经验提炼引擎

### 5.1 经验记录

```typescript
interface Experience {
  taskId: string;
  task: string;               // 做了什么
  approach: string;           // 怎么做的
  outcome: 'success' | 'partial' | 'failure';
  timeSpent: number;          // 花了多久
  feedback: string;           // 用户文本反馈（不是星级！）
  
  // 深度复盘
  retrospective: {
    whatWorked: string;       // 做对了什么
    whatFailed: string;       // 做错了什么
    keyTurningPoint: string;  // 关键转折点
    ifRedoWouldChange: string; // 如果重来会怎么做
    applicableScenarios: string[]; // 适用于什么类型的任务
  };
  
  // 执行上下文
  context: {
    taskType: string;         // 编码/写作/分析
    complexity: string;       // 简单/中等/复杂
    domain: string;           // 前端/后端/设计
    principlesUsed: string[]; // 用了哪些原则
  };
}
```

### 5.2 Principle 自动发现

```typescript
interface Principle {
  id: string;
  name: string;                    // "核心优先法则"
  description: string;             // 详细描述
  version: number;                 // 版本号，会进化
  confidence: number;              // 置信度（经验越多越高）
  
  // 触发条件（自动学习）
  triggers: {
    taskTypes: string[];           // 适用的任务类型
    complexityRange: string[];     // 适用的复杂度
    domains: string[];             // 适用的领域
    keywords: string[];            // 关键词匹配
  };
  
  // 如何应用
  howToApply: string;
  
  // 与其他 Principle 的关系
  relations: {
    complementary: string[];       // 互补关系
    prerequisite: string[];        // 前置关系
    conflicting: string[];         // 冲突关系
  };
  
  // 来源追踪
  derivedFrom: {
    experienceIds: string[];       // 从哪些经验中提炼
    discoveredAt: Date;
    lastRefinedAt: Date;
  };
  
  // 使用记录
  applications: {
    taskId: string;
    context: string;
    outcome: string;
    feedback: string;
    appliedAt: Date;
  }[];
}
```

### 5.3 模式发现流程

```
经验积累
   │
   ▼
┌────────────────────────────────────────────────────┐
│              模式发现器 (Pattern Discoverer)        │
│                                                    │
│  1. 聚类分析：相似经验归类                           │
│  2. 因果分析：成功/失败的共同因素                     │
│  3. 抽象提炼：找到正确的抽象层级                      │
│  4. 跨域检测：不同领域的共通模式                      │
│  5. 冲突检测：新原则是否与已有原则矛盾                │
└────────────────────────────────────────────────────┘
   │
   ├── 发现新 Principle → 添加到原则网络
   ├── 强化已有 Principle → 提升置信度
   └── 修正已有 Principle → 版本升级
```

### 5.4 实时干预机制

Principle 不只在任务开始前使用，还能在执行过程中实时指导：

```
Agent 正在执行任务...
  ├── 检测到 Agent 在同一个问题上循环 3 次
  ├── 触发 Principle: "如果卡住超过3轮，换个方向"
  └── 自动发送指令: "停下来，用另一种方案试试"
```

---

## 6. 会话追踪（Checkpoint）

借鉴 Entire.io 的理念，每次 Agent 执行产生一个 Checkpoint：

```typescript
interface Checkpoint {
  taskId: string;
  
  // Agent 会话记录
  session: {
    agent: 'claude-code' | 'opencode' | 'codex';
    transcript: Message[];      // 完整对话记录
    duration: number;           // 执行时长
    tokensUsed: number;         // Token 消耗
  };
  
  // 代码变更
  changes: {
    filesAdded: string[];
    filesModified: string[];
    filesDeleted: string[];
    diffSummary: string;        // AI 生成的变更摘要
  };
  
  // Git 信息
  git: {
    branch: string;
    commits: string[];
    mergedTo?: string;
  };
  
  // 验证结果
  validation: {
    lint: { passed: boolean; issues: number };
    tests: { passed: boolean; total: number; failed: number };
    build: { passed: boolean };
    aiReview?: string;
  };
}
```

每个任务都有完整的**故事线**——为什么改、怎么改、改了什么、结果如何。

---

## 7. Obsidian 同步

种子原则与 Obsidian Meta-Learning 笔记双向同步：

```
Obsidian Vault                    LifeBetter
┌─────────────────┐              ┌─────────────────┐
│ Meta-Learning/  │   ◀──同步──▶  │ Principles DB   │
│  Algorithms/    │              │                 │
│   80-20.md      │              │ 80/20 法则       │
│   Break-Down.md │              │ 分解原则         │
│   Feedback.md   │              │ 反馈环           │
└─────────────────┘              └─────────────────┘
```

- Obsidian 中的原则 = 人类经验的结晶（种子）
- LifeBetter 发现的原则 = AI 执行经验的提炼（成长）
- 两者融合，互相验证

---

## 8. 开源项目启发

### 8.1 Entire.io

- **核心**：CLI 集成 Git 工作流，自动捕获 Agent 会话并与 Commit 关联
- **启发**：Checkpoint 概念——每次执行留下完整故事线
- **愿景**：Agent 版本控制 + 语义推理层 + AI 原生开发流程

### 8.2 AutoCoder-Nano

- **核心**：轻量级 CLI 编码助手，支持 `/auto`（Agent 模式）、`/coding`（代码生成）、`/chat`（对话）
- **启发**：清晰的交互模式划分、会话持久化、文件索引 + RAG 上下文

### 8.3 Auto-Claude

- **核心**：自治多代理编码框架，Kanban 管理 + 并行 Agent 执行
- **启发**：
  - Spec-First：先生成规格再执行
  - Git Worktree 隔离：每个任务独立分支
  - Self-Validating QA：内置质量验证循环
  - 并行执行：最多 12 个 Agent 同时工作
  - Memory Layer：跨会话记忆

---

## 9. 与竞品的差异化

| 对比项 | Auto-Claude | OpenHands | **LifeBetter 2.0** |
|--------|-------------|-----------|-------------------|
| **核心** | 代码生成 | 通用 Agent | **思维+执行+学习闭环** |
| **任务拆解** | Spec 生成 | 无 | **Principle 驱动的智能拆解** |
| **学习机制** | 记忆层 | 历史记录 | **自动发现 Principle** |
| **适用范围** | 仅编程 | 仅编程 | **任何类型的任务** |
| **哲学** | 全自动 | 全自动 | **人机协作，共同成长** |

---

## 10. 技术栈

| 层 | 技术 |
|----|------|
| **前端** | Next.js + React（已有） |
| **实时通信** | WebSocket |
| **Agent 管理** | node-pty + 进程池 |
| **版本控制** | Git Worktree |
| **数据存储** | 本地 JSON / SQLite |
| **原则同步** | Obsidian Vault (Markdown) |

---

## 11. 实现路线图

| 阶段 | 内容 | 预计时间 |
|------|------|----------|
| **Phase 1** | 经验数据模型 + Principle 自动提炼引擎 | 1-2 周 |
| **Phase 2** | Agent Executor + PTY 管理 + 单任务执行 | 1-2 周 |
| **Phase 3** | Git Worktree 隔离 + QA 验证循环 | 1 周 |
| **Phase 4** | 并行执行 + 任务链 + 智能合并 | 1-2 周 |
| **Phase 5** | Checkpoint 追踪 + Obsidian 种子同步 | 1 周 |

---

## 12. 终极愿景

```
┌──────────────────────────────────────────────────┐
│              LifeBetter Intelligence             │
│                                                  │
│  ┌────────┐    ┌────────────┐    ┌────────────┐ │
│  │ 经验池 │───▶│ 模式发现器 │───▶│ 原则网络   │ │
│  │        │    │            │    │            │ │
│  │ 成功案例│    │ 自动聚类   │    │ 关系图谱   │ │
│  │ 失败案例│    │ 因果分析   │    │ 版本演进   │ │
│  │ 执行记录│    │ 跨域迁移   │    │ 触发条件   │ │
│  └────────┘    └────────────┘    └────────────┘ │
│       ▲                               │         │
│       │         ┌────────────┐        │         │
│       │         │ 执行引擎   │◀───────┘         │
│       │         │            │  实时指导         │
│       │         │ Agent Pool │                   │
│       │         │ QA Loop    │                   │
│       │         └─────┬──────┘                   │
│       │               │                          │
│       └───────────────┘                          │
│          反馈回流                                 │
└──────────────────────────────────────────────────┘
```

**LifeBetter 2.0 = 原则自动发现 + Agent 自动执行 + 反馈持续进化**

一个让你和 AI 一起越用越聪明的系统。
