import type { Column } from "@/types";

export const ROOT_COLUMNS: Column[] = [
  {
    id: "backlog",
    title: "Backlog",
    color: "bg-[linear-gradient(135deg,#efe3cb,#f8ecd6)]",
    textColor: "text-[#624f2f]",
  },
  {
    id: "todo",
    title: "To Do",
    color: "bg-[linear-gradient(135deg,#d9edf0,#eef8fb)]",
    textColor: "text-[#275768]",
  },
  {
    id: "in_progress",
    title: "In Progress",
    color: "bg-[linear-gradient(135deg,#f9d8af,#fde8cc)]",
    textColor: "text-[#7a4a1e]",
  },
  {
    id: "blocked",
    title: "Blocked",
    color: "bg-[linear-gradient(135deg,#f2c3bb,#f8dbd5)]",
    textColor: "text-[#7b2f2a]",
  },
  {
    id: "done",
    title: "Done",
    color: "bg-[linear-gradient(135deg,#caeadb,#e6f7ee)]",
    textColor: "text-[#255f4a]",
  },
];

export const NESTED_COLUMNS: Column[] = [
  {
    id: "todo",
    title: "To Do",
    color: "bg-[linear-gradient(135deg,#d9edf0,#eef8fb)]",
    textColor: "text-[#275768]",
  },
  {
    id: "in_progress",
    title: "In Progress",
    color: "bg-[linear-gradient(135deg,#f9d8af,#fde8cc)]",
    textColor: "text-[#7a4a1e]",
  },
  {
    id: "blocked",
    title: "Blocked",
    color: "bg-[linear-gradient(135deg,#f2c3bb,#f8dbd5)]",
    textColor: "text-[#7b2f2a]",
  },
  {
    id: "done",
    title: "Done",
    color: "bg-[linear-gradient(135deg,#caeadb,#e6f7ee)]",
    textColor: "text-[#255f4a]",
  },
];
