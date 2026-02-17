import { useState, useEffect, useCallback, useRef } from 'react';
import type { AgentMessage, AgentSession } from '@/lib/types';

export function useAgentSession(sessionId: string | null) {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [session, setSession] = useState<AgentSession | null>(null);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    // Fetch initial session data
    fetch('/api/agent/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get', sessionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.id) setSession(data);
      })
      .catch(console.error);

    // Connect to SSE stream
    const es = new EventSource(`/api/agent/sessions/${sessionId}/stream`);
    eventSourceRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (event) => {
      try {
        const msg: AgentMessage = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
    };

    return () => {
      es.close();
      setConnected(false);
    };
  }, [sessionId]);

  const sendInput = useCallback(async (input: string) => {
    if (!sessionId) return;
    await fetch('/api/agent/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'input', sessionId, input }),
    });
  }, [sessionId]);

  const cancel = useCallback(async () => {
    if (!sessionId) return;
    await fetch('/api/agent/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel', sessionId }),
    });
  }, [sessionId]);

  return { messages, session, connected, sendInput, cancel };
}
