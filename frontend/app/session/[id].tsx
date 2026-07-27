import { ScrollView } from 'react-native';
import {
  YStack, XStack, H2, H3, H4, Paragraph, Button, Card, Theme, Spinner, Divider,
} from '@blinkdotnew/mobile-ui';
import { ArrowLeft, Flame, Award, Clock, Dumbbell, Trash2 } from '@blinkdotnew/mobile-ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useSessionWithExercises, useDeleteSession } from '@/hooks/useDatabase';
import { useAuth } from '@/hooks/useAuth';

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
    Pecho: '$red9', Espalda: '$blue9', Piernas: '$green9',
    Hombros: '$orange9', Brazos: '$purple9', Core: '$yellow9',
  };
  return map[group] || '$color9';
}

function muscleBg(group: string): string {
  const map: Record<string, string> = {
    Pecho: '$red3', Espalda: '$blue3', Piernas: '$green3',
    Hombros: '$orange3', Brazos: '$purple3', Core: '$yellow3',
  };
  return map[group] || '$color3';
}

export default function SessionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { data: session, isLoading } = useSessionWithExercises(id || null);
  const deleteSession = useDeleteSession();

  if (isLoading) {
    return (
      <Theme name="dark">
        <YStack flex={1} backgroundColor="$color1" justifyContent="center" alignItems="center">
          <Spinner size="large" color="$color9" />
        </YStack>
      </Theme>
    );
  }

  if (!session) {
    return (
      <Theme name="dark">
        <YStack flex={1} backgroundColor="$color1" justifyContent="center" alignItems="center">
          <Paragraph color="$color10">Entreno no encontrado</Paragraph>
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
      <YStack flex={1} backgroundColor="$color1">
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <XStack padding="$4" paddingTop="$6" justifyContent="space-between" alignItems="center">
            <Button chromeless onPress={() => router.back()} icon={<ArrowLeft size={20} />} />
            <H2 color="$color12" fontWeight="800">{session.name}</H2>
            <Button
              chromeless
              onPress={() => {
                deleteSession.mutate(session.id);
                router.back();
              }}
              icon={<Trash2 size={18} color="$red9" />}
            />
          </XStack>

          {/* Summary Card */}
          <Card bordered padding="$4" margin="$4" borderRadius="$4" backgroundColor="$color2">
            <XStack justifyContent="space-around">
              <YStack alignItems="center" gap="$1">
                <Dumbbell size={20} color="$color9" />
                <H3 color="$color9" fontWeight="800">{session.totalVolume.toLocaleString()}</H3>
                <Paragraph size="$2" color="$color10">kg totales</Paragraph>
              </YStack>
              <YStack alignItems="center" gap="$1">
                <Clock size={20} color="$color9" />
                <H3 color="$color12">{session.durationMinutes || '-'}</H3>
                <Paragraph size="$2" color="$color10">min</Paragraph>
              </YStack>
              <YStack alignItems="center" gap="$1">
                <Award size={20} color={hasPrs ? '$orange9' : '$color10'} />
                <H3 color={hasPrs ? '$orange9' : '$color12'}>
                  {session.exercises.reduce((c, e) => c + e.sets.filter((s) => Number(s.isPr) > 0).length, 0)}
                </H3>
                <Paragraph size="$2" color="$color10">PRs</Paragraph>
              </YStack>
            </XStack>

            <Divider marginVertical="$3" />

            <YStack gap="$1">
              <Paragraph size="$2" color="$color10">{formatDate(session.startedAt)}</Paragraph>
              {session.completedAt && (
                <Paragraph size="$2" color="$color10">
                  Completado: {formatTime(session.completedAt)}
                </Paragraph>
              )}
            </YStack>
          </Card>

          {/* Exercises */}
          <YStack paddingHorizontal="$4" gap="$3">
            <H3 color="$color12">Ejercicios</H3>
            {session.exercises.map((ex, idx) => (
              <Card key={ex.id} bordered padding="$4" borderRadius="$4" backgroundColor="$color2">
                <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
                  <YStack>
                    <H4 color="$color12">{ex.exerciseName}</H4>
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
                <XStack paddingVertical="$2" backgroundColor="$color3" borderRadius="$3" paddingHorizontal="$3">
                  <Paragraph size="$1" color="$color10" width={40} fontWeight="600">Serie</Paragraph>
                  <Paragraph size="$1" color="$color10" flex={1} fontWeight="600">Peso</Paragraph>
                  <Paragraph size="$1" color="$color10" flex={1} fontWeight="600">Reps</Paragraph>
                  <Paragraph size="$1" color="$color10" width={50} fontWeight="600">PR</Paragraph>
                </XStack>
                {ex.sets.map((set) => (
                  <XStack
                    key={set.id}
                    paddingVertical="$2"
                    paddingHorizontal="$3"
                    borderBottomWidth={1}
                    borderBottomColor="$color3"
                    alignItems="center"
                    backgroundColor={Number(set.isPr) > 0 ? '$orange2' : 'transparent'}
                    borderRadius="$2"
                  >
                    <Paragraph color="$color10" width={40}>
                      {Number(set.isWarmup) > 0 ? 'C' : String(set.setNumber)}
                    </Paragraph>
                    <Paragraph color="$color12" flex={1} fontWeight="700">{set.weight} kg</Paragraph>
                    <Paragraph color="$color12" flex={1}>{set.reps}</Paragraph>
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
