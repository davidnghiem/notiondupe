'use client';

import { useState, useRef, useEffect } from 'react';

interface FilterOption {
  value: string;
  label: string;
  color?: string;
}

interface MultiSelectFilterProps {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  onRemove?: () => void;
}

export function MultiSelectFilter({ label, options, selected, onChange, onRemove }: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  const summary = selected.length === 0
    ? label
    : selected.length <= 2
      ? `${label}: ${selected.map((v) => options.find((o) => o.value === v)?.label || v).join(', ')}`
      : `${label}: ${selected.length} selected`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-sm rounded-md border transition-colors ${
          selected.length > 0
            ? 'border-n-accent/40 bg-n-accent/10 text-n-text'
            : 'border-n-border bg-n-elevated text-n-text-secondary hover:text-n-text'
        }`}
      >
        <span className="truncate max-w-[200px]">{summary}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="flex-shrink-0 opacity-50">
          <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-n-bg border border-n-border rounded-lg shadow-lg z-50 py-1">
          {options.map((opt) => {
            const checked = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggle(opt.value)}
                className="flex items-center gap-2.5 w-full px-3 py-1.5 text-sm text-left hover:bg-n-hover transition-colors"
              >
                <span className={`w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-colors ${
                  checked ? 'bg-n-accent border-n-accent' : 'border-n-border'
                }`}>
                  {checked && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                {opt.color && (
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: opt.color }} />
                )}
                <span className="text-n-text">{opt.label}</span>
              </button>
            );
          })}

          {selected.length > 0 && (
            <>
              <div className="border-t border-n-border my-1" />
              <button
                onClick={() => onChange([])}
                className="w-full px-3 py-1.5 text-sm text-n-text-dim hover:text-n-text-secondary text-left hover:bg-n-hover"
              >
                Clear selection
              </button>
            </>
          )}

          {onRemove && (
            <button
              onClick={() => { onRemove(); setOpen(false); }}
              className="w-full px-3 py-1.5 text-sm text-n-text-dim hover:text-red-400 text-left hover:bg-n-hover"
            >
              Remove filter
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface FilterBarProps {
  availableFilters: {
    key: string;
    label: string;
    options: FilterOption[];
  }[];
  activeFilters: Record<string, string[]>;
  onChange: (key: string, selected: string[]) => void;
}

export function FilterBar({ availableFilters, activeFilters, onChange }: FilterBarProps) {
  const [showAdd, setShowAdd] = useState(false);
  const addRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (addRef.current && !addRef.current.contains(e.target as Node)) setShowAdd(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const activeKeys = Object.keys(activeFilters).filter((k) => activeFilters[k].length > 0 || availableFilters.some((f) => f.key === k));
  const visibleFilters = availableFilters.filter((f) => activeKeys.includes(f.key));
  const hiddenFilters = availableFilters.filter((f) => !activeKeys.includes(f.key));

  const addFilter = (key: string) => {
    onChange(key, []);
    setShowAdd(false);
  };

  const removeFilter = (key: string) => {
    onChange(key, []);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {visibleFilters.map((f) => (
        <MultiSelectFilter
          key={f.key}
          label={f.label}
          options={f.options}
          selected={activeFilters[f.key] || []}
          onChange={(sel) => onChange(f.key, sel)}
          onRemove={() => removeFilter(f.key)}
        />
      ))}

      {hiddenFilters.length > 0 && (
        <div ref={addRef} className="relative">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm text-n-text-dim hover:text-n-text-secondary rounded-md hover:bg-n-hover transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 2.5V9.5M2.5 6H9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Filter
          </button>

          {showAdd && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-n-bg border border-n-border rounded-lg shadow-lg z-50 py-1">
              {hiddenFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => addFilter(f.key)}
                  className="w-full px-3 py-1.5 text-sm text-n-text text-left hover:bg-n-hover transition-colors"
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {activeKeys.some((k) => (activeFilters[k]?.length || 0) > 0) && (
        <button
          onClick={() => activeKeys.forEach((k) => onChange(k, []))}
          className="px-2 py-1 text-xs text-n-text-dim hover:text-n-text-secondary"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
