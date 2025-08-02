'use client'

import { useState } from 'react'
import { Habit, HabitLog } from '@/lib/supabase'
import { BarChart3, TrendingUp, Calendar, Target } from 'lucide-react'
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'

interface HabitAnalyticsProps {
  habits: Habit[]
  habitLogs: HabitLog[]
}

export default function HabitAnalytics({ habits, habitLogs }: HabitAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week')
  const [selectedHabit, setSelectedHabit] = useState<string>('all')

  // Calculate weekly data
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const getWeeklyData = () => {
    return weekDays.map(day => {
      const dayLogs = habitLogs.filter(log => {
        const logDate = new Date(log.completed_at)
        return isSameDay(logDate, day)
      })

      const completedHabits = habits.filter(habit => {
        const habitLogs = dayLogs.filter(log => log.habit_id === habit.id)
        const totalCount = habitLogs.reduce((sum, log) => sum + log.count, 0)
        return totalCount >= habit.target_count
      }).length

      return {
        date: format(day, 'EEE'),
        completed: completedHabits,
        total: habits.length,
        percentage: habits.length > 0 ? Math.round((completedHabits / habits.length) * 100) : 0
      }
    })
  }

  const weeklyData = getWeeklyData()

  // Calculate habit-specific stats
  const getHabitStats = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return null

    const filteredLogs = habitLogs.filter(log => log.habit_id === habitId)
    const totalLogs = filteredLogs.length
    const totalCount = filteredLogs.reduce((sum, log) => sum + log.count, 0)
    const avgPerDay = totalLogs > 0 ? Math.round(totalCount / totalLogs) : 0

    // Calculate streak
    let streak = 0
    let currentDate = new Date()
    
    while (true) {
      const dayLogs = filteredLogs.filter(log => {
        const logDate = new Date(log.completed_at)
        return isSameDay(logDate, currentDate)
      })
      
      const dayTotalCount = dayLogs.reduce((sum, log) => sum + log.count, 0)
      
      if (dayTotalCount >= habit.target_count) {
        streak++
        currentDate = subDays(currentDate, 1)
      } else {
        break
      }
    }

    return {
      totalLogs,
      totalCount,
      avgPerDay,
      streak,
      completionRate: totalLogs > 0 ? Math.round((totalCount / (habit.target_count * totalLogs)) * 100) : 0
    }
  }

  const selectedHabitStats = selectedHabit !== 'all' ? getHabitStats(selectedHabit) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h2>
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month')}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <select
            value={selectedHabit}
            onChange={(e) => setSelectedHabit(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Habits</option>
            {habits.map((habit) => (
              <option key={habit.id} value={habit.id}>{habit.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Weekly Progress
        </h3>
        <div className="space-y-4">
          {weeklyData.map((day, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-16 text-sm font-medium text-gray-600 dark:text-gray-400">
                {day.date}
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${day.percentage}%` }}
                  />
                </div>
              </div>
              <div className="w-20 text-right text-sm text-gray-600 dark:text-gray-400">
                {day.completed}/{day.total}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Habit-specific Stats */}
      {selectedHabitStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Logs
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {selectedHabitStats.totalLogs}
                </p>
              </div>
              <div className="text-blue-600 dark:text-blue-400 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Current Streak
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {selectedHabitStats.streak}
                </p>
              </div>
              <div className="text-orange-600 dark:text-orange-400 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg per Day
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {selectedHabitStats.avgPerDay}
                </p>
              </div>
              <div className="text-green-600 dark:text-green-400 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <Target className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {selectedHabitStats.completionRate}%
                </p>
              </div>
              <div className="text-purple-600 dark:text-purple-400 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 