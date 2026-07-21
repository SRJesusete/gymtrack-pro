import { ScrollView } from 'react-native';
import {
  YStack, XStack, H2, Paragraph, Button, Card, Theme, Spinner,
} from '@blinkdotnew/mobile-ui';
import { Dumbbell, ChevronRight, Clock, User } from '@blinkdotnew/mobile-ui';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useSessions } from '@/hooks/useDatabase';

export default function HistoryScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: sessions, isLoading: ssLoading } = useSessions(user?.id || null);

  if (authLoading) {
    return (
      <Theme name="dark">
        <YStack flex={1} backgroundColor="$color1" justifyContent="center" alignItems="center">
          <Spinner size="large" color="$color9" />
        </YStack>
      </Theme>
    );
  }

  if (!user) {
    return (
      <Theme name="dark">
        <YStack flex={1} backgroundColor="$color1">
          <ScrollView contentContainerStyle={{ paddingBottom: 40, flexGrow: 1, justifyContent: 'center' }}>
            <YStack padding="$8" alignItems="center" gap="$4">
              <Dumbbell size={56} color="$color6" />
              <Paragraph color="$color10" textAlign="center" size="$4">
                Inicia sesión para ver tu historial de entrenamientos
              </Paragraph>
              <Button
                theme="active"
                size="$5"
                onPress={() => router.push('/(tabs)/profile')}
                icon={<User size={18} />}
              >
                Ir a mi cuenta
              </Button>
            </YStack>
          </ScrollView>
        </YStack>
      </Theme>
    );
  }

  return (
    <Theme name="dark">
      <YStack flex={1} backgroundColor="$color1">
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <YStack padding="$4" paddingTop="$6" gap="$2">
            <H2 color="$color12" fontWeight="800">Historial</H2>
            <Paragraph color="$color10">
              {sessions?.length || 0} sesiones registradas
            </Paragraph>
          </YStack>

          {ssLoading ? (
            <YStack padding="$8" alignItems="center">
              <Spinner size="large" color="$color9" />
            </YStack>
          ) : !sessions || sessions.length === 0 ? (
            <YStack padding="$8" alignItems="center" gap="$3">
              <Dumbbell size={48} color="$color6" />
              <Paragraph color="$color10" textAlign="center">Aún no has registrado ningún entrenamiento</Paragraph>
              <Button theme="active" onPress={() => router.push('/session/new')}>
                Empezar primer entreno
              </Button>
            </YStack>
          ) : (
            <YStack paddingHorizontal="$4" gap="$2">
              {sessions.map((session) => (
                <Card
                  key={session.id}
                  bordered
                  padding="$4"
                  borderRadius="$4"
                  backgroundColor="$color2"
                  onPress={() => router.push(`/session/${session.id}`)}
                >
                  <XStack justifyContent="space-between" alignItems="center">
                    <YStack flex={1} gap="$1">
                      <Paragraph fontWeight="700" color="$color12">{session.name}</Paragraph>
                      <XStack gap="$3" alignItems="center">
                        <XStack gap="$1" alignItems="center">
                          <Clock size={12} color="$color10" />
                          <Paragraph size="$2" color="$color10">
                            {new Date(session.startedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </Paragraph>
                        </XStack>
                        <XStack gap="$1" alignItems="center">
                          <Dumbbell size={12} color="$color9" />
                          <Paragraph size="$2" color="$color9" fontWeight="700">
                            {session.totalVolume.toLocaleString()} kg
                          </Paragraph>
                        </XStack>
                      </XStack>
                    </YStack>
                    <ChevronRight size={18} color="$color10" />
                  </XStack>
                </Card>
              ))}
            </YStack>
          )}
        </ScrollView>
      </YStack>
    </Theme>
  );
}
