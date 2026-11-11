import React, { useState } from 'react';
import { DailyTodo } from '../types';
import { 
  Check, 
  Plus, 
  Trash2, 
  CheckSquare, 
  FileEdit, 
  Copy, 
  CheckCheck
} from 'lucide-react';
import { playSoftTickSound } from '../utils/sound';

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
        {/* Header with Segmented Tab switcher */}
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
              title="Copy scratchpad notes to clipboard"
            >
              {copiedNote ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedNote ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>

        {/* TAB 1: DAILY TO-DOS */}
        {activeTab === 'todos' && (
          <div>
            {/* Add Todo Input */}
            <form onSubmit={handleAddTodoSubmit} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Add daily task (e.g. Email prof, solve problem 4)..."
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

            {/* Todo List */}
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
                        aria-label={`Toggle ${todo.text}`}
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
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: STUDY SCRATCHPAD NOTES */}
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

      {/* Footer Info */}
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
