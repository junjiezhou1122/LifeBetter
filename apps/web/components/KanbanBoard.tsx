'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ProblemCard } from './ProblemCard';
import { TaskBoard } from './TaskBoard';

type ProblemStatus = 'backlog' | 'todo' | 'in_progress' | 'blocked' | 'done';

interface Problem {
  id: string;
  text: string;
  status: ProblemStatus;
  priority: string;
  createdAt: string;
  updatedAt: string;
  breakdownStatus?: string;
  tags?: string[];
  blockedBy?: string[];
  blocking?: string[];
}

interface Task {
  id: string;
  problemId: string;
  parentTaskId?: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  blockedBy?: string[];
  blocking?: string[];
  canBreakdown?: boolean;
}

interface NavigationItem {
  type: 'problem' | 'task';
  id: string;
  title: string;
}

const COLUMNS: { id: ProblemStatus; title: string; color: string }[] = [
  { id: 'backlog', title: 'Backlog', color: 'bg-gray-100' },
  { id: 'todo', title: 'To Do', color: 'bg-blue-100' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-yellow-100' },
  { id: 'blocked', title: 'Blocked', color: 'bg-red-100' },
  { id: 'done', title: 'Done', color: 'bg-green-100' },
];

export function KanbanBoard() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [navigationStack, setNavigationStack] = useState<NavigationItem[]>([]);

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [problemsRes, tasksRes] = await Promise.all([
          fetch('/api/problems'),
          fetch('/api/tasks')
        ]);

        const [problemsData, tasksData] = await Promise.all([
          problemsRes.json(),
          tasksRes.json()
        ]);

        setProblems(problemsData);
        setTasks(tasksData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newStatus = destination.droppableId as ProblemStatus;

    // Optimistic update
    setProblems(prev =>
      prev.map(p =>
        p.id === draggableId
          ? { ...p, status: newStatus, updatedAt: new Date().toISOString() }
          : p
      )
    );

    // Update on server
    try {
      await fetch('/api/problems', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: draggableId, updates: { status: newStatus } })
      });
    } catch (error) {
      console.error('Failed to update problem:', error);
      // Revert on error
      setProblems(prev =>
        prev.map(p =>
          p.id === draggableId
            ? { ...p, status: source.droppableId as ProblemStatus }
            : p
        )
      );
    }
  };

  const getTasksForProblem = (problemId: string) => {
    return tasks.filter(t => t.problemId === problemId && !t.parentTaskId);
  };

  const handleProblemClick = (problem: Problem) => {
    setNavigationStack([{ type: 'problem', id: problem.id, title: problem.text }]);
  };

  const handleTaskClick = (task: Task) => {
    const currentItem = navigationStack[navigationStack.length - 1];
    setNavigationStack([...navigationStack, { type: 'task', id: task.id, title: task.title }]);
  };

  const handleBack = () => {
    setNavigationStack(prev => prev.slice(0, -1));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  // If we're viewing a task board (navigated into a problem or task)
  if (navigationStack.length > 0) {
    const currentItem = navigationStack[navigationStack.length - 1];
    const isViewingProblem = currentItem.type === 'problem';

    return (
      <TaskBoard
        problemId={isViewingProblem ? currentItem.id : navigationStack[0].id}
        parentTaskId={isViewingProblem ? undefined : currentItem.id}
        problemTitle={currentItem.title}
        onBack={handleBack}
        onTaskClick={handleTaskClick}
      />
    );
  }

  return (
    <div className="h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">📊 Kanban Board</h1>
        <p className="text-gray-600 mt-2">
          {problems.length} problems • {tasks.length} tasks
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-5 gap-4 h-[calc(100vh-180px)]">
          {COLUMNS.map(column => {
            const columnProblems = problems.filter(p => p.status === column.id);

            return (
              <div key={column.id} className="flex flex-col">
                <div className={`${column.color} rounded-t-lg px-4 py-3 border-b-2 border-gray-300`}>
                  <h2 className="font-semibold text-gray-800">
                    {column.title}
                    <span className="ml-2 text-sm text-gray-600">({columnProblems.length})</span>
                  </h2>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-2 overflow-y-auto bg-white rounded-b-lg border border-gray-200 ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : ''
                      }`}
                    >
                      {columnProblems.map((problem, index) => (
                        <Draggable key={problem.id} draggableId={problem.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`mb-2 ${snapshot.isDragging ? 'opacity-50' : ''}`}
                              onClick={(e) => {
                                // Only navigate if not dragging
                                if (!snapshot.isDragging) {
                                  e.stopPropagation();
                                  handleProblemClick(problem);
                                }
                              }}
                            >
                              <ProblemCard
                                problem={problem}
                                tasks={getTasksForProblem(problem.id)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
