'use client'

import { useState, useEffect } from 'react'
import { Habit } from '@/lib/supabase'
import { Bell, Clock, Settings, X } from 'lucide-react'

interface ReminderSettingsProps {
  habits: Habit[]
  onClose: () => void
}

interface Reminder {
  id: string
  habit_id: string
  time: string
  enabled: boolean
  days: string[]
}

export default function ReminderSettings({ habits, onClose }: ReminderSettingsProps) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [showAddReminder, setShowAddReminder] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState('')
  const [reminderTime, setReminderTime] = useState('09:00')
  const [selectedDays, setSelectedDays] = useState<string[]>(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'])

  const daysOfWeek = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' }
  ]

  const handleAddReminder = () => {
    if (!selectedHabit || selectedDays.length === 0) return

    const newReminder: Reminder = {
      id: Date.now().toString(),
      habit_id: selectedHabit,
      time: reminderTime,
      enabled: true,
      days: selectedDays
    }

    setReminders([...reminders, newReminder])
    setShowAddReminder(false)
    setSelectedHabit('')
    setReminderTime('09:00')
    setSelectedDays(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'])
  }

  const handleToggleReminder = (reminderId: string) => {
    setReminders(reminders.map(reminder => 
      reminder.id === reminderId 
        ? { ...reminder, enabled: !reminder.enabled }
        : reminder
    ))
  }

  const handleDeleteReminder = (reminderId: string) => {
    setReminders(reminders.filter(reminder => reminder.id !== reminderId))
  }

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Reminder Settings
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Add Reminder Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddReminder(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Bell className="h-5 w-5" />
              Add Reminder
            </button>
          </div>

          {/* Add Reminder Form */}
          {showAddReminder && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                New Reminder
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Habit
                  </label>
                  <select
                    value={selectedHabit}
                    onChange={(e) => setSelectedHabit(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a habit</option>
                    {habits.map((habit) => (
                      <option key={habit.id} value={habit.id}>{habit.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map((day) => (
                      <button
                        key={day.key}
                        onClick={() => toggleDay(day.key)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedDays.includes(day.key)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddReminder(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddReminder}
                    disabled={!selectedHabit || selectedDays.length === 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    Add Reminder
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Existing Reminders */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Active Reminders
            </h3>
            
            {reminders.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No reminders set up yet
                </p>
              </div>
            ) : (
              reminders.map((reminder) => {
                const habit = habits.find(h => h.id === reminder.habit_id)
                return (
                  <div key={reminder.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleToggleReminder(reminder.id)}
                        className={`w-4 h-4 rounded border-2 transition-colors ${
                          reminder.enabled
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {reminder.enabled && (
                          <div className="w-2 h-2 bg-white rounded-sm mx-auto mt-0.5" />
                        )}
                      </button>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {habit?.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {reminder.time} • {reminder.days.length} days/week
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="p-2 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 