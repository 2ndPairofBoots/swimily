import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ErrorBoundary from '@/components/ErrorBoundary';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import LogPractice from '@/pages/LogPractice';
import CalendarPage from '@/pages/CalendarPage';
import Workouts from '@/pages/Workouts';
import Taper from '@/pages/Taper';
import Records from '@/pages/Records';
import RaceSplits from '@/pages/RaceSplits';
import MeetSchedule from '@/pages/MeetSchedule';
import Analytics from '@/pages/Analytics';
import Rewards from '@/pages/Rewards';
import Profile from '@/pages/Profile';
import AITrainer from '@/pages/AITrainer';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#111]">
        <div className="w-8 h-8 border-4 border-cyan-900 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/log-practice" element={<LogPractice />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/taper" element={<Taper />} />
        <Route path="/records" element={<Records />} />
        <Route path="/race-splits" element={<RaceSplits />} />
        <Route path="/meets" element={<MeetSchedule />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ai-trainer" element={<AITrainer />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router basename="/swimily">
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App