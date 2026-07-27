import { useMemo, useState, useCallback } from 'react';
import { ScrollView, ImageBackground } from 'react-native';
import {
  YStack, XStack, H1, H4, Paragraph, Button, Card,
  Theme, Spinner, Circle,
} from '@blinkdotnew/mobile-ui';
import { Dumbbell, Play, ChevronRight, ChevronDown, User, Clock, Zap, Target } from '@blinkdotnew/mobile-ui';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTemplates, useSessions } from '@/hooks/useDatabase';
import { LEVELS, getPresetsByLevel, type WorkoutLevel, type LevelInfo, type WorkoutPreset } from '@/constants/workoutPresets';
import { C, HERO_IMAGE } from '@/constants/theme';

export default function WorkoutHome() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: templates } = useTemplates(user?.id || null);
  const { data: sessions, isLoading: ssLoading } = useSessions(user?.id || null);
  const [expandedLevel, setExpandedLevel] = useState<WorkoutLevel>('principiante');

  const latestSession = sessions?.[0];
  const presetsByLevel = useMemo(() => {
    const map: Record<WorkoutLevel, WorkoutPreset[]> = { principiante: [], intermedio: [], avanzado: [] };
    for (const lvl of LEVELS) map[lvl.level] = getPresetsByLevel(lvl.level);
    return map;
  }, []);

  const totalSessions = sessions?.length || 0;
  const totalVolume = sessions?.reduce((sum, s) => sum + (s.totalVolume || 0), 0) || 0;

  const startFree = useCallback(() => router.push('/session/new'), []);
  const toggleLevel = useCallback((lvl: WorkoutLevel) => setExpandedLevel((cur) => (cur === lvl ? ('' as WorkoutLevel) : lvl)), []);

  if (authLoading) {
    return (
      <Theme name="dark">
        <YStack flex={1} backgroundColor={C.bg} justifyContent="center" alignItems="center">
          <Spinner size="large" color={C.volt} />
        </YStack>
      </Theme>
    );
  }

  return (
    <Theme name="dark">
      <YStack flex={1} backgroundColor={C.bg}>
        <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
          {/* ── HERO ── */}
          <YStack height={320} width="100%">
            <ImageBackground source={{ uri: HERO_IMAGE }} style={{ flex: 1 }} resizeMode="cover">
              <LinearGradient
                colors={['rgba(9,9,11,0.25)', 'rgba(9,9,11,0.85)', C.bg]}
                style={{ flex: 1, justifyContent: 'flex-end', padding: 24 }}
              >
                <XStack alignItems="center" gap="$2" marginBottom="$2">
                  <YStack width={8} height={8} borderRadius={4} backgroundColor={C.volt} />
                  <Paragraph color={C.volt} fontWeight="800" letterSpacing={3} fontSize={11}>GYMTRACK PRO</Paragraph>
                </XStack>
                <H1 color={C.text} fontWeight="900" letterSpacing={-1.5} fontSize={44} lineHeight={44}>
                  {user ? 'SUPÉRATE\nHOY' : 'TU DIARIO\nDE HIERRO'}
                </H1>
                <Paragraph color={C.sub} size="$4" marginTop="$2">
                  {user ? 'Registra cada serie. Domina cada repetición.' : 'Entrena. Registra. Progresa.'}
                </Paragraph>
                <Button
                  marginTop="$4" size="$5" borderRadius={999}
                  backgroundColor={C.volt} color="#000000" fontWeight="900"
                  pressStyle={{ backgroundColor: C.voltDim, scale: 0.97 }}
                  onPress={startFree}
                  icon={<Dumbbell size={20} color="#000000" />}
                  data-testid="start-free-workout-btn"
                >
                  EMPEZAR ENTRENO
                </Button>
              </LinearGradient>
            </ImageBackground>
          </YStack>

          {/* ── BENTO STATS ── */}
          {user && totalSessions > 0 && (
            <XStack paddingHorizontal="$5" gap="$3" marginTop="$4">
              <StatCard value={String(totalSessions)} label="ENTRENOS" />
              <StatCard value={totalVolume.toLocaleString()} label="KG TOTALES" />
              <StatCard value={String(templates?.length || 0)} label="PLANTILLAS" />
            </XStack>
          )}

          {/* ── ENTRENOS POR NIVEL (categorías) ── */}
          <YStack paddingHorizontal="$5" marginTop="$6">
            <SectionLabel icon={<Zap size={16} color={C.volt} />} text="ENTRENOS POR NIVEL" />
            <YStack gap="$3" marginTop="$3">
              {LEVELS.map((lvl) => (
                <LevelCategory
                  key={lvl.level}
                  level={lvl}
                  presets={presetsByLevel[lvl.level]}
                  expanded={expandedLevel === lvl.level}
                  onToggle={() => toggleLevel(lvl.level)}
                  onStart={(id) => router.push(`/session/new?presetId=${id}`)}
                />
              ))}
            </YStack>
          </YStack>

          {/* ── RECENT ── */}
          {!ssLoading && latestSession && (
            <YStack paddingHorizontal="$5" marginTop="$6">
              <SectionLabel icon={<Clock size={16} color={C.volt} />} text="ÚLTIMO ENTRENO" />
              <Card
                marginTop="$3" padding="$4" borderRadius={12}
                backgroundColor={C.surface} borderColor={C.border} borderWidth={1}
                pressStyle={{ borderColor: C.borderStrong, scale: 0.99 }}
                onPress={() => router.push(`/session/${latestSession.id}`)}
                data-testid="recent-session-card"
              >
                <XStack justifyContent="space-between" alignItems="center">
                  <YStack flex={1} gap="$1">
                    <Paragraph fontWeight="800" color={C.text} size="$5">{latestSession.name}</Paragraph>
                    <Paragraph size="$2" color={C.muted}>
                      {new Date(latestSession.startedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                    </Paragraph>
                    <Paragraph size="$3" color={C.volt} fontWeight="700" marginTop="$1">
                      {latestSession.totalVolume.toLocaleString()} KG
                    </Paragraph>
                  </YStack>
                  <Circle size={40} backgroundColor={C.elevated}><ChevronRight size={18} color={C.volt} /></Circle>
                </XStack>
              </Card>
            </YStack>
          )}

          {/* ── AUTH CTA ── */}
          {!user && (
            <YStack paddingHorizontal="$5" marginTop="$6" gap="$3">
              <Card padding="$5" borderRadius={12} backgroundColor={C.surface} borderColor={C.border} borderWidth={1} alignItems="center" gap="$2">
                <Target size={28} color={C.volt} />
                <Paragraph color={C.text} fontWeight="800" size="$5" textAlign="center">GUARDA TU PROGRESO</Paragraph>
                <Paragraph color={C.sub} textAlign="center" size="$3">
                  Inicia sesión para registrar entrenos, seguir tu evolución y desbloquear estadísticas.
                </Paragraph>
                <Button
                  marginTop="$2" width="100%" size="$4" borderRadius={999}
                  backgroundColor={C.volt} color="#000000" fontWeight="900"
                  pressStyle={{ backgroundColor: C.voltDim, scale: 0.97 }}
                  onPress={() => router.push('/(tabs)/profile')}
                  icon={<User size={18} color="#000000" />}
                  data-testid="home-login-btn"
                >
                  INICIAR SESIÓN
                </Button>
              </Card>
            </YStack>
          )}
        </ScrollView>
      </YStack>
    </Theme>
  );
}

function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <XStack alignItems="center" gap="$2">
      {icon}
      <Paragraph color={C.sub} fontWeight="800" letterSpacing={2} fontSize={12}>{text}</Paragraph>
    </XStack>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <Card flex={1} padding="$3" borderRadius={12} backgroundColor={C.surface} borderColor={C.border} borderWidth={1} alignItems="center" gap="$1">
      <Paragraph fontSize={26} fontWeight="900" color={C.volt} letterSpacing={-1}>{value}</Paragraph>
      <Paragraph fontSize={9} color={C.muted} fontWeight="700" letterSpacing={1}>{label}</Paragraph>
    </Card>
  );
}

