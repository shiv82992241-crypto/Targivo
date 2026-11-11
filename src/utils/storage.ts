import { Target, DailyTodo, PomodoroSettings, PomodoroStats } from '../types';

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
  } catch (err) {
    console.error('Failed to save targets to local storage', err);
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
  } catch (err) {
    console.error('Failed to save todos to local storage', err);
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
  } catch (err) {
    console.error('Failed to save scratchpad', err);
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
  } catch (err) {
    console.error('Failed to save pomodoro settings', err);
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
    if (parsed.lastDate !== today) {
      // New day, reset daily metrics
      return defaultStats;
    }
    return parsed;
  } catch {
    return defaultStats;
  }
}

export function saveStoredPomoStats(stats: PomodoroStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.POMO_STATS, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save pomodoro stats', err);
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
