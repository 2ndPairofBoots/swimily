import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../storage/db';
import { requireAuth } from '../middleware/auth';

const profileRouter = Router();

const notificationsSchema = z.object({
  pushEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  practiceReminders: z.boolean(),
  achievements: z.boolean(),
  weeklyReports: z.boolean(),
  meetReminders: z.boolean(),
  prAlerts: z.boolean(),
});

const preferencesSchema = z.object({
  preferredCourse: z.enum(['SCY', 'LCM']),
  units: z.enum(['yards', 'meters']),
  haptics: z.boolean(),
  analytics: z.boolean(),
});

const identitySchema = z.object({
  name: z.string().min(1).max(255),
  team: z.string().min(1).max(255),
  age: z.number().int().min(1).max(119),
  gender: z.enum(['M', 'F']),
});

const putProfileSchema = z.object({
  profile: identitySchema,
  preferences: preferencesSchema,
  notifications: notificationsSchema,
});

async function getOwnProfile(userId: string) {
  const userResult = await pool.query(
    `SELECT id, email, name, team, age, gender, is_premium
     FROM users
     WHERE id = $1`,
    [userId]
  );

  const user = userResult.rows[0];
  if (!user) return null;

  const prefsResult = await pool.query(
    `SELECT preferred_course, units, haptics, analytics
     FROM user_preferences
     WHERE user_id = $1`,
    [userId]
  );
  const prefsRow = prefsResult.rows[0];

  const notifResult = await pool.query(
    `SELECT push_enabled, email_enabled, practice_reminders, achievements, weekly_reports, meet_reminders, pr_alerts
     FROM user_notification_settings
     WHERE user_id = $1`,
    [userId]
  );
  const notifRow = notifResult.rows[0];

  const preferences = {
    preferredCourse: (prefsRow?.preferred_course ?? 'SCY') as 'SCY' | 'LCM',
    units: (prefsRow?.units ?? 'yards') as 'yards' | 'meters',
    haptics: prefsRow?.haptics ?? true,
    analytics: prefsRow?.analytics ?? true,
  };

  const notifications = {
    pushEnabled: notifRow?.push_enabled ?? true,
    emailEnabled: notifRow?.email_enabled ?? true,
    practiceReminders: notifRow?.practice_reminders ?? true,
    achievements: notifRow?.achievements ?? true,
    weeklyReports: notifRow?.weekly_reports ?? true,
    meetReminders: notifRow?.meet_reminders ?? true,
    prAlerts: notifRow?.pr_alerts ?? true,
  };

  const onboardingComplete = Boolean(
    user.team &&
    user.team.toString().trim().length > 0 &&
    user.age !== null &&
    user.age !== undefined &&
    user.gender &&
    user.gender.toString().trim().length > 0
  );

  return {
    profile: {
      name: user.name,
      team: user.team,
      age: user.age,
      gender: user.gender ?? null,
      email: user.email,
      isPremium: Boolean(user.is_premium),
    },
    preferences,
    notifications,
    onboardingComplete,
  };
}

profileRouter.get('/profile', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth?.userId as string | undefined;
    if (!userId) return res.status(401).json({ error: 'Invalid token' });

    const data = await getOwnProfile(userId);
    if (!data) return res.status(404).json({ error: 'Profile not found' });
    return res.json(data);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

profileRouter.put('/profile', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth?.userId as string | undefined;
    if (!userId) return res.status(401).json({ error: 'Invalid token' });

    const body = putProfileSchema.parse(req.body);

    await pool.query(
      `UPDATE users
       SET name = $1, team = $2, age = $3, gender = $4, updated_at = NOW()
       WHERE id = $5`,
      [body.profile.name, body.profile.team, body.profile.age, body.profile.gender ?? null, userId]
    );

    await pool.query(
      `INSERT INTO user_preferences (user_id, preferred_course, units, haptics, analytics)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id)
       DO UPDATE SET
         preferred_course = EXCLUDED.preferred_course,
         units = EXCLUDED.units,
         haptics = EXCLUDED.haptics,
         analytics = EXCLUDED.analytics,
         updated_at = NOW()`,
      [userId, body.preferences.preferredCourse, body.preferences.units, body.preferences.haptics, body.preferences.analytics]
    );

    await pool.query(
      `INSERT INTO user_notification_settings (
         user_id, push_enabled, email_enabled, practice_reminders, achievements, weekly_reports, meet_reminders, pr_alerts
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id)
       DO UPDATE SET
         push_enabled = EXCLUDED.push_enabled,
         email_enabled = EXCLUDED.email_enabled,
         practice_reminders = EXCLUDED.practice_reminders,
         achievements = EXCLUDED.achievements,
         weekly_reports = EXCLUDED.weekly_reports,
         meet_reminders = EXCLUDED.meet_reminders,
         pr_alerts = EXCLUDED.pr_alerts,
         updated_at = NOW()`,
      [
        userId,
        body.notifications.pushEnabled,
        body.notifications.emailEnabled,
        body.notifications.practiceReminders,
        body.notifications.achievements,
        body.notifications.weeklyReports,
        body.notifications.meetReminders,
        body.notifications.prAlerts,
      ]
    );

    const data = await getOwnProfile(userId);
    if (!data) return res.status(404).json({ error: 'Profile not found' });
    return res.json(data);
  } catch (err) {
    return res.status(400).json({
      error: err instanceof Error ? err.message : 'Failed to save profile',
    });
  }
});

export { profileRouter };

