import React, { useState, useEffect, useRef } from 'react';
import { Target, PomodoroMode, PomodoroSettings, PomodoroStats } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Coffee,
  Brain,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { playTimerFinishSound, playSoftTickSound } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';
import { getTodayDateString } from '../utils/storage';

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

  // Get current active target if selected
  const activeTarget = targets.find(t => t.id === selectedTargetId);

  // Duration for current mode
  const currentTotalDuration = 
    mode === 'work' 
      ? settings.workDuration 
      : mode === 'shortBreak' 
      ? settings.shortBreakDuration 
      : settings.longBreakDuration;

  // Handle mode switches
  const switchMode = (newMode: PomodoroMode) => {
    setIsRunning(false);
    setMode(newMode);
    setFinishedBanner(null);
    if (newMode === 'work') {
      setTimeLeft(settings.workDuration);
    } else if (newMode === 'shortBreak') {
      setTimeLeft(settings.shortBreakDuration);
    } else {
      setTimeLeft(settings.longBreakDuration);
    }
  };

  // Timer Tick Effect
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

  // Update document title with live countdown
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

  // Handle Timer Finished
  const handleTimerComplete = () => {
    setIsRunning(false);
    if (settings.soundEnabled) {
      playTimerFinishSound();
    }
    triggerConfetti();

    if (mode === 'work') {
      const addedMinutes = Math.round(settings.workDuration / 60);
      const newStats: PomodoroStats = {
        sessionsCompletedToday: stats.sessionsCompletedToday + 1,
        totalFocusMinutesToday: stats.totalFocusMinutesToday + addedMinutes,
        lastDate: getTodayDateString(),
      };
      onUpdateStats(newStats);

      setFinishedBanner(
        `Focus session complete! Take a well-earned break.`
      );
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
    if (mode === 'work') {
      switchMode('shortBreak');
    } else {
      switchMode('work');
    }
  };

  const handleQuickAddStepToTarget = () => {
    if (selectedTargetId && onIncrementTargetStep) {
      onIncrementTargetStep(selectedTargetId);
      playSoftTickSound();
    }
  };

  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG Circular Meter math
  const progressRatio = currentTotalDuration > 0 ? (currentTotalDuration - timeLeft) / currentTotalDuration : 0;
  const radius = 62;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
      {/* Widget Header */}
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

          {/* Sound Toggle */}
          <button
            onClick={() => onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
            aria-label={settings.soundEnabled ? 'Mute alert sounds' : 'Enable alert sounds'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={settings.soundEnabled ? 'Alert sounds active' : 'Alert sounds muted'}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-sky-600 dark:text-sky-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
        </div>

        {/* Mode Selector Tabs (Segmented) */}
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

        {/* Target Association Dropdown */}
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

        {/* Finished / Alert Banner */}
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

        {/* Circular Display & Countdown */}
        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative flex items-center justify-center">
            <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 144 144">
              {/* Background ring */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="text-slate-100 dark:text-slate-800"
                strokeWidth={strokeWidth}
                stroke="currentColor"
                fill="transparent"
              />
              {/* Progress ring */}
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

            {/* Centered Digital Display */}
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

        {/* Main Controls: Start/Pause, Reset, Skip */}
        <div className="flex items-center justify-center gap-4 mt-2 mb-6">
          <button
            onClick={handleReset}
            title="Reset timer to beginning"
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
            aria-label={isRunning ? 'Pause Timer' : 'Start Timer'}
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>

          <button
            onClick={handleSkip}
            title="Skip to next session"
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shadow-xs"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Daily Pomodoro Metrics Footer */}
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
