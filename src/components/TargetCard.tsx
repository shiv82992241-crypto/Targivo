import React from 'react';
import { Target, PriorityLevel } from '../types';
import { 
  Check, 
  Calendar, 
  Edit3, 
  Trash2, 
  Timer, 
  Plus, 
  Minus,
  AlertCircle
} from 'lucide-react';
import { playSoftTickSound, playTargetCompleteSound } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';

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

  // Deadline formatting & relative status calculation
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

  // Priority Visual Cues - anti-slop clean badges
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

  // Compact List Row View
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
        {/* Left: Checkbox & Title */}
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
            {/* Unboxed metadata */}
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

        {/* Center: Stepper & Mini Progress */}
        <div className="flex items-center gap-4 shrink-0">
          {renderPriorityBadge(target.priority)}

          <div className="flex items-center gap-2">
            <button
              onClick={handleStepDecrement}
              disabled={target.completed || target.currentSteps <= 0}
              aria-label="Decrease progress step"
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
              aria-label="Increase progress step"
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action buttons */}
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

  // Grid Card View (Default)
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
      {/* Top Header: Checkbox, Title & Priority */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Completion Checkbox */}
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

              {/* Unboxed Metadata: Subject and Target Type */}
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

        {/* Target Notes if available */}
        {target.notes && (
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 line-clamp-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
            {target.notes}
          </p>
        )}
      </div>

      {/* Middle: Visual Step Tracker & Slider Controls */}
      <div className="my-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-medium text-slate-600 dark:text-slate-300">
            Progress ({target.currentSteps} of {target.totalSteps} {target.unit})
          </span>
          <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">
            {percentage}%
          </span>
        </div>

        {/* Visual Progress Bar */}
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

        {/* Stepper Buttons & Interactive Slider */}
        <div className="flex items-center gap-3">
          {/* Minus Button */}
          <button
            onClick={handleStepDecrement}
            disabled={target.completed || target.currentSteps <= 0}
            aria-label="Decrease step"
            className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Interactive Range Slider */}
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

          {/* Plus Button */}
          <button
            onClick={handleStepIncrement}
            disabled={target.completed || target.currentSteps >= target.totalSteps}
            aria-label="Increase step"
            className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Footer: Deadline & Action Buttons */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        {/* Deadline Information */}
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

        {/* Action Controls */}
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
