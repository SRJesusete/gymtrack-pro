import { useState, useCallback } from 'react';
import { ScrollView } from 'react-native';
import {
  YStack, XStack, H2, H3, H4, Paragraph, Button, Card,
  Theme, Spinner,
} from '@blinkdotnew/mobile-ui';
import { Play, ChevronRight, Dumbbell, User, Zap, Flame, Target } from '@blinkdotnew/mobile-ui';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTemplates, useSessions } from '@/hooks/useDatabase';

const QUICK_PRESETS = {
  facil: {
    label: 'Fácil',
    icon: Zap,
    color: '$green9',
    bg: '$green3',
    desc: 'Ideal si empiezas',
    time: '~30 min',
    exercises: [
      { id: 'ex_bench_press', name: 'Press Banca', sets: 3, reps: 10, muscle: 'Pecho' },
      { id: 'ex_lat_pulldown', name: 'Jalon al Pecho', sets: 3, reps: 10, muscle: 'Espalda' },
      { id: 'ex_squat', name: 'Sentadilla', sets: 3, reps: 12, muscle: 'Piernas' },
      { id: 'ex_ohp', name: 'Press Militar', sets: 3, reps: 10, muscle: 'Hombros' },
      { id: 'ex_plank', name: 'Plancha Abdominal', sets: 3, reps: 30, muscle: 'Core' },
    ],
  },
  medio: {
    label: 'Medio',
    icon: Flame,
    color: '$orange9',
    bg: '$orange3',
    desc: 'Rutina equilibrada',
    time: '~45 min',
    exercises: [
      { id: 'ex_bench_press', name: 'Press Banca', sets: 4, reps: 8, muscle: 'Pecho' },
      { id: 'ex_pullups', name: 'Dominadas', sets: 4, reps: 8, muscle: 'Espalda' },
      { id: 'ex_squat', name: 'Sentadilla', sets: 4, reps: 8, muscle: 'Piernas' },
      { id: 'ex_barbell_row', name: 'Remo con Barra', sets: 4, reps: 10, muscle: 'Espalda' },
      { id: 'ex_ohp', name: 'Press Militar', sets: 4, reps: 8, muscle: 'Hombros' },
      { id: 'ex_barbell_curl', name: 'Curl de Biceps', sets: 3, reps: 12, muscle: 'Brazos' },
      { id: 'ex_french_press', name: 'Press Frances', sets: 3, reps: 12, muscle: 'Brazos' },
    ],
  },
  dificil: {
    label: 'Difícil',
    icon: Target,
    color: '$red9',
    bg: '$red3',
    desc: 'Alta intensidad',
    time: '~60 min',
    exercises: [
      { id: 'ex_deadlift', name: 'Peso Muerto', sets: 5, reps: 5, muscle: 'Espalda' },
      { id: 'ex_bench_press', name: 'Press Banca', sets: 5, reps: 5, muscle: 'Pecho' },
      { id: 'ex_squat', name: 'Sentadilla', sets: 5, reps: 5, muscle: 'Piernas' },
      { id: 'ex_pullups', name: 'Dominadas', sets: 4, reps: 8, muscle: 'Espalda' },
      { id: 'ex_ohp', name: 'Press Militar', sets: 4, reps: 8, muscle: 'Hombros' },
      { id: 'ex_barbell_row', name: 'Remo con Barra', sets: 4, reps: 8, muscle: 'Espalda' },
      { id: 'ex_barbell_curl', name: 'Curl de Biceps', sets: 3, reps: 10, muscle: 'Brazos' },
      { id: 'ex_lateral_raise', name: 'Elevaciones Laterales', sets: 3, reps: 15, muscle: 'Hombros' },
    ],
  },
};

