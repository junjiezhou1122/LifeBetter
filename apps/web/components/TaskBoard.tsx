'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';
import { ChevronLeft } from 'lucide-react';

type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';

interface Task {
  id: string;
  problemId: string;
  parentTaskId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

interface TaskBoardProps {
  problemId: string;
  parentTaskId?: string;
  problemTitle: string;
  onBack: () => void;
  onTaskClick: (task: Task) => void;
}

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: 'bg-blue-100' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-yellow-100' },
  { id: 'blocked', title: 'Blocked', color: 'bg-red-100' },
  { id: 'done', title: 'Done', color: 'bg-green-100' },
];

export function TaskBoard({ problemId, parentTaskId, problemTitle, onBack, onTaskClick }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const url = parentTaskId
          ? `/api/tasks?parentTaskId=${parentTaskId}`
          : `/api/tasks?problemId=${problemId}`;

        const res = await fetch(url);
        const data = await res.json();
        setTasks(data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [problemId, parentTaskId]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;

    // Optimistic update
    setTasks(prev =>
      prev.map(t =>
        t.id === draggableId
          ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
          : t
      )
    );

    // Update on server
    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: draggableId, updates: { status: newStatus } })
      });
    } catch (error) {
      console.error('Failed to update task:', error);
      // Revert on error
      setTasks(prev =>
        prev.map(t =>
          t.id === draggableId
            ? { ...t, status: source.droppableId as TaskStatus }
            : t
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 p-6">
      {/* Header with breadcrumb */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to {parentTaskId ? 'Parent Task' : 'Problems'}</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900">
          📋 Tasks for: {problemTitle}
        </h1>
        <p className="text-gray-600 mt-2">
          {tasks.length} task{tasks.length === 1 ? '' : 's'}
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-4 gap-4 h-[calc(100vh-200px)]">
          {COLUMNS.map(column => {
            const columnTasks = tasks.filter(t => t.status === column.id);

            return (
              <div key={column.id} className="flex flex-col">
                <div className={`${column.color} rounded-t-lg px-4 py-3 border-b-2 border-gray-300`}>
                  <h2 className="font-semibold text-gray-800">
                    {column.title}
                    <span className="ml-2 text-sm text-gray-600">({columnTasks.length})</span>
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
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`mb-2 ${snapshot.isDragging ? 'opacity-50' : ''}`}
                            >
                              <TaskCard
                                task={task}
                                onClick={() => onTaskClick(task)}
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
