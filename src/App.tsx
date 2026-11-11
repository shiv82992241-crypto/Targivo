/**
 * Student Target Tracker - Complete Self-Contained Application
 * Includes Dashboard, Milestone CRUD, Step Stepper & Slider,
 * Pomodoro Focus Timer with Web Audio Chimes, Daily Scratchpad,
 * Canvas Confetti, and LocalStorage Persistence.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Target as TargetIcon,
  Sun,
  Moon,
  Plus,
  Minus,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  CircleDashed,
  Flame,
  AlertCircle,
  X,
  Calendar,
  BookOpen,
  Clock,
  Award,
  Layers,
  FileText,
  Check,
  Edit3,
  Trash2,
  Timer,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List as ListIcon,
  ArrowUpDown,
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Coffee,
  Brain,
  CheckSquare,
  FileEdit,
  Copy,
  CheckCheck,
} from 'lucide-react';

/* ==========================================================================
   1. TYPES & DATA CONTRACTS
   ========================================================================== */

export type PriorityLevel = 'low' | 'medium' | 'high';

export type TargetType = 
  | 'exam_grade' 
  | 'study_hours' 
  | 'book_chapters' 
  | 'assignment' 
  | 'practice_tests' 
  | 'custom_steps';

export interface Target {
  id: string;
  title: string;
  subject: string;
  targetType: TargetType;
  deadline: string; // YYYY-MM-DD
  priority: PriorityLevel;
  totalSteps: number;
  currentSteps: number;
  unit: string;
  completed: boolean;
  notes?: string;
  createdAt: number;
  completedAt?: number;
}

export interface DailyTodo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

export interface PomodoroSettings {
  workDuration: number; // in seconds, default 25 * 60
  shortBreakDuration: number; // in seconds, default 5 * 60
  longBreakDuration: number; // in seconds, default 15 * 60
  soundEnabled: boolean;
  autoStartBreaks: boolean;
}

export interface PomodoroStats {
  sessionsCompletedToday: number;
  totalFocusMinutesToday: number;
  lastDate: string; // YYYY-MM-DD
}

export interface Quote {
  text: string;
  author: string;
}

/* ==========================================================================
   2. CONSTANTS & MOTIVATIONAL QUOTES
   ========================================================================== */

export const MOTIVATIONAL_QUOTES: Quote[] = [
  {
    text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    author: "Mahatma Gandhi",
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
  },
  {
    text: "Education is not the learning of facts, but the training of the mind to think.",
    author: "Albert Einstein",
  },
  {
    text: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King",
  },
  {
    text: "Small daily improvements over time lead to stunning results.",
    author: "Robin Sharma",
  },
  {
    text: "Focus on progress, not perfection.",
    author: "Bill Phillips",
  },
  {
    text: "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more.",
    author: "Marie Curie",
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
  },
  {
    text: "Discipline is the bridge between goals and accomplishment.",
    author: "Jim Rohn",
  },
  {
    text: "I would rather have questions that can't be answered than answers that can't be questioned.",
    author: "Richard Feynman",
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    text: "Study while others are sleeping; work while others are loafing; prepare while others are playing.",
    author: "William Arthur Ward",
  },
];

export function getRandomQuote(): Quote {
  const index = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[index];
}

/* ==========================================================================
   3. AUDIO SYNTHESIZER & CONFETTI UTILITIES
   ========================================================================== */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playTimerFinishSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.12);

      gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.12);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + index * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.12 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + index * 0.12);
      osc.stop(ctx.currentTime + index * 0.12 + 0.7);
    });
  } catch {
    // Graceful fallback
  }
}

export function playTargetCompleteSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);

      gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + index * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + index * 0.08);
      osc.stop(ctx.currentTime + index * 0.08 + 0.5);
    });
  } catch {
    // Ignore audio errors
  }
}

export function playSoftTickSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
  } catch {
    // Ignore
  }
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  rotation: number;
  vRot: number;
}

export function triggerConfetti(originX?: number, originY?: number): void {
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const startX = originX ?? width / 2;
  const startY = originY ?? height * 0.4;

  const colors = ['#38bdf8', '#0ea5e9', '#10b981', '#34d399', '#6366f1', '#a855f7', '#f43f5e', '#fbbf24'];
  const particleCount = 65;
  const particles: Particle[] = [];

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 8;
    particles.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: 5 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: 0.015 + Math.random() * 0.02,
      rotation: Math.random() * Math.PI,
      vRot: (Math.random() - 0.5) * 0.2,
    });
  }

  let animationFrameId: number;

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    let activeCount = 0;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22;
      p.vx *= 0.98;
      p.alpha -= p.decay;
      p.rotation += p.vRot;

      if (p.alpha > 0) {
        activeCount++;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
    }

    if (activeCount > 0) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrameId);
      canvas.remove();
    }
  }

  animationFrameId = requestAnimationFrame(render);
}

/* ==========================================================================
   4. LOCALSTORAGE MANAGEMENT & SAMPLE SEEDS
   ========================================================================== */

const STORAGE_KEYS = {
  TARGETS: 'stt_targets_v1',
  TODOS: 'stt_todos_v1',
  SCRATCHPAD: 'stt_scratchpad_v1',
  POMO_SETTINGS: 'stt_pomo_settings_v1',
  POMO_STATS: 'stt_pomo_stats_v1',
  THEME: 'stt_theme_v1',
};

export const INITIAL_TARGETS: Target[] = [
  {
    id: 'target-1',
    title: 'Calculus II: Integration Techniques & Taylor Series',
    subject: 'Mathematics',
    targetType: 'book_chapters',
    deadline: '2026-11-05',
    priority: 'high',
    totalSteps: 6,
    currentSteps: 4,
    unit: 'Chapters',
    completed: false,
    notes: 'Finish exercises on integration by parts and convergence tests before Thursday lecture.',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'target-2',
    title: 'Classical Mechanics Midterm Preparation',
    subject: 'Physics',
    targetType: 'exam_grade',
    deadline: '2026-11-09',
    priority: 'high',
    totalSteps: 5,
    currentSteps: 3,
    unit: 'Mock Sets',
    completed: false,
    notes: 'Targeting 90%+ on rotational dynamics and harmonic oscillators.',
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'target-3',
    title: 'Data Structures: Balanced Trees & Graph Search',
    subject: 'Computer Science',
    targetType: 'study_hours',
    deadline: '2026-11-12',
    priority: 'medium',
    totalSteps: 12,
    currentSteps: 8,
    unit: 'Hours',
    completed: false,
    notes: 'Implement Red-Black tree rebalancing and Dijkstra shortest-path algorithms.',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'target-4',
    title: 'Comparative Literature Term Paper Draft',
    subject: 'Literature',
    targetType: 'assignment',
    deadline: '2026-11-18',
    priority: 'medium',
    totalSteps: 4,
    currentSteps: 4,
    unit: 'Draft Sections',
    completed: true,
    notes: 'Completed 2,500-word analysis with peer citations formatted in MLA.',
    createdAt: Date.now() - 86400000 * 6,
    completedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'target-5',
    title: 'Organic Chemistry Lab Synthesis Report',
    subject: 'Chemistry',
    targetType: 'assignment',
    deadline: '2026-10-31',
    priority: 'low',
    totalSteps: 5,
    currentSteps: 5,
    unit: 'Sections',
    completed: true,
    notes: 'Spectroscopy graphs and yield calculations submitted to canvas.',
    createdAt: Date.now() - 86400000 * 7,
    completedAt: Date.now() - 86400000 * 2,
  },
];

