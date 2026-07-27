import { useState, useCallback, useMemo } from 'react';
import { ScrollView } from 'react-native';
import {
  YStack, XStack, H2, H3, H4, Paragraph, Button, Card,
  Theme, toast, Spinner, Circle,
} from '@blinkdotnew/mobile-ui';
import {
  Dumbbell, Play, ChevronRight, User, Clock,
  Zap, Target, TrendingUp, BarChart3,
} from '@blinkdotnew/mobile-ui';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTemplates, useSessions } from '@/hooks/useDatabase';
import {
  LEVELS,
  getPresetsByLevel,
  type WorkoutLevel,
  type LevelInfo,
  type WorkoutPreset,
} from '@/constants/workoutPresets';

export default function WorkoutHome() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: templates, isLoading: tlLoading } = useTemplates(user?.id || null);
  const { data: sessions, isLoading: ssLoading } = useSessions(user?.id || null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<WorkoutLevel>('principiante');

  const latestSession = sessions?.[0];
  const presets = useMemo(() => getPresetsByLevel(selectedLevel), [selectedLevel]);

  const handleStartPreset = useCallback((presetId: string) => {
    router.push(`/session/new?presetId=${presetId}`);
  }, []);

  const handleStartFree = useCallback(() => {
    router.push('/session/new');
  }, []);

  const handleStartFromTemplate = useCallback(() => {
    if (!selectedTemplate) {
      router.push('/session/new?templateId=');
      return;
    }
    router.push(`/session/new?templateId=${selectedTemplate}`);
  }, [selectedTemplate]);

  if (authLoading) {
    return (
      <YStack flex={1} backgroundColor="$color1" justifyContent="center" alignItems="center">
        <Spinner size="large" color="$color9" />
      </YStack>
    );
  }

  const totalSessions = sessions?.length || 0;
  const totalVolume = sessions?.reduce((sum, s) => sum + (s.totalVolume || 0), 0) || 0;

  return (
    <Theme name="dark">
      <YStack flex={1} backgroundColor="$color1">
        <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
          {/* ── Hero Header ── */}
          <YStack padding="$5" paddingTop="$7" gap="$1">
            <H2 color="$color12" fontWeight="900" letterSpacing={-1}>
              GymTrack Pro
            </H2>
            <Paragraph color="$color10" size="$4">
              {user ? '¿Listo para superarte hoy?' : 'Tu diario de entrenamiento'}
            </Paragraph>
          </YStack>

          {/* ── Stats Row ── */}
          {user && totalSessions > 0 && (
            <XStack paddingHorizontal="$5" gap="$3" marginBottom="$4">
              <Card
                bordered
                flex={1}
                padding="$3"
                borderRadius="$4"
                backgroundColor="$color2"
                alignItems="center"
                gap="$1"
              >
                <Paragraph size="$7" fontWeight="900" color="$color9">
                  {totalSessions}
                </Paragraph>
                <Paragraph size="$2" color="$color10">Entrenos</Paragraph>
              </Card>
              <Card
                bordered
                flex={1}
                padding="$3"
                borderRadius="$4"
                backgroundColor="$color2"
                alignItems="center"
                gap="$1"
              >
                <Paragraph size="$7" fontWeight="900" color="$color9">
                  {totalVolume.toLocaleString()}
                </Paragraph>
                <Paragraph size="$2" color="$color10">kg totales</Paragraph>
              </Card>
              <Card
                bordered
                flex={1}
                padding="$3"
                borderRadius="$4"
                backgroundColor="$color2"
                alignItems="center"
                gap="$1"
              >
                <Paragraph size="$7" fontWeight="900" color="$color9">
                  {templates?.length || 0}
                </Paragraph>
                <Paragraph size="$2" color="$color10">Plantillas</Paragraph>
              </Card>
            </XStack>
          )}

          {/* ── Nivel de dificultad ── */}
          <YStack paddingHorizontal="$5" marginBottom="$3">
            <Paragraph color="$color11" fontWeight="700" size="$3" marginBottom="$3">
              Nivel de dificultad
            </Paragraph>
            <XStack gap="$3">
              {LEVELS.map((lvl) => (
                <LevelButton
                  key={lvl.level}
                  level={lvl}
                  isSelected={selectedLevel === lvl.level}
                  onPress={() => setSelectedLevel(lvl.level)}
                />
              ))}
            </XStack>
          </YStack>

          {/* ── Quick Workout Cards ── */}
          <YStack paddingHorizontal="$5" marginBottom="$4">
            <XStack alignItems="center" gap="$2" marginBottom="$3">
              <Zap size={18} color="$color9" />
              <Paragraph color="$color11" fontWeight="700" size="$3">
                Entrenos rápidos
              </Paragraph>
            </XStack>
            <YStack gap="$3">
              {presets.map((preset) => (
                <WorkoutCard
                  key={preset.id}
                  preset={preset}
                  onStart={() => handleStartPreset(preset.id)}
                />
              ))}
            </YStack>
          </YStack>

          {/* ── Separator ── */}
          <YStack height={1} backgroundColor="$color4" marginHorizontal="$5" marginBottom="$4" />

          {/* ── Quick Start Free ── */}
          <YStack paddingHorizontal="$5" gap="$3" marginBottom="$4">
            <Button
              theme="active"
              size="$5"
              width="100%"
              onPress={handleStartFree}
              icon={<Dumbbell size={20} />}
            >
              Empezar Entreno Libre
            </Button>

            {/* Template Selector */}
            {!tlLoading && templates && templates.length > 0 && (
              <YStack gap="$2">
                <Paragraph color="$color11" fontWeight="600" size="$3" marginTop="$2">
                  O usa una plantilla guardada
                </Paragraph>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <XStack gap="$2">
                    {templates.map((tpl) => (
                      <Card
                        key={tpl.id}
                        bordered
                        padding="$3"
                        onPress={() => setSelectedTemplate(tpl.id === selectedTemplate ? null : tpl.id)}
                        backgroundColor={selectedTemplate === tpl.id ? '$color4' : '$color2'}
                        borderRadius="$4"
                        minWidth={150}
                        gap="$1"
                      >
                        <Paragraph fontWeight="700" color="$color12">{tpl.name}</Paragraph>
                        <Paragraph size="$2" color="$color10" numberOfLines={1}>
                          {tpl.description || 'Sin descripción'}
                        </Paragraph>
                      </Card>
                    ))}
                  </XStack>
                </ScrollView>
              </YStack>
            )}

            {selectedTemplate && (
              <Button
                variant="outline"
                theme="green"
                size="$4"
                width="100%"
                onPress={handleStartFromTemplate}
                icon={<Play size={18} />}
              >
                Empezar con Plantilla
              </Button>
            )}
          </YStack>

          {/* ── Recent Session ── */}
          {!ssLoading && latestSession && (
            <YStack paddingHorizontal="$5" marginBottom="$4">
              <XStack alignItems="center" gap="$2" marginBottom="$3">
                <BarChart3 size={18} color="$color9" />
                <Paragraph color="$color11" fontWeight="700" size="$3">
                  Último Entreno
                </Paragraph>
              </XStack>
              <Card
                bordered
                padding="$4"
                borderRadius="$4"
                backgroundColor="$color2"
                onPress={() => router.push(`/session/${latestSession.id}`)}
              >
                <XStack justifyContent="space-between" alignItems="center">
                  <YStack flex={1} gap="$1">
                    <Paragraph fontWeight="700" color="$color12" size="$4">
                      {latestSession.name}
                    </Paragraph>
                    <Paragraph size="$2" color="$color10">
                      {new Date(latestSession.startedAt).toLocaleDateString('es-ES', {
                        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
                      })}
                    </Paragraph>
                    <XStack gap="$3" marginTop="$1">
                      <Paragraph size="$2" color="$color9" fontWeight="600">
                        {latestSession.totalVolume.toLocaleString()} kg totales
                      </Paragraph>
                    </XStack>
                  </YStack>
                  <Circle size={36} backgroundColor="$color3">
                    <ChevronRight size={18} color="$color9" />
                  </Circle>
                </XStack>
              </Card>
            </YStack>
          )}

          {/* ── Auth CTA ── */}
          {!user && (
            <YStack paddingHorizontal="$5" marginTop="$2" marginBottom="$6" alignItems="center" gap="$4">
              <YStack
                padding="$4"
                backgroundColor="$color2"
                borderRadius="$4"
                borderWidth={1}
                borderColor="$color4"
                alignItems="center"
                gap="$2"
              >
                <Target size={28} color="$color9" />
                <Paragraph color="$color12" fontWeight="700" size="$4" textAlign="center">
                  Guarda tu progreso
                </Paragraph>
                <Paragraph color="$color10" textAlign="center" size="$3">
                  Inicia sesión para registrar entrenamientos, seguir tu evolución y desbloquear estadísticas.
                </Paragraph>
              </YStack>
              <Button
                theme="active"
                width="100%"
                size="$5"
                onPress={() => router.push('/(tabs)/profile')}
                icon={<User size={18} />}
              >
                Iniciar Sesión
              </Button>
            </YStack>
          )}
        </ScrollView>
      </YStack>
    </Theme>
  );
}