function LevelCategory({ level, presets, expanded, onToggle, onStart }: {
  level: LevelInfo; presets: WorkoutPreset[]; expanded: boolean; onToggle: () => void; onStart: (id: string) => void;
}) {
  return (
    <YStack
      borderRadius={14}
      backgroundColor={C.surface}
      borderColor={expanded ? C.volt : C.border}
      borderWidth={expanded ? 2 : 1}
      overflow="hidden"
    >
      {/* Header */}
      <XStack
        padding="$4"
        alignItems="center"
        gap="$3"
        onPress={onToggle}
        pressStyle={{ backgroundColor: C.elevated }}
        cursor="pointer"
        data-testid={`level-category-${level.level}`}
      >
        <Circle size={48} backgroundColor={C.elevated} borderColor={expanded ? C.volt : C.border} borderWidth={1}>
          <Paragraph size="$7">{level.icon}</Paragraph>
        </Circle>
        <YStack flex={1} gap="$1">
          <Paragraph fontWeight="900" color={expanded ? C.volt : C.text} fontSize={18} letterSpacing={-0.5}>
            {level.title.toUpperCase()}
          </Paragraph>
          <Paragraph size="$2" color={C.muted}>{level.subtitle} · {presets.length} entrenos</Paragraph>
        </YStack>
        <Circle size={32} backgroundColor={C.elevated}>
          {expanded ? <ChevronDown size={18} color={C.volt} /> : <ChevronRight size={18} color={C.sub} />}
        </Circle>
      </XStack>

      {/* Presets */}
      {expanded && (
        <YStack padding="$3" paddingTop="$0" gap="$3">
          {presets.map((preset) => (
            <PresetCard key={preset.id} preset={preset} onStart={() => onStart(preset.id)} />
          ))}
        </YStack>
      )}
    </YStack>
  );
}

