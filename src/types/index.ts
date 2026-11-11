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
