import { NextResponse } from 'next/server';
import {
  getQueue,
  enqueue,
  enqueueChildren,
  removeFromQueue,
  cancelAll,
  clearCompleted,
  startPolling,
} from '@/lib/server/task-queue';

export async function GET() {
  return NextResponse.json(getQueue());
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, taskId, taskIds, parentId, priority, dependencies } = body;

  if (action === 'enqueue-children' && parentId) {
    const items = await enqueueChildren(parentId);
    startPolling();
    return NextResponse.json(items, { status: 201 });
  }

  if (action === 'cancel-all') {
    cancelAll();
    return NextResponse.json({ success: true });
  }

  if (action === 'clear-completed') {
    clearCompleted();
    return NextResponse.json({ success: true });
  }

  // Enqueue single or multiple tasks
  const ids: string[] = taskIds || (taskId ? [taskId] : []);
  if (ids.length === 0) {
    return NextResponse.json({ error: 'taskId or taskIds required' }, { status: 400 });
  }

  const items = ids.map((id: string) => enqueue(id, priority ?? 0, dependencies ?? []));
  startPolling();
  return NextResponse.json(items, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
  }

  const removed = removeFromQueue(taskId);
  return NextResponse.json({ success: removed });
}