export const INITIAL_TODOS: DailyTodo[] = [
  {
    id: 'todo-1',
    text: 'Review Chapter 5 practice questions for Calculus',
    completed: true,
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'todo-2',
    text: 'Formulate discussion question for Physics seminar',
    completed: false,
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'todo-3',
    text: 'Complete 2 Pomodoro sessions on graph search algorithms',
    completed: false,
    createdAt: Date.now() - 3600000 * 1,
  },
];

export const INITIAL_SCRATCHPAD = `# Today's Study Priorities
- Memorize Euler-Lagrange equations formula derivation
- Check office hours for Prof. Martinez (Wed 2:00 PM)
- Submit lab notebook scan before Friday midnight

Key takeaway: "Deep focus beats long distracted hours."`;

export const DEFAULT_POMO_SETTINGS: PomodoroSettings = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  soundEnabled: true,
  autoStartBreaks: false,
};

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadStoredTargets(): Target[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TARGETS);
    if (!raw) return INITIAL_TARGETS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_TARGETS;
  } catch {
    return INITIAL_TARGETS;
  }
}

export function saveStoredTargets(targets: Target[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(targets));
  } catch {
    // Ignore
  }
}

export function loadStoredTodos(): DailyTodo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TODOS);
    if (!raw) return INITIAL_TODOS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_TODOS;
  } catch {
    return INITIAL_TODOS;
  }
}

export function saveStoredTodos(todos: DailyTodo[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
  } catch {
    // Ignore
  }
}

export function loadStoredScratchpad(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCRATCHPAD);
    return raw !== null ? raw : INITIAL_SCRATCHPAD;
  } catch {
    return INITIAL_SCRATCHPAD;
  }
}

export function saveStoredScratchpad(text: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SCRATCHPAD, text);
  } catch {
    // Ignore
  }
}

export function loadStoredPomoSettings(): PomodoroSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POMO_SETTINGS);
    if (!raw) return DEFAULT_POMO_SETTINGS;
    return { ...DEFAULT_POMO_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_POMO_SETTINGS;
  }
}

export function saveStoredPomoSettings(settings: PomodoroSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.POMO_SETTINGS, JSON.stringify(settings));
  } catch {
    // Ignore
  }
}

export function loadStoredPomoStats(): PomodoroStats {
  const today = getTodayDateString();
  const defaultStats: PomodoroStats = {
    sessionsCompletedToday: 0,
    totalFocusMinutesToday: 0,
    lastDate: today,
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POMO_STATS);
    if (!raw) return defaultStats;
    const parsed: PomodoroStats = JSON.parse(raw);
    if (parsed.lastDate !== today) return defaultStats;
    return parsed;
  } catch {
    return defaultStats;
  }
}

export function saveStoredPomoStats(stats: PomodoroStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.POMO_STATS, JSON.stringify(stats));
  } catch {
    // Ignore
  }
}

