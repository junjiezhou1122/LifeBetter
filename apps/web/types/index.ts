export type ItemStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "blocked"
  | "done";

export interface Item {
  id: string;
  title: string;
  description?: string;
  notes?: string;
  parentId: string | null;
  depth: number;
  status: ItemStatus;
  priority: string;
  createdAt: string;
  updatedAt: string;
  breakdownStatus?: string;
  tags?: string[];
  blockedBy?: string[];
  blocking?: string[];
  canBreakdown?: boolean;
  order: number;
  solvedWithMetaSkill?: string;
  metaSkillSuccess?: boolean;
  metaSkillIds?: string[];
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
}

export interface NavigationItem {
  id: string | null;
  title: string;
  depth: number;
}

export interface MetaSkill {
  id: string;
  name: string;
  description: string;
  timesSuccessful: number;
  timesFailed: number;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  color: string;
  textColor: string;
}
