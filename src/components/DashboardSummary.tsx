import React from 'react';
import { Target } from '../types';
import { CheckCircle2, CircleDashed, Flame, AlertCircle } from 'lucide-react';

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

  // Calculate overall weighted progress percentage across all targets
  const overallPercentage = totalTargets === 0 ? 0 : Math.round((completedTargets / totalTargets) * 100);

  // Calculate detailed step progress
  const totalPossibleSteps = targets.reduce((acc, t) => acc + (t.totalSteps || 1), 0);
  const currentTotalSteps = targets.reduce((acc, t) => {
    if (t.completed) return acc + (t.totalSteps || 1);
    return acc + Math.min(t.currentSteps || 0, t.totalSteps || 1);
  }, 0);
  const detailedStepPercentage = totalPossibleSteps === 0 ? 0 : Math.round((currentTotalSteps / totalPossibleSteps) * 100);

  // Check for targets due soon (today or within 48 hours) or overdue
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const urgentTargets = targets.filter(t => {
    if (t.completed || !t.deadline) return false;
    const [year, month, day] = t.deadline.split('-').map(Number);
    const deadlineDate = new Date(year, month - 1, day);
    const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 2; // overdue, due today, or due tomorrow
  });

  // Circular progress calculations
  const radius = 48;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallPercentage / 100) * circumference;

  return (
    <div id="dashboard" className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
      {/* Main Visual Progress Meter Card (5 cols on large screens) */}
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
          {/* Dynamic Circular Progress Bar */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-32 h-32 -rotate-90 transform" viewBox="0 0 116 116">
              {/* Background Track */}
              <circle
                cx="58"
                cy="58"
                r={radius}
                className="text-slate-100 dark:text-slate-800"
                strokeWidth={strokeWidth}
                stroke="currentColor"
                fill="transparent"
              />
              {/* Progress Stroke with student-friendly sky/emerald gradient */}
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

            {/* Inner Center Label */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
                {overallPercentage}%
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
                Completed
              </span>
            </div>
          </div>

          {/* Progress Narrative */}
          <div className="flex-1 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>Granular Step Progress</span>
              <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                {detailedStepPercentage}%
              </span>
            </div>
            {/* Horizontal mini bar */}
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

      {/* Visual Progress Metric Cards (7 cols on large screens) */}
      <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Targets Set */}
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

        {/* Card 2: Targets Completed */}
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

        {/* Card 3: Active In-Progress Targets */}
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
