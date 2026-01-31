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
        <div className="text-stone-600">Loading reflections...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Reflections List */}
      {reflections.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <BookOpen className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-900 mb-2">No reflections yet</h3>
          <p className="text-stone-600">Start your reflection journey today!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reflections.map((reflection) => {
            const isExpanded = expandedId === reflection.id;
            const preview = reflection.content.split('\n').find(line => line.trim() && !line.startsWith('#')) || '';

            return (
              <div
                key={reflection.id}
                className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-md transition-all"
              >
                {/* Header */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => toggleExpand(reflection.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Date */}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-stone-400" />
                        <span className="font-semibold text-stone-900">
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
                        className="p-2 text-stone-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(reflection.id);
                        }}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-stone-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-stone-400" />
                      )}
                    </div>
                  </div>

                  {/* Preview */}
                  {!isExpanded && (
                    <p className="mt-2 text-sm text-stone-600 line-clamp-2">
                      {preview}
                    </p>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-stone-100">
                    <div className="prose prose-sm max-w-none mt-4">
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
