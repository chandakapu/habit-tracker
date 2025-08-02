# Habit Tracker

A modern, feature-rich habit tracking application built with Next.js, Supabase, and Tailwind CSS. Track your daily habits, view analytics, and build better routines with this beautiful and responsive web app.

## ✨ Features

### 🔐 Authentication
- Secure user authentication with Supabase Auth
- Email/password signup and login
- Persistent sessions

### 📊 Habit Management
- Create, edit, and delete habits
- Set custom target counts and frequencies (daily/weekly/monthly)
- Categorize habits (Health & Fitness, Learning, Productivity, etc.)
- Color-coded habit cards
- Progress tracking with visual indicators

### 📈 Analytics & Insights
- Real-time statistics dashboard
- Habit completion rates and streaks
- Weekly progress charts
- Individual habit analytics
- Category-based filtering

### 🔔 Smart Reminders
- Set custom reminder times
- Choose specific days of the week
- Enable/disable reminders per habit
- Push notification support (PWA)

### 📱 Progressive Web App (PWA)
- Installable on mobile devices
- Offline support with service worker
- Native app-like experience
- Responsive design for all screen sizes

### 🎨 Modern UI/UX
- Beautiful, modern interface
- Dark mode support
- Responsive design
- Smooth animations and transitions
- Intuitive navigation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd habit-tracker
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database Tables

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create habits table
CREATE TABLE habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly')) DEFAULT 'daily',
  target_count INTEGER DEFAULT 1,
  color TEXT DEFAULT '#3B82F6',
  category TEXT DEFAULT 'Other',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create habit_logs table
CREATE TABLE habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  count INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits" ON habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits" ON habits
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own habit logs" ON habit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habit logs" ON habit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit logs" ON habit_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit logs" ON habit_logs
  FOR DELETE USING (auth.uid() = user_id);
```

### 5. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **PWA**: Service Worker, Web App Manifest

## 📱 PWA Features

The app is fully PWA-compatible with:

- Service worker for offline caching
- Web app manifest for installation
- Responsive design for mobile devices
- Native app-like experience

## 🎯 Usage

1. **Sign Up/Login**: Create an account or sign in
2. **Add Habits**: Click "Add Habit" to create new habits
3. **Track Progress**: Log your daily progress for each habit
4. **View Analytics**: Switch to the Analytics tab for insights
5. **Set Reminders**: Configure custom reminders for your habits
6. **Filter & Organize**: Use categories and date filters

## 🔧 Customization

### Adding New Categories

Edit `src/lib/supabase.ts` to add new habit categories:

```typescript
export const HABIT_CATEGORIES = [
  'Health & Fitness',
  'Learning & Education',
  'Productivity',
  'Mindfulness',
  'Social',
  'Creative',
  'Financial',
  'Your New Category', // Add here
  'Other'
] as const
```

### Styling

The app uses Tailwind CSS for styling. You can customize colors, spacing, and other design tokens in `tailwind.config.js`.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [Next.js](https://nextjs.org) for the React framework
- [Tailwind CSS](https://tailwindcss.com) for the styling
- [Lucide](https://lucide.dev) for the beautiful icons
# Updated by Chandaka