export function loadStoredTheme(): 'light' | 'dark' {
  try {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (theme === 'dark' || theme === 'light') return theme;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveStoredTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch {
    // Ignore
  }
}

/* ==========================================================================
   5. HEADER COMPONENT
   ========================================================================== */

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
              <TargetIcon className="w-5 h-5" />
            </div>
            <a href="/" className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              Student Target Tracker
            </a>
          </div>

          {/* Navigation Links */}
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

          {/* Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

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

      {/* Sub-Banner: Date & Motivational Quote */}
      <div className="bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-200/60 dark:border-slate-800/60 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-white">{todayFormatted}</span>
            <span className="text-slate-400 dark:text-slate-500">·</span>
            <span className="text-slate-500 dark:text-slate-400">Academic Semester Term</span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300 italic max-w-2xl">
            <span className="text-sky-600 dark:text-sky-400 not-italic shrink-0">“</span>
            <span className="truncate">
              {quote.text} <strong className="not-italic font-semibold text-slate-700 dark:text-slate-300">— {quote.author}</strong>
            </span>
            <button
              onClick={() => setQuote(getRandomQuote())}
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

/* ==========================================================================
   6. DASHBOARD SUMMARY COMPONENT
   ========================================================================== */

interface DashboardSummaryProps {
  targets: Target[];
  onOpenNewTarget: () => void;
  onFilterStatus?: (status: 'all' | 'active' | 'completed') => void;
  activeStatusFilter?: 'all' | 'active' | 'completed';
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  targets,
  onOpenNewTarget,
  onFilterStatus,
  activeStatusFilter = 'all',
}) => {
  const totalTargets = targets.length;
  const completedTargets = targets.filter(t => t.completed).length;
  const activeTargets = totalTargets - completedTargets;
  const overallPercentage = totalTargets === 0 ? 0 : Math.round((completedTargets / totalTargets) * 100);

  const totalPossibleSteps = targets.reduce((acc, t) => acc + (t.totalSteps || 1), 0);
  const currentTotalSteps = targets.reduce((acc, t) => {
    if (t.completed) return acc + (t.totalSteps || 1);
    return acc + Math.min(t.currentSteps || 0, t.totalSteps || 1);
  }, 0);
  const detailedStepPercentage = totalPossibleSteps === 0 ? 0 : Math.round((currentTotalSteps / totalPossibleSteps) * 100);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const urgentTargets = targets.filter(t => {
    if (t.completed || !t.deadline) return false;
    const [year, month, day] = t.deadline.split('-').map(Number);
    const deadlineDate = new Date(year, month - 1, day);
    const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 2;
  });

  const radius = 48;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallPercentage / 100) * circumference;

  return (
    <div id="dashboard" className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
      {/* Visual Velocity Meter Card */}
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Target Completion Velocity
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cumulative progress across all active courses
            </p>
          </div>
          <span className="text-xs font-mono font-medium tabular-nums text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
            {completedTargets}/{totalTargets} Done
          </span>
        </div>

        <div className="flex items-center gap-6 my-2">
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-32 h-32 -rotate-90 transform" viewBox="0 0 116 116">
              <circle
                cx="58"
                cy="58"
                r={radius}
                className="text-slate-100 dark:text-slate-800"
                strokeWidth={strokeWidth}
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="58"
                cy="58"
                r={radius}
                className="text-sky-500 dark:text-sky-400 transition-all duration-700 ease-out"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
                {overallPercentage}%
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
                Completed
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>Granular Step Progress</span>
              <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                {detailedStepPercentage}%
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${detailedStepPercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {totalTargets === 0
                ? "No targets established yet. Set your first semester target to begin tracking."
                : overallPercentage === 100
                ? "Outstanding! You have accomplished all established targets."
                : `${activeTargets} target${activeTargets === 1 ? '' : 's'} remain in motion. Steady persistence yields mastery.`}
            </p>
          </div>
        </div>

        {urgentTargets.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-950/30 px-3 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                <strong>{urgentTargets.length} target{urgentTargets.length === 1 ? '' : 's'}</strong> due within 48 hours
              </span>
            </div>
            <span className="text-[11px] underline cursor-pointer hover:text-amber-800" onClick={() => onFilterStatus?.('active')}>
              Review
            </span>
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Targets */}
        <div 
          onClick={() => onFilterStatus?.('all')}
          className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all hover:border-sky-300 dark:hover:border-sky-700 ${
            activeStatusFilter === 'all' ? 'border-sky-500 ring-1 ring-sky-500/20' : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Targets
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
              {totalTargets}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Active & archived goals
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-sky-600 dark:text-sky-400 flex items-center gap-1 font-medium">
            <span>View all items</span>
            <span aria-hidden="true">&rarr;</span>
          </div>
        </div>

        {/* Targets Completed */}
        <div 
          onClick={() => onFilterStatus?.('completed')}
          className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all hover:border-emerald-300 dark:hover:border-emerald-700 ${
            activeStatusFilter === 'completed' ? 'border-emerald-500 ring-1 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Targets Completed
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              {completedTargets}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {overallPercentage}% completion rate
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <span>View completed</span>
            <span aria-hidden="true">&rarr;</span>
          </div>
        </div>

        {/* Active Targets */}
        <div 
          onClick={() => onFilterStatus?.('active')}
          className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all hover:border-sky-300 dark:hover:border-sky-700 ${
            activeStatusFilter === 'active' ? 'border-sky-500 ring-1 ring-sky-500/20' : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Targets
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <CircleDashed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
              {activeTargets}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Currently in progress
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-sky-600 dark:text-sky-400 flex items-center justify-between font-medium">
            <span>Manage active</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onOpenNewTarget();
              }}
              className="hover:underline text-xs"
            >
              + New
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   7. TARGET CARD COMPONENT (STEPPERS, SLIDERS, PRIORITY)
   ========================================================================== */

interface TargetCardProps {
  target: Target;
  onToggleComplete: (id: string) => void;
  onUpdateSteps: (id: string, newSteps: number) => void;
  onEdit: (target: Target) => void;
  onDelete: (id: string) => void;
  onStartFocus: (target: Target) => void;
  isCompactList?: boolean;
}

export const TargetCard: React.FC<TargetCardProps> = ({
  target,
  onToggleComplete,
  onUpdateSteps,
  onEdit,
  onDelete,
  onStartFocus,
  isCompactList = false,
}) => {
  const percentage = target.totalSteps > 0
    ? Math.round((target.currentSteps / target.totalSteps) * 100)
    : 0;

  const deadlineDate = new Date(target.deadline + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let deadlineStatusText = '';
  let isOverdue = false;
  let isDueSoon = false;

  if (target.completed) {
    deadlineStatusText = 'Target Achieved';
  } else if (diffDays < 0) {
    deadlineStatusText = `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`;
    isOverdue = true;
  } else if (diffDays === 0) {
    deadlineStatusText = 'Due Today';
    isDueSoon = true;
  } else if (diffDays === 1) {
    deadlineStatusText = 'Due Tomorrow';
    isDueSoon = true;
  } else {
    deadlineStatusText = `${diffDays} days left`;
  }

  const formattedDeadlineDate = deadlineDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!target.completed) {
      playTargetCompleteSound();
      triggerConfetti(e.clientX, e.clientY);
    } else {
      playSoftTickSound();
    }
    onToggleComplete(target.id);
  };

  const handleStepIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (target.currentSteps < target.totalSteps) {
      const nextSteps = target.currentSteps + 1;
      if (nextSteps === target.totalSteps) {
        playTargetCompleteSound();
        triggerConfetti(e.clientX, e.clientY);
      } else {
        playSoftTickSound();
      }
      onUpdateSteps(target.id, nextSteps);
    }
  };

  const handleStepDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (target.currentSteps > 0) {
      playSoftTickSound();
      onUpdateSteps(target.id, target.currentSteps - 1);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      if (val === target.totalSteps && !target.completed) {
        playTargetCompleteSound();
        triggerConfetti();
      }
      onUpdateSteps(target.id, val);
    }
  };

  const renderPriorityBadge = (level: PriorityLevel) => {
    switch (level) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60 px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60 px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Medium
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 px-2 py-0.5 rounded-md">
            Low
          </span>
        );
    }
  };

  if (isCompactList) {
    return (
      <div 
        className={`group bg-white dark:bg-slate-900 border rounded-xl p-3.5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          target.completed
            ? 'border-slate-200/70 dark:border-slate-800/70 opacity-75'
            : isOverdue
            ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/15'
            : 'border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={handleCheckboxClick}
            aria-label={`Toggle target ${target.title}`}
            className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border transition-all ${
              target.completed
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                : 'border-slate-300 dark:border-slate-600 hover:border-sky-500 dark:hover:border-sky-400 bg-white dark:bg-slate-800'
            }`}
          >
            {target.completed && <Check className="w-4 h-4 stroke-[3]" />}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold truncate ${
                target.completed 
                  ? 'line-through text-slate-400 dark:text-slate-500' 
                  : 'text-slate-900 dark:text-white'
              }`}>
                {target.title}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>{target.subject}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{formattedDeadlineDate}</span>
              <span aria-hidden="true">·</span>
              <span className={isOverdue ? 'text-rose-600 font-medium' : isDueSoon ? 'text-amber-600 font-medium' : ''}>
                {deadlineStatusText}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {renderPriorityBadge(target.priority)}

          <div className="flex items-center gap-2">
            <button
              onClick={handleStepDecrement}
              disabled={target.completed || target.currentSteps <= 0}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300 min-w-20 text-center">
              {target.currentSteps} / {target.totalSteps} {target.unit}
            </span>
            <button
              onClick={handleStepIncrement}
              disabled={target.completed || target.currentSteps >= target.totalSteps}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-3">
            {!target.completed && (
              <button
                onClick={() => onStartFocus(target)}
                title="Start Pomodoro focus session for this target"
                className="p-1.5 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/50 rounded-lg transition-colors"
              >
                <Timer className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onEdit(target)}
              title="Edit target"
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(target.id)}
              title="Delete target"
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group bg-white dark:bg-slate-900 border rounded-2xl p-5 transition-all flex flex-col justify-between shadow-xs ${
        target.completed
          ? 'border-slate-200/70 dark:border-slate-800/70 opacity-80'
          : isOverdue
          ? 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-400/20'
          : isDueSoon
          ? 'border-amber-300 dark:border-amber-800/60'
          : 'border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <button
              onClick={handleCheckboxClick}
              aria-label={`Toggle target ${target.title}`}
              className={`w-6 h-6 mt-0.5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                target.completed
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                  : 'border-slate-300 dark:border-slate-600 hover:border-sky-500 dark:hover:border-sky-400 bg-white dark:bg-slate-800'
              }`}
            >
              {target.completed && <Check className="w-4 h-4 stroke-[3]" />}
            </button>

            <div className="min-w-0 flex-1">
              <h3 className={`text-sm font-semibold leading-snug ${
                target.completed
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-white'
              }`}>
                {target.title}
              </h3>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">{target.subject}</span>
                <span aria-hidden="true">·</span>
                <span className="capitalize">{target.targetType.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            {renderPriorityBadge(target.priority)}
          </div>
        </div>

        {target.notes && (
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 line-clamp-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
            {target.notes}
          </p>
        )}
      </div>

      <div className="my-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-medium text-slate-600 dark:text-slate-300">
            Progress ({target.currentSteps} of {target.totalSteps} {target.unit})
          </span>
          <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">
            {percentage}%
          </span>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              target.completed
                ? 'bg-emerald-500'
                : percentage >= 75
                ? 'bg-emerald-500'
                : percentage >= 40
                ? 'bg-sky-500'
                : 'bg-sky-400'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleStepDecrement}
            disabled={target.completed || target.currentSteps <= 0}
            className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <input
            type="range"
            min="0"
            max={target.totalSteps}
            value={target.currentSteps}
            disabled={target.completed}
            onChange={handleSliderChange}
            aria-label={`Progress slider for ${target.title}`}
            className="flex-1 accent-sky-600 dark:accent-sky-400 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />

          <button
            onClick={handleStepIncrement}
            disabled={target.completed || target.currentSteps >= target.totalSteps}
            className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          {isOverdue ? (
            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          ) : (
            <Calendar className="w-3.5 h-3.5 shrink-0" />
          )}
          <span className="font-mono tabular-nums">{formattedDeadlineDate}</span>
          <span aria-hidden="true">·</span>
          <span className={
            isOverdue 
              ? 'text-rose-600 dark:text-rose-400 font-semibold' 
              : isDueSoon 
              ? 'text-amber-600 dark:text-amber-400 font-medium' 
              : 'text-slate-500 dark:text-slate-400'
          }>
            {deadlineStatusText}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!target.completed && (
            <button
              onClick={() => onStartFocus(target)}
              title="Launch Pomodoro session for this target"
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-sky-700 dark:text-sky-300 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 rounded-md transition-colors"
            >
              <Timer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Focus</span>
            </button>
          )}

          <button
            onClick={() => onEdit(target)}
            title="Edit target"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDelete(target.id)}
            title="Delete target"
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   8. TARGET LIST COMPONENT (SEPARATED ACTIVE/COMPLETED, FILTERS)
   ========================================================================== */

interface TargetListProps {
  targets: Target[];
  onToggleComplete: (id: string) => void;
  onUpdateSteps: (id: string, newSteps: number) => void;
  onEdit: (target: Target) => void;
  onDelete: (id: string) => void;
  onStartFocus: (target: Target) => void;
  onOpenNewTarget: () => void;
  statusFilter: 'all' | 'active' | 'completed';
  onStatusFilterChange: (status: 'all' | 'active' | 'completed') => void;
}

type SortOption = 'deadline-asc' | 'deadline-desc' | 'priority' | 'progress' | 'title';

export const TargetList: React.FC<TargetListProps> = ({
  targets,
  onToggleComplete,
  onUpdateSteps,
  onEdit,
  onDelete,
  onStartFocus,
  onOpenNewTarget,
  statusFilter,
  onStatusFilterChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('deadline-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    targets.forEach(t => {
      if (t.subject) set.add(t.subject);
    });
    return Array.from(set).sort();
  }, [targets]);

  const activeCount = useMemo(() => targets.filter(t => !t.completed).length, [targets]);
  const completedCount = useMemo(() => targets.filter(t => t.completed).length, [targets]);

  const filteredTargets = useMemo(() => {
    return targets
      .filter(t => {
        if (statusFilter === 'active' && t.completed) return false;
        if (statusFilter === 'completed' && !t.completed) return false;
        if (selectedSubject !== 'all' && t.subject !== selectedSubject) return false;
        if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchSubject = t.subject.toLowerCase().includes(q);
          const matchNotes = t.notes ? t.notes.toLowerCase().includes(q) : false;
          if (!matchTitle && !matchSubject && !matchNotes) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'deadline-asc') return a.deadline.localeCompare(b.deadline);
        if (sortBy === 'deadline-desc') return b.deadline.localeCompare(a.deadline);
        if (sortBy === 'priority') {
          const weight: Record<PriorityLevel, number> = { high: 3, medium: 2, low: 1 };
          return weight[b.priority] - weight[a.priority];
        }
        if (sortBy === 'progress') {
          const pctA = a.totalSteps > 0 ? a.currentSteps / a.totalSteps : 0;
          const pctB = b.totalSteps > 0 ? b.currentSteps / b.totalSteps : 0;
          return pctB - pctA;
        }
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [targets, statusFilter, selectedSubject, selectedPriority, searchQuery, sortBy]);

  const activeFiltered = useMemo(() => filteredTargets.filter(t => !t.completed), [filteredTargets]);
  const completedFiltered = useMemo(() => filteredTargets.filter(t => t.completed), [filteredTargets]);

  return (
    <section id="targets" className="mb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Academic Targets
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage course milestones, exam prep, and study chapters
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid layout"
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="List layout"
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenNewTarget}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 rounded-lg shadow-sm transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New Target</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700/60 overflow-x-auto">
            <button
              onClick={() => onStatusFilterChange('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              All ({targets.length})
            </button>
            <button
              onClick={() => onStatusFilterChange('active')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                statusFilter === 'active'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <CircleDashed className="w-3.5 h-3.5 text-sky-500" />
              <span>Active ({activeCount})</span>
            </button>
            <button
              onClick={() => onStatusFilterChange('completed')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                statusFilter === 'completed'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Completed ({completedCount})</span>
            </button>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search targets by course, title, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">All Subjects</option>
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <div className="flex items-center gap-1.5 ml-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
            >
              <option value="deadline-asc">Deadline (Soonest first)</option>
              <option value="deadline-desc">Deadline (Latest first)</option>
              <option value="priority">Priority (High to Low)</option>
              <option value="progress">Progress % (Highest)</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Target Rendering */}
      {filteredTargets.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            No targets found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || selectedSubject !== 'all' || selectedPriority !== 'all'
              ? 'Try adjusting your search criteria or resetting the filters.'
              : 'You have no targets in this category yet. Click below to add your first academic target.'}
          </p>
          <button
            onClick={onOpenNewTarget}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Target</span>
          </button>
        </div>
      ) : statusFilter === 'all' ? (
        <div className="space-y-8">
          {activeFiltered.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Active Targets ({activeFiltered.length})
                  </h3>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  In progress
                </span>
              </div>

              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                {activeFiltered.map((target) => (
                  <TargetCard
                    key={target.id}
                    target={target}
                    onToggleComplete={onToggleComplete}
                    onUpdateSteps={onUpdateSteps}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStartFocus={onStartFocus}
                    isCompactList={viewMode === 'list'}
                  />
                ))}
              </div>
            </div>
          )}

          {completedFiltered.length > 0 && (
            <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Completed Targets ({completedFiltered.length})
                  </h3>
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {completedFiltered.length} accomplished
                </span>
              </div>

              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                {completedFiltered.map((target) => (
                  <TargetCard
                    key={target.id}
                    target={target}
                    onToggleComplete={onToggleComplete}
                    onUpdateSteps={onUpdateSteps}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStartFocus={onStartFocus}
                    isCompactList={viewMode === 'list'}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {filteredTargets.map((target) => (
            <TargetCard
              key={target.id}
              target={target}
              onToggleComplete={onToggleComplete}
              onUpdateSteps={onUpdateSteps}
              onEdit={onEdit}
              onDelete={onDelete}
              onStartFocus={onStartFocus}
              isCompactList={viewMode === 'list'}
            />
          ))}
        </div>
      )}
    </section>
  );
};

/* ==========================================================================
   9. POMODORO TIMER WIDGET (AUDIO/VISUAL ALERTS, TARGET LINKING)
   ========================================================================== */

interface PomodoroTimerProps {
  targets: Target[];
  selectedTargetId: string | null;
  onSelectTarget: (id: string | null) => void;
  onIncrementTargetStep?: (id: string) => void;
  settings: PomodoroSettings;
  onUpdateSettings: (settings: PomodoroSettings) => void;
  stats: PomodoroStats;
  onUpdateStats: (stats: PomodoroStats) => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  targets,
  selectedTargetId,
  onSelectTarget,
  onIncrementTargetStep,
  settings,
  onUpdateSettings,
  stats,
  onUpdateStats,
}) => {
  const [mode, setMode] = useState<PomodoroMode>('work');
  const [timeLeft, setTimeLeft] = useState<number>(settings.workDuration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [finishedBanner, setFinishedBanner] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeTarget = targets.find(t => t.id === selectedTargetId);

  const currentTotalDuration = 
    mode === 'work' 
      ? settings.workDuration 
      : mode === 'shortBreak' 
      ? settings.shortBreakDuration 
      : settings.longBreakDuration;

  const switchMode = (newMode: PomodoroMode) => {
    setIsRunning(false);
    setMode(newMode);
    setFinishedBanner(null);
    if (newMode === 'work') setTimeLeft(settings.workDuration);
    else if (newMode === 'shortBreak') setTimeLeft(settings.shortBreakDuration);
    else setTimeLeft(settings.longBreakDuration);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, selectedTargetId]);

  useEffect(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    if (isRunning) {
      const modeLabel = mode === 'work' ? 'Focus' : 'Break';
      document.title = `(${formatted}) ${modeLabel} - Student Target Tracker`;
    } else {
      document.title = 'Student Target Tracker';
    }
  }, [timeLeft, isRunning, mode]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (settings.soundEnabled) playTimerFinishSound();
    triggerConfetti();

    if (mode === 'work') {
      const addedMinutes = Math.round(settings.workDuration / 60);
      const newStats: PomodoroStats = {
        sessionsCompletedToday: stats.sessionsCompletedToday + 1,
        totalFocusMinutesToday: stats.totalFocusMinutesToday + addedMinutes,
        lastDate: getTodayDateString(),
      };
      onUpdateStats(newStats);
      setFinishedBanner('Focus session complete! Take a well-earned break.');
    } else {
      setFinishedBanner('Break finished! Ready to resume your learning target?');
    }
  };

  const togglePlay = () => {
    playSoftTickSound();
    setIsRunning(!isRunning);
    setFinishedBanner(null);
  };

  const handleReset = () => {
    playSoftTickSound();
    setIsRunning(false);
    setTimeLeft(currentTotalDuration);
    setFinishedBanner(null);
  };

  const handleSkip = () => {
    playSoftTickSound();
    if (mode === 'work') switchMode('shortBreak');
    else switchMode('work');
  };

  const handleQuickAddStepToTarget = () => {
    if (selectedTargetId && onIncrementTargetStep) {
      onIncrementTargetStep(selectedTargetId);
      playSoftTickSound();
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressRatio = currentTotalDuration > 0 ? (currentTotalDuration - timeLeft) / currentTotalDuration : 0;
  const radius = 62;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pomodoro Focus Timer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                25-minute study intervals & 5-minute restorative breaks
              </p>
            </div>
          </div>

          <button
            onClick={() => onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
            aria-label={settings.soundEnabled ? 'Mute alert sounds' : 'Enable alert sounds'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-sky-600 dark:text-sky-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
          <button
            onClick={() => switchMode('work')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'work'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Focus (25m)
          </button>
          <button
            onClick={() => switchMode('shortBreak')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'shortBreak'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => switchMode('longBreak')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'longBreak'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        <div className="mb-5">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
            Linked Academic Target
          </label>
          <select
            value={selectedTargetId || ''}
            onChange={(e) => onSelectTarget(e.target.value ? e.target.value : null)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-sky-500"
          >
            <option value="">General Study (No linked target)</option>
            {targets.filter(t => !t.completed).map((t) => (
              <option key={t.id} value={t.id}>
                {t.subject}: {t.title} ({t.currentSteps}/{t.totalSteps} {t.unit})
              </option>
            ))}
          </select>
        </div>

        {finishedBanner && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{finishedBanner}</span>
            </div>
            {activeTarget && !activeTarget.completed && onIncrementTargetStep && (
              <button
                onClick={handleQuickAddStepToTarget}
                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-xs transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>+1 {activeTarget.unit}</span>
              </button>
            )}
          </div>
        )}

        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative flex items-center justify-center">
            <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 144 144">
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="text-slate-100 dark:text-slate-800"
                strokeWidth={strokeWidth}
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r={radius}
                className={`transition-all duration-500 ${
                  mode === 'work' ? 'text-sky-500 dark:text-sky-400' : 'text-emerald-500 dark:text-emerald-400'
                }`}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <div className="text-4xl font-mono font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                {timeFormatted}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                {mode === 'work' ? (
                  <>
                    <Brain className="w-3.5 h-3.5 text-sky-500" />
                    <span>Deep Study</span>
                  </>
                ) : (
                  <>
                    <Coffee className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Rest & Hydrate</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-2 mb-6">
          <button
            onClick={handleReset}
            title="Reset timer"
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md transition-all transform active:scale-95 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                : 'bg-sky-600 hover:bg-sky-500 active:bg-sky-700 dark:bg-sky-500 dark:text-slate-950 shadow-sky-500/20'
            }`}
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>

          <button
            onClick={handleSkip}
            title="Skip interval"
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shadow-xs"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4 text-center">
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
          <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
            Completed Today
          </span>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
            {stats.sessionsCompletedToday} <span className="text-xs font-normal text-slate-500">sessions</span>
          </div>
        </div>
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
          <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
            Focus Time Logged
          </span>
          <div className="text-lg font-bold font-mono text-sky-600 dark:text-sky-400 tabular-nums mt-0.5">
            {stats.totalFocusMinutesToday} <span className="text-xs font-normal text-slate-500">mins</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   10. DAILY SCRATCHPAD COMPONENT (TO-DOS & NOTES)
   ========================================================================== */

