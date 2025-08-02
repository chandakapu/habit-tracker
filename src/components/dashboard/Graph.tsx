'use client'

import { useMemo } from 'react'
import { Habit, HabitLog } from '@/lib/supabase'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { TrendingUp } from 'lucide-react'

interface GraphProps {
  habits: Habit[]
  habitLogs: HabitLog[]
}

interface DailyCompletion {
  date: string
  completed: number
  total: number
  percentage: number
}

export default function Graph({ habits, habitLogs }: GraphProps) {
  const data = useMemo(() => {
    const last7Days: DailyCompletion[] = []
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dayStart = startOfDay(date)
      const dayEnd = endOfDay(date)
      
      // Get logs for this specific day
      const dayLogs = habitLogs.filter(log => {
        const logDate = new Date(log.completed_at)
        return logDate >= dayStart && logDate <= dayEnd
      })
      
      // Calculate completion for each habit
      let completedHabits = 0
      const totalHabits = habits.length
      
      habits.forEach(habit => {
        const habitLogsForDay = dayLogs.filter(log => log.habit_id === habit.id)
        const totalCount = habitLogsForDay.reduce((sum, log) => sum + log.count, 0)
        
        if (totalCount >= habit.target_count) {
          completedHabits++
        }
      })
      
      const percentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0
      
      last7Days.push({
        date: format(date, 'MMM dd'),
        completed: completedHabits,
        total: totalHabits,
        percentage
      })
    }
    
    return last7Days
  }, [habits, habitLogs])

  const averageCompletion = data.reduce((sum, day) => sum + day.percentage, 0) / data.length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Habit Completion Trend
          </h3>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">Average Completion</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Math.round(averageCompletion)}%
          </p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              labelStyle={{ color: '#F9FAFB' }}
              formatter={(value: number) => [
                `${value}% completed`,
                'Completion Rate'
              ]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="percentage"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="url(#completionGradient)"
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Best Day</p>
          <p className="font-semibold text-green-600 dark:text-green-400">
            {data.reduce((max, day) => day.percentage > max.percentage ? day : max).percentage}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Total Habits</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {habits.length}
          </p>
        </div>
      </div>
    </div>
  )
} 