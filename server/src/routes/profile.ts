import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../storage/db';
import { requireAuth } from '../middleware/auth';

const profileRouter = Router();

const notificationsSchema = z.object({
  notificationsEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  practiceReminders: z.boolean(),
  achievements: z.boolean(),
  weeklyReports: z.boolean(),
  meetReminders: z.boolean(),
  prAlerts: z.boolean(),
});

const preferencesSchema = z.object({
  preferredCourses: z.array(z.enum(['SCY', 'LCM', 'SCM'])).min(1),
  units: z.enum(['yards', 'meters']),
  haptics: z.boolean(),
  analytics: z.boolean(),
});

const identitySchema = z.object({
  name: z.string().min(1).max(255),
  team: z.string().max(255).optional().nullable(),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(['M', 'F']),
});

const putProfileSchema = z.object({
  profile: identitySchema,
  preferences: preferencesSchema,
  notifications: notificationsSchema,
});

async function getOwnProfile(userId: string) {
  const userResult = await pool.query(
    `SELECT id, email, name, team, age, birthday, gender, is_premium
     FROM users
     WHERE id = $1`,
    [userId]
  );

  const user = userResult.rows[0];
  if (!user) return null;

  const prefsResult = await pool.query(
    `SELECT preferred_course, preferred_courses, units, haptics, analytics
     FROM user_preferences
     WHERE user_id = $1`,
    [userId]
  );
  const prefsRow = prefsResult.rows[0];

  const notifResult = await pool.query(
    `SELECT notifications_enabled, push_enabled, email_enabled, practice_reminders, achievements, weekly_reports, meet_reminders, pr_alerts
     FROM user_notification_settings
     WHERE user_id = $1`,
    [userId]
  );
  const notifRow = notifResult.rows[0];

  const preferredCourses = Array.isArray(prefsRow?.preferred_courses) && prefsRow.preferred_courses.length > 0
    ? (prefsRow.preferred_courses as Array<'SCY' | 'LCM' | 'SCM'>)
    : [((prefsRow?.preferred_course ?? 'SCY') as 'SCY' | 'LCM' | 'SCM')];

  const preferences = {
    preferredCourse: preferredCourses[0],
    preferredCourses,
    units: (prefsRow?.units ?? 'yards') as 'yards' | 'meters',
    haptics: prefsRow?.haptics ?? true,
    analytics: prefsRow?.analytics ?? true,
  };

    const notificationsEnabled = notifRow?.notifications_enabled ?? true;
  const notifications = {
    notificationsEnabled,
    pushEnabled: notifRow?.push_enabled ?? true,
    emailEnabled: notifRow?.email_enabled ?? true,
    practiceReminders: notifRow?.practice_reminders ?? true,
    achievements: notifRow?.achievements ?? true,
    weeklyReports: notifRow?.weekly_reports ?? true,
    meetReminders: notifRow?.meet_reminders ?? true,
    prAlerts: notifRow?.pr_alerts ?? true,
  };

  const onboardingComplete = Boolean(
    user.birthday !== null &&
    user.birthday !== undefined &&
    user.gender &&
    user.gender.toString().trim().length > 0
  );

  return {
    profile: {
      name: user.name,
      team: user.team,
      age: user.age,
      birthday: user.birthday ?? null,
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
    const birthdayDate = new Date(body.profile.birthday);
    if (Number.isNaN(birthdayDate.getTime())) {
      return res.status(400).json({ error: 'Invalid birthday' });
    }
    const now = new Date();
    if (birthdayDate > now) {
      return res.status(400).json({ error: 'Birthday cannot be in the future' });
    }
    const ageYears = now.getUTCFullYear() - birthdayDate.getUTCFullYear() - (
      (now.getUTCMonth() < birthdayDate.getUTCMonth()) ||
      (now.getUTCMonth() === birthdayDate.getUTCMonth() && now.getUTCDate() < birthdayDate.getUTCDate())
        ? 1
        : 0
    );
    if (ageYears < 5 || ageYears > 120) {
      return res.status(400).json({ error: 'Birthday must map to an age between 5 and 120' });
    }

    await pool.query(
      `UPDATE users
       SET name = $1, team = $2, age = $3, birthday = $4, gender = $5, updated_at = NOW()
       WHERE id = $6`,
      [
        body.profile.name,
        body.profile.team && body.profile.team.toString().trim().length > 0 ? body.profile.team : null,
        ageYears,
        body.profile.birthday,
        body.profile.gender,
        userId,
      ]
    );

    await pool.query(
      `INSERT INTO user_preferences (user_id, preferred_course, preferred_courses, units, haptics, analytics)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id)
       DO UPDATE SET
         preferred_course = EXCLUDED.preferred_course,
         preferred_courses = EXCLUDED.preferred_courses,
         units = EXCLUDED.units,
         haptics = EXCLUDED.haptics,
         analytics = EXCLUDED.analytics,
         updated_at = NOW()`,
      [
        userId,
        body.preferences.preferredCourses[0],
        body.preferences.preferredCourses,
        body.preferences.units,
        body.preferences.haptics,
        body.preferences.analytics,
      ]
    );

    const normalizedNotifications = (() => {
      if (!body.notifications.notificationsEnabled) {
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
      const normalizedPush = body.notifications.pushEnabled;
      const normalizedEmail = body.notifications.emailEnabled;
      return {
        notificationsEnabled: true,
        pushEnabled: normalizedPush,
        emailEnabled: normalizedEmail,
        practiceReminders: normalizedPush ? body.notifications.practiceReminders : false,
        achievements: body.notifications.achievements,
        weeklyReports: normalizedEmail ? body.notifications.weeklyReports : false,
        meetReminders: normalizedPush ? body.notifications.meetReminders : false,
        prAlerts: normalizedPush ? body.notifications.prAlerts : false,
      };
    })();

    await pool.query(
      `INSERT INTO user_notification_settings (
         user_id, notifications_enabled, push_enabled, email_enabled, practice_reminders, achievements, weekly_reports, meet_reminders, pr_alerts
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (user_id)
       DO UPDATE SET
         notifications_enabled = EXCLUDED.notifications_enabled,
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
        normalizedNotifications.notificationsEnabled,
        normalizedNotifications.pushEnabled,
        normalizedNotifications.emailEnabled,
        normalizedNotifications.practiceReminders,
        normalizedNotifications.achievements,
        normalizedNotifications.weeklyReports,
        normalizedNotifications.meetReminders,
        normalizedNotifications.prAlerts,
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

