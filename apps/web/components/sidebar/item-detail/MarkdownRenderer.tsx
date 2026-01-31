import { type ReactNode } from 'react';

export function renderMarkdown(text: string): ReactNode {
  if (!text) return null;

  return text.split('\n').map((line, i) => {
    if (line.startsWith('### ')) {
      return <h3 key={i} className="text-base font-semibold text-stone-800 mt-4 mb-2">{line.slice(4)}</h3>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={i} className="text-lg font-semibold text-stone-900 mt-4 mb-2">{line.slice(3)}</h2>;
    }
    if (line.startsWith('# ')) {
      return <h1 key={i} className="text-xl font-bold text-stone-900 mt-4 mb-3">{line.slice(2)}</h1>;
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      return <li key={i} className="ml-4 text-stone-700 text-sm">{line.slice(2)}</li>;
    }

    if (line.startsWith('- [ ] ')) {
      return <div key={i} className="flex items-center gap-2 ml-4 text-sm text-stone-700"><input type="checkbox" disabled /> {line.slice(6)}</div>;
    }
    if (line.startsWith('- [x] ')) {
      return <div key={i} className="flex items-center gap-2 ml-4 text-sm text-stone-700"><input type="checkbox" checked disabled /> {line.slice(6)}</div>;
    }

    let content = line;
    content = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    content = content.replace(/\*(.+?)\*/g, '<em>$1</em>');
    content = content.replace(/`(.+?)`/g, '<code class="px-1 py-0.5 bg-stone-100 rounded text-xs">$1</code>');

    if (!line.trim()) {
      return <br key={i} />;
    }

    return <p key={i} className="text-sm text-stone-700" dangerouslySetInnerHTML={{ __html: content }} />;
  });
}
