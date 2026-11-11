import React, { useState, useMemo } from 'react';
import { Target, PriorityLevel } from '../types';
import { TargetCard } from './TargetCard';
import { 
  Search, 
  SlidersHorizontal, 
  LayoutGrid, 
  List as ListIcon, 
  Plus, 
  CheckCircle2, 
  CircleDashed,
  ArrowUpDown
} from 'lucide-react';

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

  // Extract unique subjects
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    targets.forEach(t => {
      if (t.subject) set.add(t.subject);
    });
    return Array.from(set).sort();
  }, [targets]);

  // Counts for tabs
  const activeCount = useMemo(() => targets.filter(t => !t.completed).length, [targets]);
  const completedCount = useMemo(() => targets.filter(t => t.completed).length, [targets]);

  // Filter & Sort Logic
  const filteredTargets = useMemo(() => {
    return targets
      .filter(t => {
        // Status filter
        if (statusFilter === 'active' && t.completed) return false;
        if (statusFilter === 'completed' && !t.completed) return false;

        // Subject filter
        if (selectedSubject !== 'all' && t.subject !== selectedSubject) return false;

        // Priority filter
        if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;

        // Search query
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
        // Sorting logic
        if (sortBy === 'deadline-asc') {
          return a.deadline.localeCompare(b.deadline);
        }
        if (sortBy === 'deadline-desc') {
          return b.deadline.localeCompare(a.deadline);
        }
        if (sortBy === 'priority') {
          const weight: Record<PriorityLevel, number> = { high: 3, medium: 2, low: 1 };
          return weight[b.priority] - weight[a.priority];
        }
        if (sortBy === 'progress') {
          const pctA = a.totalSteps > 0 ? a.currentSteps / a.totalSteps : 0;
          const pctB = b.totalSteps > 0 ? b.currentSteps / b.totalSteps : 0;
          return pctB - pctA;
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [targets, statusFilter, selectedSubject, selectedPriority, searchQuery, sortBy]);

  // Group into active vs completed when view is "all"
  const activeFiltered = useMemo(() => filteredTargets.filter(t => !t.completed), [filteredTargets]);
  const completedFiltered = useMemo(() => filteredTargets.filter(t => t.completed), [filteredTargets]);

  return (
    <section id="targets" className="mb-12">
      {/* Section Header & View Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Academic Targets
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage course milestones, exam prep, and study chapters
          </p>
        </div>

        {/* View Mode & Add Target Button */}
        <div className="flex items-center gap-2.5">
          {/* Segmented Grid / List toggle */}
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

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Segmented Status Tabs (Interactive buttons) */}
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

          {/* Search Input */}
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

        {/* Filters Row: Subject, Priority, Sort */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Subject Filter */}
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

          {/* Priority Filter */}
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

          {/* Sort By */}
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

      {/* Target Content Rendering */}
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
        /* When "All" is active, render separated Active vs Completed sections as specified in prompt */
        <div className="space-y-8">
          {/* Section: Active Targets */}
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

          {/* Section: Completed Targets */}
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
        /* When specific Active or Completed tab is clicked */
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
