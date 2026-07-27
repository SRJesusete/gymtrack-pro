import { ScrollView } from 'react-native';
import {
  YStack, XStack, H2, H3, H4, Paragraph, Button, Card, Theme, Spinner, Divider,
} from '@blinkdotnew/mobile-ui';
import { ArrowLeft, Flame, Award, Clock, Dumbbell, Trash2 } from '@blinkdotnew/mobile-ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useSessionWithExercises, useDeleteSession } from '@/hooks/useDatabase';
import { useAuth } from '@/hooks/useAuth';
import { C } from '@/constants/theme';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function muscleColor(group: string): string {
  const map: Record<string, string> = {
    Pecho: C.danger, Espalda: "#22D3EE", Piernas: C.success,
    Hombros: C.volt, Brazos: '$purple9', Core: '$yellow9',
  };
  return map[group] || C.volt;
}

function muscleBg(group: string): string {
  const map: Record<string, string> = {
    Pecho: '$red3', Espalda: '$blue3', Piernas: '$green3',
    Hombros: '$orange3', Brazos: '$purple3', Core: '$yellow3',
  };
  return map[group] || C.elevated;
}

export default function SessionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { data: session, isLoading } = useSessionWithExercises(id || null);
  const deleteSession = useDeleteSession();

  if (isLoading) {
    return (
      <Theme name="dark">
        <YStack flex={1} backgroundColor={C.bg} justifyContent="center" alignItems="center">
          <Spinner size="large" color={C.volt} />
        </YStack>
      </Theme>
    );
  }

  if (!session) {
    return (
      <Theme name="dark">
        <YStack flex={1} backgroundColor={C.bg} justifyContent="center" alignItems="center">
          <Paragraph color={C.sub}>Entreno no encontrado</Paragraph>
          <Button marginTop="$4" onPress={() => router.back()}>Volver</Button>
        </YStack>
      </Theme>
    );
  }

  const hasPrs = session.exercises.some((ex) =>
    ex.sets.some((s) => Number(s.isPr) > 0)
  );

  return (
    <Theme name="dark">
      <YStack flex={1} backgroundColor={C.bg}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <XStack padding="$4" paddingTop="$6" justifyContent="space-between" alignItems="center">
            <Button chromeless onPress={() => router.back()} icon={<ArrowLeft size={20} />} />
            <H2 color={C.text} fontWeight="800">{session.name}</H2>
            <Button
              chromeless
              onPress={() => {
                deleteSession.mutate(session.id);
                router.back();
              }}
              icon={<Trash2 size={18} color={C.danger} />}
            />
          </XStack>

          {/* Summary Card */}
          <Card bordered padding="$4" margin="$4" borderRadius="$4" backgroundColor={C.surface}>
            <XStack justifyContent="space-around">
              <YStack alignItems="center" gap="$1">
                <Dumbbell size={20} color={C.volt} />
                <H3 color={C.volt} fontWeight="800">{session.totalVolume.toLocaleString()}</H3>
                <Paragraph size="$2" color={C.sub}>kg totales</Paragraph>
              </YStack>
              <YStack alignItems="center" gap="$1">
                <Clock size={20} color={C.volt} />
                <H3 color={C.text}>{session.durationMinutes || '-'}</H3>
                <Paragraph size="$2" color={C.sub}>min</Paragraph>
              </YStack>
              <YStack alignItems="center" gap="$1">
                <Award size={20} color={hasPrs ? C.volt : C.sub} />
                <H3 color={hasPrs ? C.volt : C.text}>
                  {session.exercises.reduce((c, e) => c + e.sets.filter((s) => Number(s.isPr) > 0).length, 0)}
                </H3>
                <Paragraph size="$2" color={C.sub}>PRs</Paragraph>
              </YStack>
            </XStack>

            <Divider marginVertical="$3" />

            <YStack gap="$1">
              <Paragraph size="$2" color={C.sub}>{formatDate(session.startedAt)}</Paragraph>
              {session.completedAt && (
                <Paragraph size="$2" color={C.sub}>
                  Completado: {formatTime(session.completedAt)}
                </Paragraph>
              )}
            </YStack>
          </Card>

          {/* Exercises */}
          <YStack paddingHorizontal="$4" gap="$3">
            <H3 color={C.text}>Ejercicios</H3>
            {session.exercises.map((ex, idx) => (
              <Card key={ex.id} bordered padding="$4" borderRadius="$4" backgroundColor={C.surface}>
                <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
                  <YStack>
                    <H4 color={C.text}>{ex.exerciseName}</H4>
                    <Card
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                      backgroundColor={muscleBg(ex.muscleGroup)}
                      borderRadius="$2"
                      alignSelf="flex-start"
                      marginTop="$1"
                    >
                      <Paragraph size="$1" color={muscleColor(ex.muscleGroup)} fontWeight="600">
                        {ex.muscleGroup}
                      </Paragraph>
                    </Card>
                  </YStack>
                </XStack>

                {/* Set table */}
                <XStack paddingVertical="$2" backgroundColor={C.elevated} borderRadius="$3" paddingHorizontal="$3">
                  <Paragraph size="$1" color={C.sub} width={40} fontWeight="600">Serie</Paragraph>
                  <Paragraph size="$1" color={C.sub} flex={1} fontWeight="600">Peso</Paragraph>
                  <Paragraph size="$1" color={C.sub} flex={1} fontWeight="600">Reps</Paragraph>
                  <Paragraph size="$1" color={C.sub} width={50} fontWeight="600">PR</Paragraph>
                </XStack>
                {ex.sets.map((set) => (
                  <XStack
                    key={set.id}
                    paddingVertical="$2"
                    paddingHorizontal="$3"
                    borderBottomWidth={1}
                    borderBottomColor={C.elevated}
                    alignItems="center"
                    backgroundColor={Number(set.isPr) > 0 ? C.elevated : 'transparent'}
                    borderRadius="$2"
                  >
                    <Paragraph color={C.sub} width={40}>
                      {Number(set.isWarmup) > 0 ? 'C' : String(set.setNumber)}
                    </Paragraph>
                    <Paragraph color={C.text} flex={1} fontWeight="700">{set.weight} kg</Paragraph>
                    <Paragraph color={C.text} flex={1}>{set.reps}</Paragraph>
                    <YStack width={50}>
                      {Number(set.isPr) > 0 && (
                        <Card paddingHorizontal="$2" paddingVertical="$1" backgroundColor="$orange4" borderRadius="$2">
                          <Paragraph size="$1" color="$orange10" fontWeight="800">PR</Paragraph>
                        </Card>
                      )}
                    </YStack>
                  </XStack>
                ))}
              </Card>
            ))}
          </YStack>
        </ScrollView>
      </YStack>
    </Theme>
  );
}