interface ScratchpadProps {
  todos: DailyTodo[];
  onAddTodo: (text: string) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onClearCompletedTodos: () => void;
  scratchpadText: string;
  onChangeScratchpadText: (text: string) => void;
}

export const Scratchpad: React.FC<ScratchpadProps> = ({
  todos,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onClearCompletedTodos,
  scratchpadText,
  onChangeScratchpadText,
}) => {
  const [activeTab, setActiveTab] = useState<'todos' | 'notes'>('todos');
  const [newTodoInput, setNewTodoInput] = useState('');
  const [copiedNote, setCopiedNote] = useState(false);

  const completedTodosCount = todos.filter(t => t.completed).length;

  const handleAddTodoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoInput.trim()) return;
    onAddTodo(newTodoInput.trim());
    setNewTodoInput('');
    playSoftTickSound();
  };

  const handleCopyNotes = async () => {
    try {
      await navigator.clipboard.writeText(scratchpadText);
      setCopiedNote(true);
      setTimeout(() => setCopiedNote(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('todos')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'todos'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-sky-500" />
              <span>Daily To-Dos</span>
              <span className="text-[10px] bg-slate-200 dark:bg-slate-600 px-1.5 py-0.2 rounded-full font-mono tabular-nums">
                {todos.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'notes'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5 text-emerald-500" />
              <span>Study Scratchpad</span>
            </button>
          </div>

          {activeTab === 'todos' && completedTodosCount > 0 && (
            <button
              onClick={onClearCompletedTodos}
              className="text-[11px] text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              Clear Done ({completedTodosCount})
            </button>
          )}

          {activeTab === 'notes' && (
            <button
              onClick={handleCopyNotes}
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
              {copiedNote ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedNote ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>

        {activeTab === 'todos' && (
          <div>
            <form onSubmit={handleAddTodoSubmit} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Add daily task (e.g. Review calculus theorems)..."
                value={newTodoInput}
                onChange={(e) => setNewTodoInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="submit"
                disabled={!newTodoInput.trim()}
                className="px-3 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:text-slate-950 rounded-lg shadow-xs transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {todos.length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No to-dos scheduled for today. Add quick tasks to stay organized!
                </div>
              ) : (
                todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`group flex items-center justify-between gap-2.5 p-2.5 rounded-xl border transition-all ${
                      todo.completed
                        ? 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-800/50'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-sky-300 dark:hover:border-sky-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <button
                        onClick={() => {
                          playSoftTickSound();
                          onToggleTodo(todo.id);
                        }}
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                          todo.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-sky-500'
                        }`}
                      >
                        {todo.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <span
                        className={`text-xs truncate ${
                          todo.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {todo.text}
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteTodo(todo.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            <textarea
              rows={9}
              value={scratchpadText}
              onChange={(e) => onChangeScratchpadText(e.target.value)}
              placeholder="Jot down quick formulas, ideas, lecture notes, or assignments to look into..."
              className="w-full p-3.5 text-xs font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 leading-relaxed resize-none"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
              <span>Auto-saved to local browser storage</span>
              <span className="font-mono tabular-nums">{scratchpadText.length} characters</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>Daily Academic Workflow</span>
        {activeTab === 'todos' && (
          <span className="font-mono tabular-nums">
            {completedTodosCount} of {todos.length} done
          </span>
        )}
        {activeTab === 'notes' && (
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Synced</span>
        )}
      </div>
    </div>
  );
};

/* ==========================================================================
   11. TARGET MODAL FORM (ADD & EDIT)
   ========================================================================== */

interface TargetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (targetData: Omit<Target, 'id' | 'createdAt'>, existingId?: string) => void;
  targetToEdit?: Target | null;
  existingSubjects: string[];
}

const TARGET_TYPE_PRESETS: { type: TargetType; label: string; icon: React.FC<{ className?: string }>; defaultUnit: string; defaultSteps: number }[] = [
  { type: 'book_chapters', label: 'Book Chapters', icon: BookOpen, defaultUnit: 'Chapters', defaultSteps: 8 },
  { type: 'study_hours', label: 'Study Hours', icon: Clock, defaultUnit: 'Hours', defaultSteps: 10 },
  { type: 'exam_grade', label: 'Exam / Test Prep', icon: Award, defaultUnit: 'Practice Sets', defaultSteps: 5 },
  { type: 'assignment', label: 'Project / Essay', icon: FileText, defaultUnit: 'Milestones', defaultSteps: 4 },
  { type: 'custom_steps', label: 'Custom Steps', icon: Layers, defaultUnit: 'Steps', defaultSteps: 5 },
];

const DEFAULT_SUBJECT_SUGGESTIONS = [
  'Mathematics',
  'Physics',
  'Computer Science',
  'Chemistry',
  'Biology',
  'Literature',
  'History',
  'Economics',
  'Philosophy',
];

export const TargetFormModal: React.FC<TargetFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  targetToEdit,
  existingSubjects,
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [targetType, setTargetType] = useState<TargetType>('book_chapters');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [totalSteps, setTotalSteps] = useState(5);
  const [currentSteps, setCurrentSteps] = useState(0);
  const [unit, setUnit] = useState('Chapters');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ title?: string; subject?: string; deadline?: string }>({});

  const allSubjectSuggestions = Array.from(new Set([...DEFAULT_SUBJECT_SUGGESTIONS, ...existingSubjects]));

  useEffect(() => {
    if (targetToEdit) {
      setTitle(targetToEdit.title);
      setSubject(targetToEdit.subject);
      setTargetType(targetToEdit.targetType);
      setDeadline(targetToEdit.deadline);
      setPriority(targetToEdit.priority);
      setTotalSteps(targetToEdit.totalSteps);
      setCurrentSteps(targetToEdit.currentSteps);
      setUnit(targetToEdit.unit);
      setNotes(targetToEdit.notes || '');
    } else {
      setTitle('');
      setSubject(allSubjectSuggestions[0] || 'Mathematics');
      setTargetType('book_chapters');
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setDeadline(d.toISOString().split('T')[0]);
      setPriority('medium');
      setTotalSteps(6);
      setCurrentSteps(0);
      setUnit('Chapters');
      setNotes('');
    }
    setErrors({});
  }, [targetToEdit, isOpen]);

  if (!isOpen) return null;

  const handleTypeChange = (type: TargetType) => {
    setTargetType(type);
    const preset = TARGET_TYPE_PRESETS.find(p => p.type === type);
    if (preset && !targetToEdit) {
      setUnit(preset.defaultUnit);
      setTotalSteps(preset.defaultSteps);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { title?: string; subject?: string; deadline?: string } = {};
    if (!title.trim()) newErrors.title = 'Please enter a target title';
    if (!subject.trim()) newErrors.subject = 'Please specify a subject or category';
    if (!deadline) newErrors.deadline = 'Please choose a target deadline date';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const validatedTotalSteps = Math.max(1, Number(totalSteps) || 1);
    const validatedCurrentSteps = Math.min(validatedTotalSteps, Math.max(0, Number(currentSteps) || 0));

    onSave(
      {
        title: title.trim(),
        subject: subject.trim(),
        targetType,
        deadline,
        priority,
        totalSteps: validatedTotalSteps,
        currentSteps: validatedCurrentSteps,
        unit: unit.trim() || 'Steps',
        completed: targetToEdit ? (validatedCurrentSteps >= validatedTotalSteps ? true : targetToEdit.completed) : false,
        notes: notes.trim() || undefined,
      },
      targetToEdit?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden my-8 transition-colors">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {targetToEdit ? 'Edit Academic Target' : 'Create New Target'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Set clear milestones and deadlines for your studies
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Target Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master Taylor Series & Power Series Problems"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 transition-all placeholder:text-slate-400"
              autoFocus
            />
            {errors.title && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Subject / Course Category *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Mathematics, Organic Chemistry, World History"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 transition-all placeholder:text-slate-400"
            />
            {errors.subject && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.subject}</p>}
            
            <div className="flex flex-wrap gap-1.5 mt-2">
              {allSubjectSuggestions.slice(0, 6).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  className={`text-[11px] px-2 py-0.5 rounded-md transition-colors ${
                    subject.toLowerCase() === s.toLowerCase()
                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 font-semibold'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Target Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TARGET_TYPE_PRESETS.map((preset) => {
                const IconComponent = preset.icon;
                const isSelected = targetType === preset.type;
                return (
                  <button
                    key={preset.type}
                    type="button"
                    onClick={() => handleTypeChange(preset.type)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/30 text-sky-900 dark:text-sky-200 font-medium'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 ${isSelected ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                    <span className="truncate">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Current Progress
              </label>
              <input
                type="number"
                min="0"
                max={totalSteps}
                value={currentSteps}
                onChange={(e) => setCurrentSteps(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Total Goal
              </label>
              <input
                type="number"
                min="1"
                value={totalSteps}
                onChange={(e) => setTotalSteps(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Unit / Measurement
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Chapters, Hours..."
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Deadline Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={deadline}
                  min={getTodayDateString()}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono tabular-nums bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
              {errors.deadline && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.deadline}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Priority Level
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['low', 'medium', 'high'] as PriorityLevel[]).map((p) => {
                  const isSelected = priority === p;
                  let colorClasses = 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400';
                  if (isSelected) {
                    if (p === 'high') colorClasses = 'border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-semibold';
                    else if (p === 'medium') colorClasses = 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-semibold';
                    else colorClasses = 'border-sky-400 bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 font-semibold';
                  }
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`capitalize py-2 text-xs rounded-lg border transition-all text-center ${colorClasses}`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Study Notes / Success Criteria (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Focus on past paper questions from 2024; verify formula proofs"
              className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 rounded-lg shadow-sm transition-all"
            >
              {targetToEdit ? 'Save Changes' : 'Create Target'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ==========================================================================
   12. MAIN APP ROOT COMPONENT (DEFAULT EXPORT)
   ========================================================================== */

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadStoredTheme());
  const [targets, setTargets] = useState<Target[]>(() => loadStoredTargets());
  const [todos, setTodos] = useState<DailyTodo[]>(() => loadStoredTodos());
  const [scratchpadText, setScratchpadText] = useState<string>(() => loadStoredScratchpad());
  const [pomoSettings, setPomoSettings] = useState<PomodoroSettings>(() => loadStoredPomoSettings());
  const [pomoStats, setPomoStats] = useState<PomodoroStats>(() => loadStoredPomoStats());

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetToEdit, setTargetToEdit] = useState<Target | null>(null);
  const [selectedPomoTargetId, setSelectedPomoTargetId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveStoredTheme(theme);
  }, [theme]);

  useEffect(() => {
    saveStoredTargets(targets);
  }, [targets]);

  useEffect(() => {
    saveStoredTodos(todos);
  }, [todos]);

  useEffect(() => {
    saveStoredScratchpad(scratchpadText);
  }, [scratchpadText]);

  useEffect(() => {
    saveStoredPomoSettings(pomoSettings);
  }, [pomoSettings]);

  useEffect(() => {
    saveStoredPomoStats(pomoStats);
  }, [pomoStats]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  const handleSaveTarget = (targetData: Omit<Target, 'id' | 'createdAt'>, existingId?: string) => {
    if (existingId) {
      setTargets(prev => prev.map(t => {
        if (t.id === existingId) return { ...t, ...targetData };
        return t;
      }));
      showToast('Target successfully updated');
    } else {
      const newTarget: Target = {
        id: `target-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        ...targetData,
        createdAt: Date.now(),
      };
      setTargets(prev => [newTarget, ...prev]);
      showToast('New target created');
    }
  };

  const handleToggleComplete = (id: string) => {
    setTargets(prev => prev.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          currentSteps: nextCompleted ? t.totalSteps : t.currentSteps,
          completedAt: nextCompleted ? Date.now() : undefined,
        };
      }
      return t;
    }));
  };

  const handleUpdateSteps = (id: string, newSteps: number) => {
    setTargets(prev => prev.map(t => {
      if (t.id === id) {
        const clampedSteps = Math.max(0, Math.min(t.totalSteps, newSteps));
        const isNowComplete = clampedSteps >= t.totalSteps;
        return {
          ...t,
          currentSteps: clampedSteps,
          completed: isNowComplete ? true : t.completed,
          completedAt: isNowComplete && !t.completed ? Date.now() : t.completedAt,
        };
      }
      return t;
    }));
  };

  const handleDeleteTarget = (id: string) => {
    const targetToDelete = targets.find(t => t.id === id);
    if (!targetToDelete) return;

    if (window.confirm(`Are you sure you want to delete "${targetToDelete.title}"?`)) {
      setTargets(prev => prev.filter(t => t.id !== id));
      if (selectedPomoTargetId === id) {
        setSelectedPomoTargetId(null);
      }
      showToast('Target deleted');
    }
  };

  const handleEditTarget = (target: Target) => {
    setTargetToEdit(target);
    setIsModalOpen(true);
  };

  const handleOpenNewTargetModal = () => {
    setTargetToEdit(null);
    setIsModalOpen(true);
  };

  const handleStartFocus = (target: Target) => {
    setSelectedPomoTargetId(target.id);
    showToast(`Linked focus session to: ${target.title}`);
    const el = document.getElementById('study-tools');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleIncrementTargetStep = (id: string) => {
    const target = targets.find(t => t.id === id);
    if (!target) return;
    const nextSteps = Math.min(target.totalSteps, target.currentSteps + 1);
    handleUpdateSteps(id, nextSteps);
    if (nextSteps === target.totalSteps) {
      playTargetCompleteSound();
      triggerConfetti();
      showToast(`Target achieved: ${target.title}!`);
    } else {
      showToast(`Logged +1 ${target.unit} on ${target.title}`);
    }
  };

  const handleAddTodo = (text: string) => {
    const newTodo: DailyTodo = {
      id: `todo-${Date.now()}`,
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setTodos(prev => [newTodo, ...prev]);
  };

  const handleToggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => {
      if (t.id === id) return { ...t, completed: !t.completed };
      return t;
    }));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleClearCompletedTodos = () => {
    setTodos(prev => prev.filter(t => !t.completed));
    showToast('Completed to-dos cleared');
  };

  const handleExportData = () => {
    const backup = {
      targets,
      todos,
      scratchpadText,
      pomoStats,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_targets_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.targets && Array.isArray(parsed.targets)) {
          setTargets(parsed.targets);
          if (parsed.todos && Array.isArray(parsed.todos)) setTodos(parsed.todos);
          if (typeof parsed.scratchpadText === 'string') setScratchpadText(parsed.scratchpadText);
          showToast('Data imported successfully');
        }
      } catch {
        showToast('Error reading backup JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetSampleData = () => {
    if (window.confirm('Reset targets and scratchpad to the standard academic sample data?')) {
      setTargets(INITIAL_TARGETS);
      showToast('Reset to sample targets');
    }
  };

  const existingSubjects = Array.from(new Set(targets.map(t => t.subject).filter(Boolean)));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col">
      <Header
        onOpenNewTargetModal={handleOpenNewTargetModal}
        theme={theme}
        onToggleTheme={toggleTheme}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetSampleData={handleResetSampleData}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardSummary
          targets={targets}
          onOpenNewTarget={handleOpenNewTargetModal}
          onFilterStatus={setStatusFilter}
          activeStatusFilter={statusFilter}
        />

        <TargetList
          targets={targets}
          onToggleComplete={handleToggleComplete}
          onUpdateSteps={handleUpdateSteps}
          onEdit={handleEditTarget}
          onDelete={handleDeleteTarget}
          onStartFocus={handleStartFocus}
          onOpenNewTarget={handleOpenNewTargetModal}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        <section id="study-tools" className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Interactive Study Tools
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Deep work intervals, task scratchpad, and daily study reminders
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PomodoroTimer
              targets={targets}
              selectedTargetId={selectedPomoTargetId}
              onSelectTarget={setSelectedPomoTargetId}
              onIncrementTargetStep={handleIncrementTargetStep}
              settings={pomoSettings}
              onUpdateSettings={setPomoSettings}
              stats={pomoStats}
              onUpdateStats={setPomoStats}
            />

            <Scratchpad
              todos={todos}
              onAddTodo={handleAddTodo}
              onToggleTodo={handleToggleTodo}
              onDeleteTodo={handleDeleteTodo}
              onClearCompletedTodos={handleClearCompletedTodos}
              scratchpadText={scratchpadText}
              onChangeScratchpadText={setScratchpadText}
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 transition-colors mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Student Target Tracker</span>
            <span>·</span>
            <span>Local Browser Storage Protected</span>
          </div>
          <div>Focus · Plan · Accomplish</div>
        </div>
      </footer>

      <TargetFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTargetToEdit(null);
        }}
        onSave={handleSaveTarget}
        targetToEdit={targetToEdit}
        existingSubjects={existingSubjects}
      />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium transition-all animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
