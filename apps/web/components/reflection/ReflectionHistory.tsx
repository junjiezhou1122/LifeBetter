'use client';

import { useState, useEffect } from 'react';
import { Calendar, Edit, Trash2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

interface Reflection {
  id: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface ReflectionHistoryProps {
  onEdit: (reflection: Reflection) => void;
}

export function ReflectionHistory({ onEdit }: ReflectionHistoryProps) {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchReflections();
  }, []);

  const fetchReflections = async () => {
    try {
      const res = await fetch('/api/reflections');
      const data = await res.json();
      setReflections(data);
    } catch (error) {
      console.error('Failed to fetch reflections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reflection?')) return;

    try {
      await fetch(`/api/reflections?id=${id}`, { method: 'DELETE' });
      setReflections(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete reflection:', error);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Simple markdown renderer
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-base font-semibold text-stone-800 mt-4 mb-2">{line.slice(4)}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-lg font-semibold text-stone-900 mt-4 mb-2">{line.slice(3)}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-xl font-bold text-stone-900 mt-4 mb-3">{line.slice(2)}</h1>;
      }

      // Lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={i} className="ml-4 text-stone-700">{line.slice(2)}</li>;
      }

      // Bold and italic
      let content = line;
      content = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      content = content.replace(/\*(.+?)\*/g, '<em>$1</em>');

      // Empty lines
      if (!line.trim()) {
        return <br key={i} />;
      }

      return <p key={i} className="text-stone-700" dangerouslySetInnerHTML={{ __html: content }} />;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[#6f6352]">Loading reflections...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reflections.length === 0 ? (
        <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-8 text-center shadow-[0_8px_20px_rgba(95,67,31,0.1)]">
          <BookOpen className="mx-auto mb-3 h-12 w-12 text-[#c8b495]" />
          <h3 className="mb-1 text-lg font-semibold text-[#2f271c]">No reflections yet</h3>
          <p className="text-sm text-[#7a6b57]">Start your reflection journey today!</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {reflections.map((reflection) => {
            const isExpanded = expandedId === reflection.id;
            const preview = reflection.content.split('\n').find(line => line.trim() && !line.startsWith('#')) || '';

            return (
              <div
                key={reflection.id}
                className="overflow-hidden rounded-xl border border-[#dbc9ad] bg-white/85 transition-all hover:shadow-[0_8px_18px_rgba(95,67,31,0.12)]"
              >
                <div
                  className="cursor-pointer p-3"
                  onClick={() => toggleExpand(reflection.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#8e7e67]" />
                        <span className="text-sm font-semibold text-[#2f271c]">
                          {new Date(reflection.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(reflection);
                        }}
                        className="rounded-md p-1.5 text-[#8c7c66] transition-colors hover:bg-[#f4e6d1] hover:text-[#8a5529]"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(reflection.id);
                        }}
                        className="rounded-md p-1.5 text-[#8c7c66] transition-colors hover:bg-[#f8e5e2] hover:text-[#a63b31]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-[#8c7c66]" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-[#8c7c66]" />
                      )}
                    </div>
                  </div>

                  {!isExpanded && (
                    <p className="mt-1 line-clamp-2 text-xs text-[#6f6352]">
                      {preview}
                    </p>
                  )}
                </div>

                {isExpanded && (
                  <div className="border-t border-[#eadbc4] px-3 pb-3">
                    <div className="prose prose-sm mt-3 max-w-none">
                      {renderMarkdown(reflection.content)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
