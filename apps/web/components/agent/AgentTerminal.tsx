'use client';

import { useEffect, useRef } from 'react';
import type { AgentMessage } from '@/lib/types';

interface AgentTerminalProps {
  messages: AgentMessage[];
  connected: boolean;
}

// Simple ANSI strip for display (removes escape codes)
function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
}

export function AgentTerminal({ messages, connected }: AgentTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-[#3a3a3a] bg-[#1e1e1e]">
      {/* Terminal header */}
      <div className="flex items-center gap-2 border-b border-[#3a3a3a] bg-[#2d2d2d] px-3 py-1.5">
        <div className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-400'}`} />
        <span className="text-[11px] font-medium text-[#cccccc]">
          Agent Terminal {connected ? '(live)' : '(disconnected)'}
        </span>
      </div>

      {/* Terminal body */}
      <div
        ref={terminalRef}
        className="lb-scrollbar max-h-[400px] min-h-[200px] overflow-y-auto p-3 font-mono text-xs leading-relaxed"
      >
        {messages.map((msg) => (
          <div key={msg.id} className="whitespace-pre-wrap">
            {msg.type === 'system' && (
              <span className="text-blue-400">{'>>> '}{msg.content}</span>
            )}
            {msg.type === 'stdout' && (
              <span className="text-[#cccccc]">{stripAnsi(msg.content)}</span>
            )}
            {msg.type === 'stderr' && (
              <span className="text-red-400">{stripAnsi(msg.content)}</span>
            )}
            {msg.type === 'input' && (
              <span className="text-green-400">{'$ '}{msg.content}</span>
            )}
          </div>
        ))}
        {messages.length === 0 && (
          <span className="text-[#666]">Waiting for agent output...</span>
        )}
      </div>
    </div>
  );
}
