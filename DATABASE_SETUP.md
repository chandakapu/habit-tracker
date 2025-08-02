# Database Setup for Enhanced Habit Tracker

## New Features Added

This update includes:
- XP and streak tracking system
- Automatic stats updates via database triggers
- Enhanced analytics with charts

## Database Changes Required

### 1. Run the Stats Table Schema

Execute the SQL commands in `database_schema.sql` in your Supabase SQL editor:

```sql
-- This will create the stats table and trigger
-- Run the entire content of database_schema.sql
```

### 2. Verify the Setup

After running the schema, you should have:

1. **stats table** with columns:
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key to auth.users)
   - `habit_id` (UUID, Foreign Key to habits)
   - `xp` (INTEGER, default 0)
   - `current_streak` (INTEGER, default 0)
   - `max_streak` (INTEGER, default 0)
   - `last_completed_date` (DATE)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

2. **Row Level Security (RLS)** policies for the stats table

3. **update_habit_stats()** function that automatically:
   - Adds 10 XP when a habit is completed
   - Increases streak if previous day was completed
   - Resets streak if habit was skipped
   - Updates max streak if current streak exceeds it

4. **trigger_update_habit_stats** trigger that runs on habit_logs INSERT

### 3. Testing the Setup

1. Create a new habit
2. Log the habit as completed
3. Check the stats table - you should see a new record with:
   - xp = 10
   - current_streak = 1
   - max_streak = 1

4. Log the same habit the next day
5. Check the stats table - you should see:
   - xp = 20
   - current_streak = 2
   - max_streak = 2

### 4. Troubleshooting

If the trigger isn't working:

1. Check the Supabase logs for any errors
2. Verify the function exists: `SELECT * FROM pg_proc WHERE proname = 'update_habit_stats';`
3. Verify the trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_habit_stats';`

## New UI Features

### Graph Component
- Shows last 7 days of habit completion
- Displays completion percentage over time
- Updates automatically when habits are logged

### Enhanced Stats
- Total XP display
- Max streak tracking
- Real-time updates

### PWA Support
- Service worker for offline caching
- Web app manifest for installation
- Responsive design for mobile devices

## Migration Notes

- Existing habit logs will not have associated stats records
- New habit logs will automatically create stats records
- The system is backward compatible with existing data 