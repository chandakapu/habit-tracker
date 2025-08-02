'use client'

import { Habit, HabitLog } from '@/lib/supabase'
import { Target, CheckCircle, TrendingUp, Calendar, Flame, BarChart3 } from 'lucide-react'
import { format, subDays, isSameDay, startOfDay, endOfDay } from 'date-fns'

interface HabitStatsProps {
  habits: Habit[]
  habitLogs: HabitLog[]
}

export default function HabitStats({ habits, habitLogs }: HabitStatsProps) {
  const totalHabits = habits.length
  const completedToday = habits.filter(habit => {
    const habitLogsForHabit = habitLogs.filter(log => log.habit_id === habit.id)
    const totalCount = habitLogsForHabit.reduce((sum, log) => sum + log.count, 0)
    return totalCount >= habit.target_count
  }).length

  const totalLogsToday = habitLogs.length
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0

  // Calculate current streak for all habits
  const calculateStreak = (habitId: string) => {
    let streak = 0
    let currentDate = new Date()
    
    while (true) {
      const dayLogs = habitLogs.filter(log => {
        const logDate = new Date(log.completed_at)
        return log.habit_id === habitId && 
               isSameDay(logDate, currentDate)
      })
      
      const habit = habits.find(h => h.id === habitId)
      if (!habit) break
      
      const totalCount = dayLogs.reduce((sum, log) => sum + log.count, 0)
      
      if (totalCount >= habit.target_count) {
        streak++
        currentDate = subDays(currentDate, 1)
      } else {
        break
      }
    }
    
    return streak
  }

  const maxStreak = habits.length > 0 ? Math.max(...habits.map(habit => calculateStreak(habit.id))) : 0

  // Calculate weekly progress
  const weekStart = startOfDay(subDays(new Date(), 6))
  const weekEnd = endOfDay(new Date())
  const weeklyLogs = habitLogs.filter(log => {
    const logDate = new Date(log.completed_at)
    return logDate >= weekStart && logDate <= weekEnd
  })

  const stats = [
    {
      title: 'Total Habits',
      value: totalHabits,
      icon: Target,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Completed Today',
      value: completedToday,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Current Streak',
      value: maxStreak,
      icon: Flame,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      title: 'Weekly Logs',
      value: weeklyLogs.length,
      icon: BarChart3,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-xl p-6 border border-gray-200 dark:border-gray-700`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg bg-white dark:bg-gray-800`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Completion Rate Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Today's Progress
          </h3>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {completionRate}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {completedToday} of {totalHabits} habits completed today
        </p>
      </div>
    </div>
  )
} 