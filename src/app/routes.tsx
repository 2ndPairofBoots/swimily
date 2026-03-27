import { createBrowserRouter } from 'react-router';
import Root from './Root';
import LoadingScreen from './components/LoadingScreen';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    HydrateFallback: LoadingScreen,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('./pages/Dashboard')).default }),
      },
      { path: 'login', lazy: async () => ({ Component: (await import('./pages/Login')).default }) },
      { path: 'register', lazy: async () => ({ Component: (await import('./pages/Register')).default }) },
      { path: 'onboarding', lazy: async () => ({ Component: (await import('./pages/Onboarding')).default }) },
      { path: 'verify-email', lazy: async () => ({ Component: (await import('./pages/VerifyEmail')).default }) },
      { path: 'password-reset', lazy: async () => ({ Component: (await import('./pages/PasswordResetRequest')).default }) },
      {
        path: 'password-reset/confirm',
        lazy: async () => ({ Component: (await import('./pages/PasswordResetConfirm')).default }),
      },
      { path: 'log', lazy: async () => ({ Component: (await import('./pages/Log')).default }) },
      { path: 'records', lazy: async () => ({ Component: (await import('./pages/Records')).default }) },
      { path: 'profile', lazy: async () => ({ Component: (await import('./pages/Profile')).default }) },
      { path: 'more', lazy: async () => ({ Component: (await import('./pages/More')).default }) },
      { path: 'calendar', lazy: async () => ({ Component: (await import('./pages/Calendar')).default }) },
      { path: 'meets', lazy: async () => ({ Component: (await import('./pages/Meets')).default }) },
      { path: 'race-splits', lazy: async () => ({ Component: (await import('./pages/RaceSplits')).default }) },
      { path: 'dryland', lazy: async () => ({ Component: (await import('./pages/Dryland')).default }) },
      { path: 'analytics', lazy: async () => ({ Component: (await import('./pages/Analytics')).default }) },
      { path: 'ai-trainer', lazy: async () => ({ Component: (await import('./pages/AITrainer')).default }) },
      { path: 'rewards', lazy: async () => ({ Component: (await import('./pages/Rewards')).default }) },
      { path: 'import-times', lazy: async () => ({ Component: (await import('./pages/ImportTimes')).default }) },
      { path: 'settings', lazy: async () => ({ Component: (await import('./pages/Settings')).default }) },
      { path: 'edit-profile', lazy: async () => ({ Component: (await import('./pages/EditProfile')).default }) },
      { path: 'privacy-data', lazy: async () => ({ Component: (await import('./pages/PrivacyData')).default }) },
      { path: 'notifications', lazy: async () => ({ Component: (await import('./pages/Notifications')).default }) },
      { path: 'help-center', lazy: async () => ({ Component: (await import('./pages/HelpCenter')).default }) },
      { path: 'contact-support', lazy: async () => ({ Component: (await import('./pages/ContactSupport')).default }) },
      { path: 'terms-privacy', lazy: async () => ({ Component: (await import('./pages/TermsPrivacy')).default }) },
      { path: 'debug-settings', lazy: async () => ({ Component: (await import('./pages/DebugSettings')).default }) },
      { path: '*', lazy: async () => ({ Component: (await import('./pages/NotFound')).default }) },
    ],
  },
]);