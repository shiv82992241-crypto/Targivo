import React, { useState } from 'react';
import { Target as TargetIcon, Sun, Moon, Plus, Sparkles, Download, Upload, RotateCcw } from 'lucide-react';
import { Quote, getRandomQuote } from '../utils/quotes';

interface HeaderProps {
  onOpenNewTargetModal: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetSampleData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewTargetModal,
  theme,
  onToggleTheme,
  onExportData,
  onImportData,
  onResetSampleData,
}) => {
  const [quote, setQuote] = useState<Quote>(() => getRandomQuote());
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Today's formatted date
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const handleShuffleQuote = () => {
    setQuote(getRandomQuote());
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      {/* Top Bar Contract: 3 zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
              <TargetIcon className="w-5 h-5" />
            </div>
            <a href="/" className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              Student Target Tracker
            </a>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Dashboard
            </a>
            <a href="#targets" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Academic Targets
            </a>
            <a href="#study-tools" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Pomodoro & Scratchpad
            </a>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Quick Data Dropdown / Utilities */}
            <div className="hidden sm:flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
              <button
                onClick={onExportData}
                title="Backup targets as JSON"
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Import targets JSON"
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={onImportData}
              />
              <button
                onClick={onResetSampleData}
                title="Reset to sample targets"
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={onOpenNewTargetModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Target</span>
            </button>
          </div>
        </div>
      </div>

      {/* Welcoming Sub-Banner: Date & Motivational Quote */}
      <div className="bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-200/60 dark:border-slate-800/60 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
          {/* Left: Current date */}
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-white">{todayFormatted}</span>
            <span className="text-slate-400 dark:text-slate-500">·</span>
            <span className="text-slate-500 dark:text-slate-400">Academic Semester Term</span>
          </div>

          {/* Right: Motivational Quote */}
          <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300 italic max-w-2xl">
            <span className="text-sky-600 dark:text-sky-400 not-italic shrink-0">“</span>
            <span className="truncate">
              {quote.text} <strong className="not-italic font-semibold text-slate-700 dark:text-slate-300">— {quote.author}</strong>
            </span>
            <button
              onClick={handleShuffleQuote}
              title="Next motivational quote"
              className="not-italic shrink-0 p-1 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 rounded transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