function PresetCard({ preset, onStart }: { preset: WorkoutPreset; onStart: () => void }) {
  const muscleGroups = [...new Set(preset.exercises.map((e) => e.muscleGroup))];
  return (
    <Card
      borderRadius={12} padding="$4" backgroundColor={C.elevated}
      borderColor={C.border} borderWidth={1}
      pressStyle={{ borderColor: C.borderStrong, scale: 0.99 }}
      onPress={onStart}
      data-testid={`preset-${preset.id}-card`}
    >
      <XStack alignItems="center" gap="$3" marginBottom="$3">
        <Circle size={44} backgroundColor={C.surface} borderColor={C.border} borderWidth={1}>
          <Paragraph size="$7">{preset.icon}</Paragraph>
        </Circle>
        <YStack flex={1} gap="$1">
          <H4 color={C.text} fontWeight="800" letterSpacing={-0.5}>{preset.name}</H4>
          <Paragraph size="$2" color={C.muted} numberOfLines={2}>{preset.description}</Paragraph>
        </YStack>
      </XStack>

      <XStack gap="$4" marginBottom="$3" flexWrap="wrap">
        <MetaItem icon={<Clock size={12} color={C.muted} />} text={`~${preset.estimatedMinutes} min`} />
        <MetaItem icon={<Dumbbell size={12} color={C.muted} />} text={`${preset.exercises.length} ejercicios`} />
        <MetaItem icon={<Target size={12} color={C.muted} />} text={`${muscleGroups.length} grupos`} />
      </XStack>

      {/* Lista de ejercicios del entreno */}
      <YStack gap="$1" marginBottom="$3">
        {preset.exercises.map((ex, i) => (
          <XStack key={`${ex.exerciseId}-${i}`} alignItems="center" gap="$2" paddingVertical="$1">
            <YStack width={5} height={5} borderRadius={3} backgroundColor={C.volt} />
            <Paragraph size="$2" color={C.sub} flex={1}>{ex.exerciseName}</Paragraph>
            <Paragraph size="$1" color={C.muted}>{ex.defaultSets}×{ex.defaultReps}</Paragraph>
            <YStack paddingHorizontal="$2" paddingVertical="$1" borderRadius={6} backgroundColor={C.surface}>
              <Paragraph fontSize={9} color={C.muted}>{ex.muscleGroup}</Paragraph>
            </YStack>
          </XStack>
        ))}
      </YStack>

      <Button
        size="$4" width="100%" borderRadius={999}
        backgroundColor={C.volt} color="#000000" fontWeight="900"
        pressStyle={{ backgroundColor: C.voltDim, scale: 0.98 }}
        onPress={onStart}
        icon={<Play size={16} color="#000000" />}
      >
        EMPEZAR
      </Button>
    </Card>
  );
}

function MetaItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <XStack alignItems="center" gap="$1">
      {icon}
      <Paragraph fontSize={11} color={C.muted}>{text}</Paragraph>
    </XStack>
  );
}