// ── Level Button Component ──

function LevelButton({
  level,
  isSelected,
  onPress,
}: {
  level: LevelInfo;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Card
      bordered
      flex={1}
      paddingVertical="$3"
      paddingHorizontal="$2"
      borderRadius="$4"
      alignItems="center"
      gap="$1"
      onPress={onPress}
      backgroundColor={isSelected ? '$color4' : '$color2'}
      borderColor={isSelected ? '$color9' : '$color4'}
    >
      <Paragraph size="$6">{level.icon}</Paragraph>
      <Paragraph size="$2" fontWeight="700" color={isSelected ? '$color9' : '$color11'}>
        {level.title}
      </Paragraph>
      <Paragraph size="$1" color="$color10">
        {level.subtitle}
      </Paragraph>
    </Card>
  );
}

// ── Workout Card Component ──

function WorkoutCard({
  preset,
  onStart,
}: {
  preset: WorkoutPreset;
  onStart: () => void;
}) {
  const exerciseCount = preset.exercises.length;
  const muscleGroups = [...new Set(preset.exercises.map((e) => e.muscleGroup))];

  return (
    <Card
      bordered
      borderRadius="$5"
      padding="$4"
      backgroundColor="$color2"
      onPress={onStart}
    >
      <XStack justifyContent="space-between" alignItems="flex-start" marginBottom="$3">
        <XStack alignItems="center" gap="$3" flex={1}>
          <Circle size={48} backgroundColor="$color3">
            <Paragraph size="$8">{preset.icon}</Paragraph>
          </Circle>
          <YStack flex={1} gap="$1">
            <H4 color="$color12" fontWeight="800">
              {preset.name}
            </H4>
            <Paragraph size="$2" color="$color10" numberOfLines={2}>
              {preset.description}
            </Paragraph>
          </YStack>
        </XStack>
      </XStack>

      {/* Meta info row */}
      <XStack gap="$4" marginBottom="$3" flexWrap="wrap">
        <XStack alignItems="center" gap="$1">
          <Clock size={12} color="$color10" />
          <Paragraph size="$1" color="$color10">
            ~{preset.estimatedMinutes} min
          </Paragraph>
        </XStack>
        <XStack alignItems="center" gap="$1">
          <Dumbbell size={12} color="$color10" />
          <Paragraph size="$1" color="$color10">
            {exerciseCount} ejercicios
          </Paragraph>
        </XStack>
        <XStack alignItems="center" gap="$1">
          <Target size={12} color="$color10" />
          <Paragraph size="$1" color="$color10">
            {muscleGroups.length} grupos
          </Paragraph>
        </XStack>
      </XStack>

      {/* Tags row */}
      <XStack gap="$2" flexWrap="wrap">
        {muscleGroups.slice(0, 4).map((mg) => (
          <Card
            key={mg}
            paddingHorizontal="$2"
            paddingVertical="$1"
            borderRadius="$2"
            backgroundColor="$color3"
          >
            <Paragraph size="$1" color="$color10">{mg}</Paragraph>
          </Card>
        ))}
      </XStack>

      {/* Start button */}
      <Button
        theme="active"
        size="$4"
        width="100%"
        marginTop="$3"
        onPress={onStart}
        icon={<Play size={16} />}
      >
        Empezar Entreno
      </Button>
    </Card>
  );
}
