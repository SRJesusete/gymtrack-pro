import { useState, useCallback } from 'react';
import { ScrollView, Alert } from 'react-native';
import {
  YStack, XStack, H2, H3, Paragraph, Button, Card,
  Input, Avatar, Circle, Theme, toast, Spinner,
} from '@blinkdotnew/mobile-ui';
import { Plus, Play, X, ChevronRight, Dumbbell, User } from '@blinkdotnew/mobile-ui';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTemplates, useSessions } from '@/hooks/useDatabase';

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

  const handleQuickStart = useCallback(() => {
    router.push('/session/new');
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

          {/* Quick Start Button */}
          <YStack paddingHorizontal="$4" gap="$3">
            <Button
              theme="active"
              size="$5"
              width="100%"
              onPress={handleQuickStart}
              icon={<Dumbbell size={20} />}
            >
              Empezar Entreno Libre
            </Button>

            {/* Template Selector */}
            {!tlLoading && templates && templates.length > 0 && (
              <YStack gap="$2">
                <Paragraph color="$color11" fontWeight="600" marginTop="$1">
                  O usa una plantilla
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
                        minWidth={140}
                      >
                        <Paragraph fontWeight="600" color="$color12">{tpl.name}</Paragraph>
                        <Paragraph size="$2" color="$color10">{tpl.description || 'Sin descripción'}</Paragraph>
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
                marginTop="$2"
              >
                Empezar con Plantilla
              </Button>
            )}
          </YStack>

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
