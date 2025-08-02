'use client'

import { useState } from 'react'
import { Habit, HabitLog } from '@/lib/supabase'
import { Check, X, Plus, Minus, Trash2, Edit, Tag } from 'lucide-react'
import { format } from 'date-fns'

interface HabitCardProps {
  habit: Habit
  logs: HabitLog[]
  onLog: (habitId: string, count: number, notes?: string) => void
  onDelete: (habitId: string) => void
  selectedDate: Date
}

export default function HabitCard({ habit, logs, onLog, onDelete, selectedDate }: HabitCardProps) {
  const [count, setCount] = useState(1)
  const [notes, setNotes] = useState('')
  const [showLogForm, setShowLogForm] = useState(false)

  const todayLogs = logs.filter(log => 
    format(new Date(log.completed_at), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  )

  const totalToday = todayLogs.reduce((sum, log) => sum + log.count, 0)
  const isCompleted = totalToday >= habit.target_count

  const handleLog = () => {
    if (count > 0) {
      onLog(habit.id, count, notes.trim() || undefined)
      setCount(1)
      setNotes('')
      setShowLogForm(false)
    }
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this habit?')) {
      onDelete(habit.id)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {habit.title}
              </h3>
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                <Tag className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {habit.category}
                </span>
              </div>
            </div>
            {habit.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {habit.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="capitalize">{habit.frequency}</span>
              <span>•</span>
              <span>Target: {habit.target_count}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLogForm(!showLogForm)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-red-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Today&apos;s Progress
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {totalToday} / {habit.target_count}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isCompleted 
                ? 'bg-green-500' 
                : totalToday > 0 
                  ? 'bg-blue-500' 
                  : 'bg-gray-300 dark:bg-gray-600'
            }`}
            style={{ width: `${Math.min((totalToday / habit.target_count) * 100, 100)}%` }}
          />
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 mb-4">
          {isCompleted ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Check className="h-5 w-5" />
              <span className="text-sm font-medium">Completed!</span>
            </div>
          ) : totalToday > 0 ? (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <span className="text-sm font-medium">In Progress</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <X className="h-5 w-5" />
              <span className="text-sm font-medium">Not Started</span>
            </div>
          )}
        </div>

        {/* Quick Log Form */}
        {showLogForm && (
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCount(Math.max(1, count - 1))}
                className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-semibold text-gray-900 dark:text-white min-w-[2rem] text-center">
                {count}
              </span>
              <button
                onClick={() => setCount(count + 1)}
                className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Add notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
            
            <button
              onClick={handleLog}
              disabled={count === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Log Progress
            </button>
          </div>
        )}

        {/* Recent Logs */}
        {todayLogs.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Today&apos;s Logs
            </h4>
            <div className="space-y-2">
              {todayLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {log.count} {log.count === 1 ? 'time' : 'times'}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {format(new Date(log.completed_at), 'HH:mm')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 