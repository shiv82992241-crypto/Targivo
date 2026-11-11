import React, { useState, useEffect } from 'react';
import { Target, PriorityLevel, TargetType } from '../types';
import { X, Calendar, BookOpen, Clock, Award, Layers, FileText } from 'lucide-react';
import { getTodayDateString } from '../utils/storage';

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

  // Merge default subjects with user existing subjects
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
      // Defaults for a new target
      setTitle('');
      setSubject(allSubjectSuggestions[0] || 'Mathematics');
      setTargetType('book_chapters');
      // Default deadline: 1 week from today
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
        {/* Modal Header */}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
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

          {/* Subject & Quick Suggestions */}
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
            
            {/* Quick Suggestions */}
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

          {/* Target Type Selector */}
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

          {/* Stepper & Units configuration */}
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

          {/* Deadline & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Deadline */}
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

            {/* Priority Level */}
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

          {/* Optional Notes */}
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

          {/* Form Actions */}
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
