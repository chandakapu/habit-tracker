'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Habit, HabitLog, HABIT_CATEGORIES } from '@/lib/supabase'
import { Plus, LogOut, Calendar, Target, Filter, BarChart3, Bell } from 'lucide-react'
import HabitCard from './HabitCard'
import AddHabitModal from './AddHabitModal'
import HabitStats from './HabitStats'
import HabitAnalytics from './HabitAnalytics'
import ReminderSettings from './ReminderSettings'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showReminderSettings, setShowReminderSettings] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [activeTab, setActiveTab] = useState<'habits' | 'analytics'>('habits')

  const fetchHabits = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setHabits(data || [])
    } catch (error) {
      console.error('Error fetching habits:', error)
    }
  }, [user?.id])

  const fetchHabitLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user?.id)
        .gte('completed_at', new Date(selectedDate.setHours(0, 0, 0, 0)).toISOString())
        .lte('completed_at', new Date(selectedDate.setHours(23, 59, 59, 999)).toISOString())

      if (error) throw error
      setHabitLogs(data || [])
    } catch (error) {
      console.error('Error fetching habit logs:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id, selectedDate])

  useEffect(() => {
    if (user) {
      fetchHabits()
      fetchHabitLogs()
    }
  }, [user, fetchHabits, fetchHabitLogs])

  const handleLogHabit = async (habitId: string, count: number, notes?: string) => {
    try {
      const { error } = await supabase
        .from('habit_logs')
        .insert({
          habit_id: habitId,
          user_id: user?.id,
          completed_at: new Date().toISOString(),
          count,
          notes
        })

      if (error) throw error
      
      // Refresh data
      fetchHabitLogs()
    } catch (error) {
      console.error('Error logging habit:', error)
    }
  }

  const handleDeleteHabit = async (habitId: string) => {
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId)

      if (error) throw error
      
      // Refresh habits
      fetchHabits()
    } catch (error) {
      console.error('Error deleting habit:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Filter habits by category
  const filteredHabits = selectedCategory === 'All' 
    ? habits 
    : habits.filter(habit => habit.category === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Habit Tracker
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowReminderSettings(true)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Bell className="h-5 w-5" />
                Reminders
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Habit
              </button>
              <button
                onClick={handleSignOut}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="mb-8">
          <HabitStats habits={habits} habitLogs={habitLogs} />
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('habits')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'habits'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Habits
                </div>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </div>
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'habits' ? (
          <>
            {/* Filters */}
            <div className="mb-6 space-y-4">
              {/* Date Selector */}
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => {
                    setSelectedDate(new Date(e.target.value))
                    fetchHabitLogs()
                  }}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="All">All Categories</option>
                  {HABIT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Habits Grid */}
            {filteredHabits.length === 0 ? (
              <div className="text-center py-12">
                <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {selectedCategory === 'All' ? 'No habits yet' : `No ${selectedCategory} habits`}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {selectedCategory === 'All' 
                    ? 'Start by adding your first habit to track'
                    : `Add a habit in the ${selectedCategory} category`
                  }
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Add Your First Habit
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHabits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    logs={habitLogs.filter(log => log.habit_id === habit.id)}
                    onLog={handleLogHabit}
                    onDelete={handleDeleteHabit}
                    selectedDate={selectedDate}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <HabitAnalytics habits={habits} habitLogs={habitLogs} />
        )}
      </main>

      {/* Add Habit Modal */}
      {showAddModal && (
        <AddHabitModal
          onClose={() => setShowAddModal(false)}
          onAdd={fetchHabits}
          userId={user?.id || ''}
        />
      )}

      {/* Reminder Settings Modal */}
      {showReminderSettings && (
        <ReminderSettings
          habits={habits}
          onClose={() => setShowReminderSettings(false)}
        />
      )}
    </div>
  )
} 