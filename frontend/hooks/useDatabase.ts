import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blink } from '@/lib/blink';
import type {
  Exercise,
  Template,
  TemplateExercise,
  TemplateWithExercises,
  Session,
  SessionExercise,
  SessionSet,
  SessionWithExercises,
  PersonalRecord,
  UserExercise,
} from '@/types';

// -- EXERCISES (public) --

export function useExercises() {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const data = await blink.db.table<Exercise>('exercises').list({ orderBy: { name: 'asc' } });
      return data;
    },
  });
}

// -- TEMPLATES (private, user-scoped) --

export function useTemplates(userId: string | null) {
  return useQuery({
    queryKey: ['templates', userId],
    queryFn: async () => {
      if (!userId) return [];
      const templates = await blink.db.table<Template>('templates').list({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      return templates;
    },
    enabled: !!userId,
  });
}

export function useTemplateWithExercises(templateId: string | null) {
  return useQuery({
    queryKey: ['template', templateId],
    queryFn: async () => {
      if (!templateId) return null;
      const tpl = await blink.db.table<Template>('templates').get(templateId);
      if (!tpl) return null;
      const exercises = await blink.db.table<TemplateExercise>('templateExercises').list({
        where: { templateId },
        orderBy: { sortOrder: 'asc' },
      });
      return { ...tpl, exercises } as TemplateWithExercises;
    },
    enabled: !!templateId,
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      userId: string;
      name: string;
      description?: string;
      exercises: { exerciseId: string; exerciseName: string; muscleGroup: string; defaultSets: number; defaultReps: number }[];
    }) => {
      const tpl = await blink.db.table<Template>('templates').create({
        userId: data.userId,
        name: data.name,
        description: data.description || '',
      });
      for (let i = 0; i < data.exercises.length; i++) {
        const ex = data.exercises[i];
        await blink.db.table<TemplateExercise>('templateExercises').create({
          templateId: tpl.id,
          exerciseId: ex.exerciseId,
          exerciseName: ex.exerciseName,
          muscleGroup: ex.muscleGroup,
          sortOrder: i,
          defaultSets: ex.defaultSets,
          defaultReps: ex.defaultReps,
        });
      }
      return tpl;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (templateId: string) => {
      const exercises = await blink.db.table<TemplateExercise>('templateExercises').list({
        where: { templateId },
      });
      for (const ex of exercises) {
        await blink.db.table<TemplateExercise>('templateExercises').delete(ex.id);
      }
      await blink.db.table<Template>('templates').delete(templateId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

// -- SESSIONS (private) --

export function useSessions(userId: string | null) {
  return useQuery({
    queryKey: ['sessions', userId],
    queryFn: async () => {
      if (!userId) return [];
      return await blink.db.table<Session>('sessions').list({
        where: { userId },
        orderBy: { startedAt: 'desc' },
      });
    },
    enabled: !!userId,
  });
}

export function useSessionWithExercises(sessionId: string | null) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const session = await blink.db.table<Session>('sessions').get(sessionId);
      if (!session) return null;
      const seList = await blink.db.table<SessionExercise>('sessionExercises').list({
        where: { sessionId },
        orderBy: { sortOrder: 'asc' },
      });
      const exercises: (SessionExercise & { sets: SessionSet[] })[] = [];
      for (const se of seList) {
        const sets = await blink.db.table<SessionSet>('sessionSets').list({
          where: { sessionExerciseId: se.id },
          orderBy: { setNumber: 'asc' },
        });
        exercises.push({ ...se, sets });
      }
      return { ...session, exercises } as SessionWithExercises;
    },
    enabled: !!sessionId,
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      userId: string;
      name: string;
      templateId?: string;
      startedAt?: string;
      exercises: {
        exerciseId: string;
        exerciseName: string;
        muscleGroup: string;
        sets: { weight: number; reps: number; isWarmup?: boolean }[];
      }[];
    }) => {
      const session = await blink.db.table<Session>('sessions').create({
        userId: data.userId,
        templateId: data.templateId || null,
        name: data.name,
        totalVolume: 0,
        durationMinutes: 0,
        ...(data.startedAt ? { startedAt: data.startedAt } : {}),
      });

      let totalVolume = 0;

      for (let i = 0; i < data.exercises.length; i++) {
        const ex = data.exercises[i];
        const se = await blink.db.table<SessionExercise>('sessionExercises').create({
          sessionId: session.id,
          exerciseId: ex.exerciseId,
          exerciseName: ex.exerciseName,
          muscleGroup: ex.muscleGroup,
          sortOrder: i,
        });

        for (let j = 0; j < ex.sets.length; j++) {
          const set = ex.sets[j];
          let isPr = 0;

          // Check PR: heaviest weight for this exercise
          const prevRecords = await blink.db.table<PersonalRecord>('personalRecords').list({
            where: { userId: data.userId, exerciseId: ex.exerciseId, prType: 'weight' },
            orderBy: { prValue: 'desc' },
            limit: 1,
          });

          const prevBest = prevRecords.length > 0 ? prevRecords[0].prValue : 0;
          if (set.weight > prevBest) {
            isPr = 1;
            await blink.db.table<PersonalRecord>('personalRecords').create({
              userId: data.userId,
              exerciseId: ex.exerciseId,
              exerciseName: ex.exerciseName,
              prType: 'weight',
              prValue: set.weight,
              sessionId: session.id,
            });
          }

          await blink.db.table<SessionSet>('sessionSets').create({
            sessionExerciseId: se.id,
            setNumber: j + 1,
            weight: set.weight,
            reps: set.reps,
            isPr,
            isWarmup: set.isWarmup ? 1 : 0,
          });

          totalVolume += set.weight * set.reps;
        }
      }

      await blink.db.table<Session>('sessions').update(session.id, {
        totalVolume,
        completedAt: new Date().toISOString(),
        durationMinutes: data.exercises.length > 0 ? Math.max(1, data.exercises.length * 5) : 10,
      });

      return { ...session, totalVolume };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      qc.invalidateQueries({ queryKey: ['personalRecords'] });
    },
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const seList = await blink.db.table<SessionExercise>('sessionExercises').list({
        where: { sessionId },
      });
      for (const se of seList) {
        const sets = await blink.db.table<SessionSet>('sessionSets').list({
          where: { sessionExerciseId: se.id },
        });
        for (const s of sets) {
          await blink.db.table<SessionSet>('sessionSets').delete(s.id);
        }
        await blink.db.table<SessionExercise>('sessionExercises').delete(se.id);
      }
      await blink.db.table<Session>('sessions').delete(sessionId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

// -- QUICK CALENDAR LOG (date + duration + notes) --

export function useQuickLogSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      userId: string;
      name: string;
      startedAt: string;
      durationMinutes: number;
      notes: string;
      totalVolume?: number;
    }) => {
      const session = await blink.db.table<Session>('sessions').create({
        userId: data.userId,
        templateId: null,
        name: data.name,
        startedAt: data.startedAt,
        completedAt: data.startedAt,
        totalVolume: data.totalVolume || 0,
        durationMinutes: data.durationMinutes,
        notes: data.notes,
      });
      return session;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useUpdateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: string;
      name: string;
      durationMinutes: number;
      notes: string;
      startedAt?: string;
      totalVolume?: number;
    }) => {
      await blink.db.table<Session>('sessions').update(data.id, {
        name: data.name,
        durationMinutes: data.durationMinutes,
        notes: data.notes,
        ...(data.startedAt ? { startedAt: data.startedAt } : {}),
        ...(data.totalVolume !== undefined ? { totalVolume: data.totalVolume } : {}),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

// -- USER EXERCISES (custom, used by help screen) --

export function useUserExercises(userId: string | null) {
  return useQuery({
    queryKey: ['userExercises', userId],
    queryFn: async () => {
      if (!userId) return [] as UserExercise[];
      try {
        return await blink.db.table<UserExercise>('userExercises').list({
          where: { userId },
          orderBy: { name: 'asc' },
        });
      } catch {
        return [] as UserExercise[];
      }
    },
    enabled: !!userId,
  });
}

// -- PERSONAL RECORDS --

export function usePersonalRecords(userId: string | null) {
  return useQuery({
    queryKey: ['personalRecords', userId],
    queryFn: async () => {
      if (!userId) return [];
      return await blink.db.table<PersonalRecord>('personalRecords').list({
        where: { userId },
        orderBy: { achievedAt: 'desc' },
      });
    },
    enabled: !!userId,
  });
}

export function useLatestRecordByExercise(userId: string | null, exerciseId: string) {
  return useQuery({
    queryKey: ['pr', userId, exerciseId],
    queryFn: async () => {
      if (!userId) return null;
      const records = await blink.db.table<PersonalRecord>('personalRecords').list({
        where: { userId, exerciseId, prType: 'weight' },
        orderBy: { prValue: 'desc' },
        limit: 1,
      });
      return records.length > 0 ? records[0] : null;
    },
    enabled: !!userId,
  });
}

// -- SUGGESTED WEIGHT (progressive overload) --

export function getSuggestedWeight(lastWeight: number, lastReps: number): number {
  if (lastWeight === 0) return 0;
  if (lastReps >= 12) return Math.round(lastWeight * 1.05 * 2) / 2;
  if (lastReps >= 8) return Math.round(lastWeight * 1.025 * 2) / 2;
  return lastWeight;
}
