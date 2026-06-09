"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

interface SearchableSelectProps {
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  emptyMessage?: string;
}

export function SearchableSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled = false,
  emptyMessage = "No matches found",
}: SearchableSelectProps) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [query, open]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery(value);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  function selectOption(option: string) {
    onChange(option);
    setQuery(option);
    setOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) setOpen(true);
        setHighlightIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        event.preventDefault();
        if (open && filtered[highlightIndex]) {
          selectOption(filtered[highlightIndex]);
        } else {
          setOpen(true);
        }
        break;
      case "Escape":
        setOpen(false);
        setQuery(value);
        break;
      case "Tab":
        setOpen(false);
        setQuery(value);
        break;
    }
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={`${id}-listbox`}
          disabled={disabled}
          value={query}
          placeholder={disabled ? "Select parent first" : placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (!e.target.value) onChange("");
          }}
          onFocus={() => !disabled && setOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        {open && !disabled && (
          <ul
            id={`${id}-listbox`}
            role="listbox"
            className="absolute top-full z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-2.5 text-sm text-slate-500">{emptyMessage}</li>
            ) : (
              filtered.map((option, index) => (
                <li
                  key={option}
                  role="option"
                  aria-selected={option === value}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectOption(option)}
                  onMouseEnter={() => setHighlightIndex(index)}
                  className={`cursor-pointer px-4 py-2.5 text-sm transition ${
                    index === highlightIndex
                      ? "bg-indigo-50 text-indigo-700"
                      : option === value
                        ? "bg-slate-50 text-slate-900"
                        : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {option}
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {!disabled && options.length > 0 && (
        <p className="text-xs text-slate-400">
          {filtered.length} of {options.length} options
        </p>
      )}
    </div>
  );
}
