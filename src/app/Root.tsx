import { Navigate, Outlet, useLocation } from 'react-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import MobileLayout from './components/MobileLayout';
import { Toaster } from 'sonner';
import { authService } from './lib/auth';
import { ageFromBirthdayString, ageNumberToString, fetchOwnProfile } from './lib/profile';
import { useUser } from './contexts/UserContext';

export default function Root() {
  const location = useLocation();
  const { profile, updateProfile, updatePreferences, updateNotifications } = useUser();

  const isPublicAuthRoute = useMemo(() => {
    return (
      location.pathname.startsWith('/login') ||
      location.pathname.startsWith('/register') ||
      location.pathname.startsWith('/verify-email') ||
      location.pathname.startsWith('/password-reset')
    );
  }, [location.pathname]);

  const hydrationRan = useRef(false);
  const [authReady, setAuthReady] = useState(isPublicAuthRoute);
  const [onboardingCompleteFromServer, setOnboardingCompleteFromServer] = useState<boolean | null>(null);

  // Hydrate auth/profile from refresh cookie on cold start.
  useEffect(() => {
    if (hydrationRan.current) return;
    if (isPublicAuthRoute) {
      setAuthReady(true);
      return;
    }

    hydrationRan.current = true;
    setAuthReady(false);

    (async () => {
      try {
        await authService.refreshToken();
        const { profile: p, preferences, notifications, onboardingComplete } = await fetchOwnProfile();

        updateProfile({
          name: p?.name ?? '',
          team: p?.team ?? '',
          email: p?.email ?? '',
          birthday: p?.birthday ?? '',
          age: p?.birthday ? ageFromBirthdayString(p.birthday) : ageNumberToString(p?.age),
          gender: p?.gender ?? 'M',
          isPremium: p?.isPremium ?? false,
        });

        updatePreferences({
          preferredCourse: preferences?.preferredCourse ?? 'SCY',
          preferredCourses:
            preferences?.preferredCourses && preferences.preferredCourses.length > 0
              ? preferences.preferredCourses
              : [preferences?.preferredCourse ?? 'SCY'],
          units: preferences?.units ?? 'yards',
          haptics: preferences?.haptics ?? true,
          analytics: preferences?.analytics ?? true,
        });

        updateNotifications({
          notificationsEnabled: notifications?.notificationsEnabled ?? true,
          pushEnabled: notifications?.pushEnabled ?? true,
          emailEnabled: notifications?.emailEnabled ?? true,
          practiceReminders: notifications?.practiceReminders ?? true,
          achievements: notifications?.achievements ?? true,
          weeklyReports: notifications?.weeklyReports ?? true,
          meetReminders: notifications?.meetReminders ?? true,
          prAlerts: notifications?.prAlerts ?? true,
        });

        setOnboardingCompleteFromServer(Boolean(onboardingComplete));
      } catch {
        // authService will clear its own state on 401.
      } finally {
        setAuthReady(true);
      }
    })();
  }, [isPublicAuthRoute, updateNotifications, updatePreferences, updateProfile]);

  if (!authReady && !isPublicAuthRoute) {
    return (
      <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA] flex items-center justify-center">
        <span className="text-white/80 light:text-gray-900 font-semibold">Loading…</span>
      </div>
    );
  }

  // Redirect unauthenticated users away from protected app routes.
  if (authReady && !isPublicAuthRoute && !authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to onboarding until completed (but keep login/register public).
  if (
    authReady &&
    !isPublicAuthRoute &&
    authService.isAuthenticated() &&
    onboardingCompleteFromServer === false &&
    !location.pathname.startsWith('/onboarding')
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <>
      <MobileLayout>
        <Outlet />
      </MobileLayout>
      <Toaster position="top-center" richColors />
    </>
  );
}
