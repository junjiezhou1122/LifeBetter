# UnifiedBoard 重构说明

## 问题
- UnifiedBoard.tsx 文件过长（700+ 行）
- 多个 useEffect 混在一起，难以理解每个的作用
- 业务逻辑和 UI 逻辑耦合

## 解决方案

### 1. 自定义 Hooks

#### `useItems.ts` - 项目数据管理
**作用**：管理所有项目相关的数据获取和操作

**功能**：
- `items` - 当前层级的项目列表
- `allItems` - 所有项目（用于计算子项数量）
- `loading` - 加载状态
- `getChildCount(itemId)` - 获取项目的子项数量
- `addItem(title, description, priority, status)` - 创建新项目
- `deleteItem(itemId)` - 删除项目
- `updateItem(itemId, updates)` - 更新项目
- `refreshItems()` - 刷新项目列表

**对应的 useEffect**：
```typescript
useEffect(() => {
  fetchItems();  // 根据当前父级 ID 获取项目
}, [currentParentId]);

useEffect(() => {
  fetchAllItems();  // 获取所有项目（用于计算子项数量）
}, [items]);
```

---

#### `useNavigation.ts` - 导航管理
**作用**：管理层级导航（面包屑、前进、后退）

**功能**：
- `navigationStack` - 导航栈（记录访问历史）
- `currentParentId` - 当前父级 ID
- `currentDepth` - 当前深度
- `isRootLevel` - 是否在根层级
- `drillDown(itemId, title, depth)` - 向下钻取到子项
- `navigateToBreadcrumb(index)` - 点击面包屑跳转
- `goBack()` - 返回上一级
- `resetToHome()` - 重置到首页

**使用场景**：
```typescript
// 点击项目进入子层级
drillDown(item.id, item.title, item.depth);

// 点击面包屑导航
navigateToBreadcrumb(2);

// 点击返回按钮
goBack();
```

---

#### `useMetaSkills.ts` - 元技能管理
**作用**：管理元技能数据

**功能**：
- `metaSkills` - 元技能列表
- `loading` - 加载状态
- `getMetaSkillById(id)` - 根据 ID 获取元技能
- `updateMetaSkill(id, updates)` - 更新元技能

**对应的 useEffect**：
```typescript
useEffect(() => {
  fetchMetaSkills();  // 获取所有元技能
}, []);
```

---

### 2. 常量配置

#### `board-constants.ts`
**作用**：定义看板列的配置

**内容**：
- `ROOT_COLUMNS` - 根层级的列（5列：Backlog, To Do, In Progress, Blocked, Done）
- `NESTED_COLUMNS` - 嵌套层级的列（4列：To Do, In Progress, Blocked, Done）

---

## 如何使用这些 Hooks

### 在 UnifiedBoard 中使用

```typescript
import { useItems } from '@/hooks/useItems';
import { useNavigation } from '@/hooks/useNavigation';
import { useMetaSkills } from '@/hooks/useMetaSkills';
import { ROOT_COLUMNS, NESTED_COLUMNS } from './board-constants';

export function UnifiedBoard() {
  // 1. 导航管理
  const {
    navigationStack,
    currentParentId,
    currentDepth,
    isRootLevel,
    drillDown,
    navigateToBreadcrumb,
    goBack,
  } = useNavigation();

  // 2. 项目数据管理
  const {
    items,
    allItems,
    loading,
    getChildCount,
    addItem,
    deleteItem,
    updateItem,
    refreshItems,
  } = useItems(currentParentId);

  // 3. 元技能管理
  const {
    metaSkills,
    getMetaSkillById,
    updateMetaSkill,
  } = useMetaSkills();

  // 4. 选择列配置
  const columns = isRootLevel ? ROOT_COLUMNS : NESTED_COLUMNS;

  // ... 其余 UI 代码
}
```

---

## 优势

1. **职责分离**：每个 hook 只负责一个领域
2. **可复用**：hooks 可以在其他组件中使用
3. **易于测试**：可以单独测试每个 hook
4. **易于理解**：每个 hook 的作用一目了然
5. **易于维护**：修改某个功能只需要改对应的 hook

---

## 下一步

建议继续拆分：
1. 提取 `BoardHeader` 组件（面包屑、搜索栏、返回按钮）
2. 提取 `KanbanBoard` 组件（看板列和拖拽逻辑）
3. 提取 `useSidebar` hook（侧边栏状态管理）
4. 提取 `useDragAndDrop` hook（拖拽逻辑）
