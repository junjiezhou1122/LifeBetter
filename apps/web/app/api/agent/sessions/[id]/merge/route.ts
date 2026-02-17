import { NextResponse } from 'next/server';
import { getSession, getValidationResult } from '@/lib/server/agent-manager';
import { mergeWorktree, removeWorktree } from '@/lib/server/worktree-manager';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = getSession(id);

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  if (!session.worktreePath || !session.worktreeBranch) {
    return NextResponse.json({ error: 'Session has no worktree to merge' }, { status: 400 });
  }

  // Check validation passed
  const validation = getValidationResult(id);
  if (!validation || validation.overallStatus === 'fail') {
    return NextResponse.json(
      { error: 'Validation must pass before merging', validation },
      { status: 400 },
    );
  }

  // Merge the worktree branch
  const result = await mergeWorktree(session.worktreePath, session.worktreeBranch);

  if (result.success) {
    // Clean up the worktree
    try {
      await removeWorktree(session.worktreePath);
    } catch {
      // Non-critical cleanup failure
    }
  }

  return NextResponse.json(result);
}
