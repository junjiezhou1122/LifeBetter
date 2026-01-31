import type { Column } from "@/types";

export const ROOT_COLUMNS: Column[] = [
  {
    id: "backlog",
    title: "Backlog",
    color: "bg-stone-200",
    textColor: "text-stone-700",
  },
  {
    id: "todo",
    title: "To Do",
    color: "bg-sky-100",
    textColor: "text-sky-800",
  },
  {
    id: "in_progress",
    title: "In Progress",
    color: "bg-amber-100",
    textColor: "text-amber-800",
  },
  {
    id: "blocked",
    title: "Blocked",
    color: "bg-rose-100",
    textColor: "text-rose-800",
  },
  {
    id: "done",
    title: "Done",
    color: "bg-emerald-100",
    textColor: "text-emerald-800",
  },
];

export const NESTED_COLUMNS: Column[] = [
  {
    id: "todo",
    title: "To Do",
    color: "bg-sky-100",
    textColor: "text-sky-800",
  },
  {
    id: "in_progress",
    title: "In Progress",
    color: "bg-amber-100",
    textColor: "text-amber-800",
  },
  {
    id: "blocked",
    title: "Blocked",
    color: "bg-rose-100",
    textColor: "text-rose-800",
  },
  {
    id: "done",
    title: "Done",
    color: "bg-emerald-100",
    textColor: "text-emerald-800",
  },
];
