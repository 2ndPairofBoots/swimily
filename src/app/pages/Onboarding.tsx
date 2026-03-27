import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import Card from '../components/Card';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { useUser } from '../contexts/UserContext';
import { ageFromBirthdayString, ageNumberToString, isValidBirthday, saveOwnProfile, type PreferredCourse } from '../lib/profile';
import { searchClubs, type ClubSearchResult } from '../lib/clubs-api';

type Step = 1 | 2 | 3;

export default function Onboarding() {
  const navigate = useNavigate();
  const { profile, preferences, notifications, updateProfile, updatePreferences, updateNotifications } = useUser();

  const [step, setStep] = useState<Step>(1);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState(profile.name);
  const [team, setTeam] = useState(profile.team);
  const [birthday, setBirthday] = useState(profile.birthday ?? '');
  const [gender, setGender] = useState<'M' | 'F'>(profile.gender);
  const [clubQuery, setClubQuery] = useState(profile.team ?? '');
  const [clubResults, setClubResults] = useState<ClubSearchResult[]>([]);
  const [showClubResults, setShowClubResults] = useState(false);

  const [preferredCourses, setPreferredCourses] = useState<PreferredCourse[]>(
    preferences.preferredCourses && preferences.preferredCourses.length > 0
      ? preferences.preferredCourses
      : [preferences.preferredCourse]
  );
  const [units, setUnits] = useState(preferences.units);
  const [haptics, setHaptics] = useState(preferences.haptics);
  const [analytics, setAnalytics] = useState(preferences.analytics);

  const [pushEnabled, setPushEnabled] = useState(notifications.pushEnabled);
  const [emailEnabled, setEmailEnabled] = useState(notifications.emailEnabled);
  const [notificationsEnabled, setNotificationsEnabled] = useState(notifications.notificationsEnabled ?? true);
  const [practiceReminders, setPracticeReminders] = useState(notifications.practiceReminders);
  const [achievements, setAchievements] = useState(notifications.achievements);
  const [weeklyReports, setWeeklyReports] = useState(notifications.weeklyReports);
  const [meetReminders, setMeetReminders] = useState(notifications.meetReminders);
  const [prAlerts, setPrAlerts] = useState(notifications.prAlerts);

  const channelsDisabled = !notificationsEnabled;
  const trainingDisabled = channelsDisabled || !pushEnabled;
  const weeklyDisabled = channelsDisabled || !emailEnabled;

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(async () => {
      const q = clubQuery.trim();
      if (q.length < 2) {
        if (!cancelled) setClubResults([]);
        return;
      }
      const rows = await searchClubs(q, 8);
      if (!cancelled) setClubResults(rows);
    }, 180);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [clubQuery]);

  const progressPct = useMemo(() => {
    return step === 1 ? 33 : step === 2 ? 66 : 100;
  }, [step]);

  const canContinue = () => {
    if (step === 1) {
      return name.trim().length > 0 && isValidBirthday(birthday) && (gender === 'M' || gender === 'F');
    }
    if (step === 2) return preferredCourses.length > 0;
    return true;
  };

  const togglePreferredCourse = (course: 'SCY' | 'LCM' | 'SCM') => {
    setPreferredCourses((prev) => {
      if (prev.includes(course)) return prev.filter((c) => c !== course);
      return [...prev, course];
    });
  };

  const handleNext = () => {
    if (!canContinue()) {
      toast.error('Please add your name, birthday, and gender.');
      return;
    }
    setStep((s) => (s === 3 ? 3 : ((s + 1) as Step)));
  };

  const handleBack = () => {
    setStep((s) => (s === 1 ? 1 : ((s - 1) as Step)));
  };

  const handleFinish = async () => {
    if (!canContinue()) {
      toast.error('Please add your name, birthday, and gender.');
      return;
    }

    setIsSaving(true);
    try {
      if (!isValidBirthday(birthday)) {
        toast.error('Please enter a valid birthday (age 5-120).');
        return;
      }
      const normalizedNotifications = (() => {
        if (!notificationsEnabled) {
          return {
            notificationsEnabled: false,
            pushEnabled: false,
            emailEnabled: false,
            practiceReminders: false,
            achievements: false,
            weeklyReports: false,
            meetReminders: false,
            prAlerts: false,
          };
        }

        const normalizedPush = pushEnabled;
        const normalizedEmail = emailEnabled;
        return {
          notificationsEnabled: true,
          pushEnabled: normalizedPush,
          emailEnabled: normalizedEmail,
          practiceReminders: normalizedPush ? practiceReminders : false,
          achievements: achievements,
          weeklyReports: normalizedEmail ? weeklyReports : false,
          meetReminders: normalizedPush ? meetReminders : false,
          prAlerts: normalizedPush ? prAlerts : false,
        };
      })();

      const { profile: savedProfile, preferences: savedPreferences, notifications: savedNotifications } = await saveOwnProfile({
        profile: { name: name.trim(), team: team.trim() || undefined, birthday, gender },
        preferences: { preferredCourses, units, haptics, analytics },
        notifications: normalizedNotifications,
      });

      updateProfile({
        name: savedProfile?.name ?? name.trim(),
        team: savedProfile?.team ?? team.trim(),
        email: savedProfile?.email ?? profile.email,
        birthday: savedProfile?.birthday ?? birthday,
        age: savedProfile?.birthday
          ? ageFromBirthdayString(savedProfile.birthday)
          : ageNumberToString(savedProfile?.age),
        gender: savedProfile?.gender ?? gender,
        isPremium: savedProfile?.isPremium ?? profile.isPremium,
      });

      updatePreferences({
        preferredCourse: savedPreferences?.preferredCourse ?? preferredCourses[0],
        preferredCourses: savedPreferences?.preferredCourses ?? preferredCourses,
        units: savedPreferences?.units ?? units,
        haptics: savedPreferences?.haptics ?? haptics,
        analytics: savedPreferences?.analytics ?? analytics,
      });

      updateNotifications({
        notificationsEnabled: savedNotifications?.notificationsEnabled ?? normalizedNotifications.notificationsEnabled,
        pushEnabled: savedNotifications?.pushEnabled ?? normalizedNotifications.pushEnabled,
        emailEnabled: savedNotifications?.emailEnabled ?? normalizedNotifications.emailEnabled,
        practiceReminders: savedNotifications?.practiceReminders ?? normalizedNotifications.practiceReminders,
        achievements: savedNotifications?.achievements ?? normalizedNotifications.achievements,
        weeklyReports: savedNotifications?.weeklyReports ?? normalizedNotifications.weeklyReports,
        meetReminders: savedNotifications?.meetReminders ?? normalizedNotifications.meetReminders,
        prAlerts: savedNotifications?.prAlerts ?? normalizedNotifications.prAlerts,
      });

      toast.success('You’re all set!', { description: 'Welcome to Swimily.' });
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save onboarding settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
      <div className="px-6 pt-16 pb-6">
        <div className="flex items-center justify-between mb-6">
          <Logo size="sm" variant="wordmark" />
          <Link to="/" className="text-sm font-semibold text-cyan-500 hover:text-cyan-400">
            Skip
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight">Onboarding</h1>
        <p className="text-sm text-gray-400 light:text-gray-600 mt-2">
          {step === 1 ? 'Let’s personalize your profile.' : step === 2 ? 'Set up training preferences.' : 'Choose your notifications.'}
        </p>
      </div>

      <div className="px-6">
        <Card className="p-6">
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Step {step} of 3</span>
              <span className="text-xs font-semibold text-cyan-300">{progressPct}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-2">
                  Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl text-white light:text-gray-900 font-bold focus:ring-2 focus:ring-cyan-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-2">
                  Team / Club
                </label>
                <input
                  value={clubQuery}
                  onChange={(e) => {
                    const next = e.target.value;
                    setClubQuery(next);
                    setTeam(next);
                    setShowClubResults(true);
                  }}
                  onFocus={() => setShowClubResults(true)}
                  onBlur={() => {
                    setTimeout(() => setShowClubResults(false), 120);
                  }}
                  className="w-full px-4 py-3 bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl text-white light:text-gray-900 font-bold focus:ring-2 focus:ring-cyan-500"
                  placeholder="Search US clubs or type your own (optional)"
                />
                {showClubResults && clubResults.length > 0 && (
                  <div className="mt-2 max-h-44 overflow-auto rounded-xl border border-white/10 light:border-gray-300 bg-black/80 light:bg-white">
                    {clubResults.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-white/10 light:hover:bg-gray-100 transition-colors"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setTeam(c.name);
                          setClubQuery(c.name);
                          setShowClubResults(false);
                        }}
                      >
                        <div className="text-sm font-semibold text-white light:text-gray-900">{c.name}</div>
                        <div className="text-xs text-gray-400 light:text-gray-600">
                          {[c.city, c.state].filter(Boolean).join(', ')}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {showClubResults && clubQuery.trim().length >= 2 && clubResults.length === 0 && (
                  <div className="mt-2 text-xs text-gray-400 light:text-gray-600">
                    No club matches found. You can still type your club manually.
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-2">
                  Birthday
                </label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl text-white light:text-gray-900 font-bold focus:ring-2 focus:ring-cyan-500"
                />
                <p className="mt-2 text-xs text-gray-400 light:text-gray-600">Used to calculate your racing age automatically.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-2">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('M')}
                    className={`py-3 rounded-xl font-bold text-sm transition-all ${
                      gender === 'M' ? 'bg-cyan-500 text-black' : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('F')}
                    className={`py-3 rounded-xl font-bold text-sm transition-all ${
                      gender === 'F' ? 'bg-cyan-500 text-black' : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-2">
                  Training Courses
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => togglePreferredCourse('SCY')}
                    className={`py-3 rounded-xl font-bold text-sm transition-all ${preferredCourses.includes('SCY') ? 'bg-cyan-500 text-black' : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'}`}
                  >
                    SCY
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePreferredCourse('LCM')}
                    className={`py-3 rounded-xl font-bold text-sm transition-all ${preferredCourses.includes('LCM') ? 'bg-cyan-500 text-black' : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'}`}
                  >
                    LCM
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePreferredCourse('SCM')}
                    className={`py-3 rounded-xl font-bold text-sm transition-all ${preferredCourses.includes('SCM') ? 'bg-cyan-500 text-black' : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'}`}
                  >
                    SCM
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-400 light:text-gray-600">Pick all courses you train or race in.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-2">
                  Distance Units
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUnits('yards')}
                    className={`py-3 rounded-xl font-bold text-sm transition-all ${units === 'yards' ? 'bg-cyan-500 text-black' : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'}`}
                  >
                    Yards
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnits('meters')}
                    className={`py-3 rounded-xl font-bold text-sm transition-all ${units === 'meters' ? 'bg-cyan-500 text-black' : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'}`}
                  >
                    Meters
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <button
                    type="button"
                    onClick={() => setHaptics((v) => !v)}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                      haptics ? 'bg-cyan-500 text-black' : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'
                    }`}
                  >
                    Haptics: {haptics ? 'On' : 'Off'}
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setAnalytics((v) => !v)}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                      analytics ? 'bg-cyan-500 text-black' : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'
                    }`}
                  >
                    Usage analytics: {analytics ? 'On' : 'Off'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div>
                <button
                  type="button"
                  onClick={() => setNotificationsEnabled((v) => !v)}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                    notificationsEnabled ? 'bg-cyan-500 text-black' : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'
                  }`}
                >
                  Notifications: {notificationsEnabled ? 'On' : 'Off'}
                </button>
              </div>

              <div className="pt-1">
                <p className="text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-2">Channels</p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => !channelsDisabled && setPushEnabled((v) => !v)}
                    disabled={channelsDisabled}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                      pushEnabled && !channelsDisabled ? 'bg-cyan-500 text-black' : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'
                    } ${channelsDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Push notifications: {pushEnabled && !channelsDisabled ? 'On' : 'Off'}
                  </button>
                  <button
                    type="button"
                    onClick={() => !channelsDisabled && setEmailEnabled((v) => !v)}
                    disabled={channelsDisabled}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                      emailEnabled && !channelsDisabled ? 'bg-cyan-500 text-black' : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'
                    } ${channelsDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Email notifications: {emailEnabled && !channelsDisabled ? 'On' : 'Off'}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-2">Training Alerts</p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => !trainingDisabled && setPracticeReminders((v) => !v)}
                    disabled={trainingDisabled}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                      practiceReminders && !trainingDisabled ? 'bg-cyan-500 text-black' : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'
                    } ${trainingDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Practice reminders: {practiceReminders && !trainingDisabled ? 'On' : 'Off'}
                  </button>
                  <button
                    type="button"
                    onClick={() => !trainingDisabled && setMeetReminders((v) => !v)}
                    disabled={trainingDisabled}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                      meetReminders && !trainingDisabled ? 'bg-cyan-500 text-black' : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'
                    } ${trainingDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Meet reminders: {meetReminders && !trainingDisabled ? 'On' : 'Off'}
                  </button>
                  <button
                    type="button"
                    onClick={() => !trainingDisabled && setPrAlerts((v) => !v)}
                    disabled={trainingDisabled}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                      prAlerts && !trainingDisabled ? 'bg-cyan-500 text-black' : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'
                    } ${trainingDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    PR alerts: {prAlerts && !trainingDisabled ? 'On' : 'Off'}
                  </button>
                  {trainingDisabled && (
                    <p className="text-xs text-gray-400 light:text-gray-600">
                      Enable notifications and push to use training alerts.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-2">Progress</p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => !channelsDisabled && setAchievements((v) => !v)}
                    disabled={channelsDisabled}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                      achievements && !channelsDisabled ? 'bg-cyan-500 text-black' : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'
                    } ${channelsDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Achievements: {achievements && !channelsDisabled ? 'On' : 'Off'}
                  </button>
                  <button
                    type="button"
                    onClick={() => !weeklyDisabled && setWeeklyReports((v) => !v)}
                    disabled={weeklyDisabled}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                      weeklyReports && !weeklyDisabled ? 'bg-cyan-500 text-black' : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'
                    } ${weeklyDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Weekly reports: {weeklyReports && !weeklyDisabled ? 'On' : 'Off'}
                  </button>
                  {weeklyDisabled && (
                    <p className="text-xs text-gray-400 light:text-gray-600">
                      Enable notifications and email to receive weekly reports.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            {step > 1 ? (
              <Button type="button" variant="secondary" size="lg" fullWidth onClick={handleBack}>
                Back
              </Button>
            ) : (
              <div className="flex-1" />
            )}

            {step < 3 ? (
              <Button
                type="button"
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleNext}
                disabled={!canContinue() || isSaving}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleFinish}
                disabled={isSaving}
              >
                Finish
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

