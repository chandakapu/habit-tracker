-- Stats table for tracking user progress
CREATE TABLE IF NOT EXISTS stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  last_completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, habit_id)
);

-- Enable RLS
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own stats" ON stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" ON stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stats" ON stats
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update stats when habit is logged
CREATE OR REPLACE FUNCTION update_habit_stats()
RETURNS TRIGGER AS $$
DECLARE
  habit_record habits%ROWTYPE;
  stats_record stats%ROWTYPE;
  yesterday_date DATE;
  is_yesterday_completed BOOLEAN := FALSE;
BEGIN
  -- Get habit details
  SELECT * INTO habit_record FROM habits WHERE id = NEW.habit_id;
  
  -- Get current stats for this habit
  SELECT * INTO stats_record FROM stats WHERE user_id = NEW.user_id AND habit_id = NEW.habit_id;
  
  -- Calculate yesterday's date
  yesterday_date := (NEW.completed_at::DATE) - INTERVAL '1 day';
  
  -- Check if habit was completed yesterday
  SELECT EXISTS(
    SELECT 1 FROM habit_logs 
    WHERE habit_id = NEW.habit_id 
    AND user_id = NEW.user_id 
    AND completed_at::DATE = yesterday_date
  ) INTO is_yesterday_completed;
  
  -- If stats record doesn't exist, create one
  IF stats_record.id IS NULL THEN
    INSERT INTO stats (user_id, habit_id, xp, current_streak, max_streak, last_completed_date)
    VALUES (NEW.user_id, NEW.habit_id, 10, 1, 1, NEW.completed_at::DATE);
  ELSE
    -- Update existing stats
    UPDATE stats SET
      xp = xp + 10,
      current_streak = CASE 
        WHEN is_yesterday_completed THEN current_streak + 1
        ELSE 1
      END,
      max_streak = CASE 
        WHEN is_yesterday_completed AND (current_streak + 1) > max_streak THEN current_streak + 1
        WHEN NOT is_yesterday_completed AND 1 > max_streak THEN 1
        ELSE max_streak
      END,
      last_completed_date = NEW.completed_at::DATE,
      updated_at = NOW()
    WHERE user_id = NEW.user_id AND habit_id = NEW.habit_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update stats when habit is logged
DROP TRIGGER IF EXISTS trigger_update_habit_stats ON habit_logs;
CREATE TRIGGER trigger_update_habit_stats
  AFTER INSERT ON habit_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_habit_stats(); 