export default function WorkoutHome() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: templates, isLoading: tlLoading } = useTemplates(user?.id || null);
  const { data: sessions, isLoading: ssLoading } = useSessions(user?.id || null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const latestSession = sessions?.[0];

  const handleStartFromTemplate = useCallback(() => {
    if (!selectedTemplate) {
      router.push('/session/new?templateId=');
      return;
    }
    router.push(`/session/new?templateId=${selectedTemplate}`);
  }, [selectedTemplate]);

  const handleQuickPreset = useCallback((level: string) => {
    router.push(`/session/new?quickStart=${level}`);
  }, []);

  if (authLoading) {
    return (
      <YStack flex={1} backgroundColor="$color1" justifyContent="center" alignItems="center">
        <Spinner size="large" color="$color9" />
      </YStack>
    );
  }

  return (
    <Theme name="dark">
      <YStack flex={1} backgroundColor="$color1">
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <YStack padding="$4" paddingTop="$6" gap="$2">
            <H2 color="$color12" fontWeight="800">GymTrack Pro</H2>
            <Paragraph color="$color10">
              {user ? `Bienvenido de vuelta` : 'Tu diario de entrenamiento'}
            </Paragraph>
          </YStack>

          {/* Quick Presets */}
          <YStack paddingHorizontal="$4" gap="$3" marginTop="$2">
            <H3 color="$color11">Entreno Libre Rapido</H3>
            <XStack gap="$3">
              {Object.entries(QUICK_PRESETS).map(([key, preset]) => {
                const Icon = preset.icon;
                return (
                  <Card
                    key={key}
                    bordered
                    padding="$4"
                    flex={1}
                    borderRadius="$4"
                    backgroundColor={preset.bg}
                    onPress={() => handleQuickPreset(key)}
                  >
                    <YStack alignItems="center" gap="$2">
                      <Icon size={28} color={preset.color} />
                      <H4 color="$color12" fontWeight="700">{preset.label}</H4>
                      <Paragraph size="$1" color="$color10" textAlign="center">{preset.desc}</Paragraph>
                      <Paragraph size="$1" color={preset.color} fontWeight="600">
                        {preset.exercises.length} ejercicios
                      </Paragraph>
                      <Paragraph size="$1" color="$color10">{preset.time}</Paragraph>
                    </YStack>
                  </Card>
                );
              })}
            </XStack>
          </YStack>

          {/* Templates section */}
          {!tlLoading && templates && templates.length > 0 && (
            <YStack paddingHorizontal="$4" gap="$2" marginTop="$4">
              <Paragraph color="$color11" fontWeight="600">O usa una plantilla guardada</Paragraph>
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
                      minWidth={140}
                    >
                      <Paragraph fontWeight="600" color="$color12">{tpl.name}</Paragraph>
                      <Paragraph size="$2" color="$color10">{tpl.description || 'Sin descripcion'}</Paragraph>
                    </Card>
                  ))}
                </XStack>
              </ScrollView>
            </YStack>
          )}

          {selectedTemplate && (
            <YStack paddingHorizontal="$4" marginTop="$3">
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
            </YStack>
          )}

          {/* Recent Session Summary */}
          {!ssLoading && latestSession && (
            <YStack padding="$4" marginTop="$4">
              <H3 color="$color12" marginBottom="$2">Último Entreno</H3>
              <Card bordered padding="$4" borderRadius="$4" backgroundColor="$color2">
                <XStack justifyContent="space-between" alignItems="center">
                  <YStack>
                    <Paragraph fontWeight="700" color="$color12">{latestSession.name}</Paragraph>
                    <Paragraph size="$2" color="$color10">
                      {new Date(latestSession.startedAt).toLocaleDateString('es-ES', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </Paragraph>
                    <XStack gap="$3" marginTop="$1">
                      <Paragraph size="$2" color="$color9">
                        {latestSession.totalVolume.toLocaleString()} kg vol.
                      </Paragraph>
                    </XStack>
                  </YStack>
                  <Card
                    bordered
                    padding="$2"
                    borderRadius="$4"
                    backgroundColor="$color3"
                    onPress={() => router.push(`/session/${latestSession.id}`)}
                  >
                    <ChevronRight size={20} color="$color9" />
                  </Card>
                </XStack>
              </Card>
            </YStack>
          )}

          {/* Auth section */}
          {!user && (
            <YStack padding="$4" marginTop="$4" alignItems="center" gap="$3">
              <Paragraph color="$color10" textAlign="center">
                Inicia sesión para guardar tus entrenamientos y seguir tu progreso
              </Paragraph>
              <Button
                theme="active"
                width="100%"
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
