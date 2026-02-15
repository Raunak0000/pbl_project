import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface CommandPaletteItem {
  id: string;
  label: string;
  description?: string;
  group?: string;
  keywords?: string[];
  onSelect: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandPaletteItem[];
  placeholder?: string;
  hint?: string;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
  items,
  placeholder = 'Search commands...'
}) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;

    return items.filter(item => {
      const haystack = [
        item.label,
        item.description,
        item.group,
        ...(item.keywords || [])
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [items, query]);

  const groupedItems = useMemo(() => {
    const groupMap = new Map<string, CommandPaletteItem[]>();
    filteredItems.forEach(item => {
      const key = item.group || 'Commands';
      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)?.push(item);
    });
    return Array.from(groupMap.entries());
  }, [filteredItems]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      // Wait for mount
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => {
    if (activeIndex >= filteredItems.length) {
      setActiveIndex(0);
    }
  }, [filteredItems, activeIndex]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onOpenChange(false);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(prev => (prev + 1) % Math.max(filteredItems.length, 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(prev => (prev - 1 + Math.max(filteredItems.length, 1)) % Math.max(filteredItems.length, 1));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const item = filteredItems[activeIndex];
      if (item) {
        item.onSelect();
        onOpenChange(false);
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Palette */}
      <div className="relative w-full max-w-2xl transform overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-2xl transition-all">
        <div className="flex items-center border-b border-slate-200 dark:border-white/5 px-4">
          <input
            ref={inputRef}
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 font-sans"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
          {filteredItems.length === 0 ? (
            <div className="py-14 text-center text-sm text-slate-500 dark:text-slate-400">
              No results found.
            </div>
          ) : (
            <div className="p-2">
              {groupedItems.map(([group, items]) => (
                <div key={group} className="mb-2">
                  <div className="px-2 py-1.5 text-[10px] font-mono font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {group}
                  </div>
                  {items.map((item) => {
                    const flatIndex = filteredItems.findIndex(i => i.id === item.id);
                    const isActive = flatIndex === activeIndex;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          item.onSelect();
                          onOpenChange(false);
                        }}
                        onMouseEnter={() => setActiveIndex(flatIndex)}
                        className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-sm transition-colors ${isActive
                            ? 'bg-slate-100 dark:bg-accent-primary/10 text-slate-900 dark:text-accent-primary'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.label}</span>
                          {isActive && <span className="h-1.5 w-1.5 rounded-full bg-accent-primary shadow-[0_0_8px_rgba(212,255,0,0.5)]"></span>}
                        </div>
                        {item.description && (
                          <span className={`text-xs ml-4 truncate max-w-[200px] ${isActive ? 'text-slate-600 dark:text-accent-primary/70' : 'text-slate-400 dark:text-slate-500'}`}>
                            {item.description}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end px-4 py-2 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20">
          <div className="flex gap-4 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5">↵</kbd>
              select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5">↓</kbd>
              <kbd className="px-1 py-0.5 rounded border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5">↑</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5">esc</kbd>
              close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
