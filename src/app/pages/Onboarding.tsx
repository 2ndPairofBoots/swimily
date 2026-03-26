import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import Card from '../components/Card';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { useUser } from '../contexts/UserContext';
import { ageNumberToString, parseAgeString, saveOwnProfile } from '../lib/profile';

type Step = 1 | 2 | 3;

export default function Onboarding() {
  const navigate = useNavigate();
  const { profile, preferences, notifications, updateProfile, updatePreferences, updateNotifications } = useUser();

  const [step, setStep] = useState<Step>(1);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState(profile.name);
  const [team, setTeam] = useState(profile.team);
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState<'M' | 'F'>(profile.gender);

  const [preferredCourse, setPreferredCourse] = useState(preferences.preferredCourse);
  const [units, setUnits] = useState(preferences.units);
  const [haptics, setHaptics] = useState(preferences.haptics);
  const [analytics, setAnalytics] = useState(preferences.analytics);

  const [pushEnabled, setPushEnabled] = useState(notifications.pushEnabled);
  const [emailEnabled, setEmailEnabled] = useState(notifications.emailEnabled);
  const [practiceReminders, setPracticeReminders] = useState(notifications.practiceReminders);
  const [achievements, setAchievements] = useState(notifications.achievements);
  const [weeklyReports, setWeeklyReports] = useState(notifications.weeklyReports);
  const [meetReminders, setMeetReminders] = useState(notifications.meetReminders);
  const [prAlerts, setPrAlerts] = useState(notifications.prAlerts);

  const progressPct = useMemo(() => {
    return step === 1 ? 33 : step === 2 ? 66 : 100;
  }, [step]);

  const canContinue = () => {
    if (step === 1) {
      const ageNum = parseAgeString(age);
      return name.trim().length > 0 && team.trim().length > 0 && ageNum !== null && (gender === 'M' || gender === 'F');
    }
    if (step === 2) return true;
    return true;
  };

  const handleNext = () => {
    if (!canContinue()) {
      toast.error('Please complete the required fields.');
      return;
    }
    setStep((s) => (s === 3 ? 3 : ((s + 1) as Step)));
  };

  const handleBack = () => {
    setStep((s) => (s === 1 ? 1 : ((s - 1) as Step)));
  };

  const handleFinish = async () => {
    if (!canContinue()) {
      toast.error('Please complete the required fields.');
      return;
    }

    setIsSaving(true);
    try {
      const ageNum = parseAgeString(age);
      if (ageNum === null) {
        toast.error('Enter a valid age');
        return;
      }
      const { profile: savedProfile, preferences: savedPreferences, notifications: savedNotifications } = await saveOwnProfile({
        profile: { name: name.trim(), team: team.trim(), age: ageNum, gender },
        preferences: { preferredCourse, units, haptics, analytics },
        notifications: {
          pushEnabled,
          emailEnabled,
          practiceReminders,
          achievements,
          weeklyReports,
          meetReminders,
          prAlerts,
        },
      });

      updateProfile({
        name: savedProfile?.name ?? name.trim(),
        team: savedProfile?.team ?? team.trim(),
        email: savedProfile?.email ?? profile.email,
        age: ageNumberToString(savedProfile?.age),
        gender: savedProfile?.gender ?? gender,
        isPremium: savedProfile?.isPremium ?? profile.isPremium,
      });

      updatePreferences({
        preferredCourse: savedPreferences?.preferredCourse ?? preferredCourse,
        units: savedPreferences?.units ?? units,
        haptics: savedPreferences?.haptics ?? haptics,
        analytics: savedPreferences?.analytics ?? analytics,
      });

      updateNotifications({
        pushEnabled: savedNotifications?.pushEnabled ?? pushEnabled,
        emailEnabled: savedNotifications?.emailEnabled ?? emailEnabled,
        practiceReminders: savedNotifications?.practiceReminders ?? practiceReminders,
        achievements: savedNotifications?.achievements ?? achievements,
        weeklyReports: savedNotifications?.weeklyReports ?? weeklyReports,
        meetReminders: savedNotifications?.meetReminders ?? meetReminders,
        prAlerts: savedNotifications?.prAlerts ?? prAlerts,
      });

      toast.success('You’re all set!', { description: 'Welcome to Swimily.' });
      navigate('/');
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
          <Logo size="sm" />
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
                  Team
                </label>
                <input
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl text-white light:text-gray-900 font-bold focus:ring-2 focus:ring-cyan-500"
                  placeholder="Swim team / club"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-2">
                  Age
                </label>
                <input
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  inputMode="numeric"
                  className="w-full px-4 py-3 bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl text-white light:text-gray-900 font-bold focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g. 16"
                />
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
                  Preferred Course
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPreferredCourse('SCY')}
                    className={`py-3 rounded-xl font-bold text-sm transition-all ${preferredCourse === 'SCY' ? 'bg-cyan-500 text-black' : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'}`}
                  >
                    SCY
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredCourse('LCM')}
                    className={`py-3 rounded-xl font-bold text-sm transition-all ${preferredCourse === 'LCM' ? 'bg-cyan-500 text-black' : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'}`}
                  >
                    LCM
                  </button>
                </div>
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
              {[
                { key: 'push', label: 'Push notifications', value: pushEnabled, set: setPushEnabled },
                { key: 'email', label: 'Email notifications', value: emailEnabled, set: setEmailEnabled },
                { key: 'practice', label: 'Practice reminders', value: practiceReminders, set: setPracticeReminders },
                { key: 'ach', label: 'Achievements', value: achievements, set: setAchievements },
                { key: 'weekly', label: 'Weekly reports', value: weeklyReports, set: setWeeklyReports },
                { key: 'meet', label: 'Meet reminders', value: meetReminders, set: setMeetReminders },
                { key: 'pr', label: 'PR alerts', value: prAlerts, set: setPrAlerts },
              ].map((row) => (
                <div key={row.key}>
                  <button
                    type="button"
                    onClick={() => row.set((row.value as boolean) ? false : true)}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                      row.value ? 'bg-cyan-500 text-black' : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'
                    }`}
                  >
                    {row.label}: {row.value ? 'On' : 'Off'}
                  </button>
                </div>
              ))}
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

