import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SwimmerLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type CourseType = 'SCY' | 'LCM' | 'SCM';
export type DistanceUnits = 'yards' | 'meters';

export interface UserProfile {
  name: string;
  team: string;
  email: string;
  birthday: string;
  age: string;
  gender: 'M' | 'F';
  level: SwimmerLevel;
  xp: number;
  streakDays: number;
  isPremium: boolean;
  profilePhoto?: string;
}

export interface UserPreferences {
  units: DistanceUnits;
  preferredCourse: CourseType;
  preferredCourses: CourseType[];
  haptics: boolean;
  analytics: boolean;
}

export interface NotificationSettings {
  notificationsEnabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  practiceReminders: boolean;
  achievements: boolean;
  weeklyReports: boolean;
  meetReminders: boolean;
  prAlerts: boolean;
}

interface UserContextType {
  profile: UserProfile;
  preferences: UserPreferences;
  notifications: NotificationSettings;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  updateNotifications: (updates: Partial<NotificationSettings>) => void;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  resetUser: () => void;
}

const STORAGE_KEY = 'swimily_user_data';

const defaultProfile: UserProfile = {
  name: 'Sarah Chen',
  team: 'Stanford Swim Club',
  email: 'swimmer@example.com',
  birthday: '2008-01-15',
  age: '16',
  gender: 'F',
  level: 4,
  xp: 3420,
  streakDays: 12,
  isPremium: false,
};

const defaultPreferences: UserPreferences = {
  units: 'yards',
  preferredCourse: 'SCY',
  preferredCourses: ['SCY'],
  haptics: true,
  analytics: true,
};

const defaultNotifications: NotificationSettings = {
  notificationsEnabled: true,
  pushEnabled: true,
  emailEnabled: true,
  practiceReminders: true,
  achievements: true,
  weeklyReports: true,
  meetReminders: true,
  prAlerts: true,
};

const loggedOutProfile: UserProfile = {
  name: '',
  team: '',
  email: '',
  birthday: '',
  age: '',
  gender: 'M',
  level: 1,
  xp: 0,
  streakDays: 0,
  isPremium: false,
};

const noop = () => {};

const fallbackContext: UserContextType = {
  profile: defaultProfile,
  preferences: defaultPreferences,
  notifications: defaultNotifications,
  updateProfile: noop,
  updatePreferences: noop,
  updateNotifications: noop,
  addXP: noop,
  incrementStreak: noop,
  resetUser: noop,
};

const UserContext = createContext<UserContextType>(fallbackContext);

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return { ...defaultProfile, ...parsed.profile };
      } catch {
        return defaultProfile;
      }
    }
    return defaultProfile;
  });

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const merged = { ...defaultPreferences, ...parsed.preferences };
        if (!Array.isArray(merged.preferredCourses) || merged.preferredCourses.length === 0) {
          merged.preferredCourses = [merged.preferredCourse ?? 'SCY'];
        }
        return merged;
      } catch {
        return defaultPreferences;
      }
    }
    return defaultPreferences;
  });

  const [notifications, setNotifications] = useState<NotificationSettings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return { ...defaultNotifications, ...parsed.notifications };
      } catch {
        return defaultNotifications;
      }
    }
    return defaultNotifications;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    const data = {
      profile,
      preferences,
      notifications,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [profile, preferences, notifications]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const updateNotifications = (updates: Partial<NotificationSettings>) => {
    setNotifications(prev => ({ ...prev, ...updates }));
  };

  const addXP = (amount: number) => {
    setProfile(prev => {
      const newXP = prev.xp + amount;
      const newLevel = Math.min(6, Math.floor(newXP / 1000) + 1) as SwimmerLevel;
      return { ...prev, xp: newXP, level: newLevel };
    });
  };

  const incrementStreak = () => {
    setProfile(prev => ({ ...prev, streakDays: prev.streakDays + 1 }));
  };

  const resetUser = () => {
    // Clear persisted state so a fresh login/hydration doesn't pick up stale values.
    localStorage.removeItem(STORAGE_KEY);
    setProfile(loggedOutProfile);
    setPreferences(defaultPreferences);
    setNotifications(defaultNotifications);
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        preferences,
        notifications,
        updateProfile,
        updatePreferences,
        updateNotifications,
        addXP,
        incrementStreak,
        resetUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
