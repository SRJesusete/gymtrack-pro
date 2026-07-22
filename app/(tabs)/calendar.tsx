import React, { useMemo, useState } from 'react';
import { ScrollView, Dimensions } from 'react-native';
import {
  YStack, XStack, H2, H3, H4, Paragraph, Button, Card,
  Theme, Spinner,
} from '@blinkdotnew/mobile-ui';
import { Dumbbell, Calendar as CalIcon, ChevronLeft, ChevronRight, Circle, Plus } from '@blinkdotnew/mobile-ui';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useSessions } from '@/hooks/useDatabase';
import type { Session } from '@/types';

const SCREEN_W = Dimensions.get('window').width;
const DAY_NAMES = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function getMonthDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday = 0
  const days: (Date | null)[] = [];

  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function CalendarScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: sessions, isLoading: ssLoading } = useSessions(user?.id || null);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const today = new Date();

  const sessionMap = useMemo(() => {
    if (!sessions) return {};
    const map: Record<string, Session[]> = {};
    for (const s of sessions) {
      const key = formatDateKey(new Date(s.startedAt));
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    return map;
  }, [sessions]);

  const days = useMemo(() => getMonthDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const selectedSessions = useMemo(() => {
    if (!selectedDate) return [];
    const key = formatDateKey(selectedDate);
    return sessionMap[key] || [];
  }, [selectedDate, sessionMap]);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
    setSelectedDate(null);
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
    setSelectedDate(null);
  };

  if (authLoading) {
    return (
      <Theme name="dark">
        <YStack flex={1} backgroundColor="$color1" justifyContent="center" alignItems="center">
          <Spinner size="large" color="$color9" />
        </YStack>
      </Theme>
    );
  }

  return (
    <Theme name="dark">
      <YStack flex={1} backgroundColor="$color1">
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <YStack padding="$4" paddingTop="$6" gap="$2">
            <H2 color="$color12" fontWeight="800">Calendario</H2>
            <Paragraph color="$color10">
              {user ? 'Registra tus entrenamientos por dia' : 'Inicia sesion para usar el calendario'}
            </Paragraph>
          </YStack>

          {/* Month Navigation */}
          <XStack paddingHorizontal="$4" justifyContent="space-between" alignItems="center" marginBottom="$3">
            <Button chromeless onPress={goPrevMonth} icon={<ChevronLeft size={20} color="$color11" />} />
            <H3 color="$color12" fontWeight="700">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </H3>
            <Button chromeless onPress={goNextMonth} icon={<ChevronRight size={20} color="$color11" />} />
          </XStack>

          {/* Day names */}
          <XStack paddingHorizontal="$4" marginBottom="$2">
            {DAY_NAMES.map((d) => (
              <YStack key={d} flex={1} alignItems="center" paddingVertical="$1">
                <Paragraph size="$1" color="$color10" fontWeight="600">{d}</Paragraph>
              </YStack>
            ))}
          </XStack>

          {/* Calendar Grid */}
          <YStack paddingHorizontal="$4" gap="$1">
            {Array.from({ length: Math.ceil(days.length / 7) }).map((_, row) => (
              <XStack key={row} gap="$1">
                {days.slice(row * 7, row * 7 + 7).map((day, col) => {
                  if (!day) {
                    return <YStack key={`empty-${col}`} flex={1} height={44} />;
                  }
                  const dateKey = formatDateKey(day);
                  const daySessions = sessionMap[dateKey];
                  const hasWorkout = daySessions && daySessions.length > 0;
                  const volume = hasWorkout ? daySessions.reduce((s, sess) => s + sess.totalVolume, 0) : 0;
                  const isToday = sameDay(day, today);
                  const isSelected = selectedDate && sameDay(day, selectedDate);

                  return (
                    <YStack
                      key={dateKey}
                      flex={1}
                      height={64}
                    >
                      <Card
                        bordered={isToday || isSelected}
                        padding="$1"
                        borderRadius="$3"
                        backgroundColor={
                          isSelected ? '$color4' : isToday ? '$color3' : 'transparent'
                        }
                        borderColor={isSelected ? '$color9' : isToday ? '$color9' : 'transparent'}
                        borderWidth={isToday || isSelected ? 2 : 0}
                        minHeight={60}
                        onPress={() => setSelectedDate(isSelected ? null : day)}
                      >
                        <YStack flex={1} alignItems="center" justifyContent="center" gap="$1">
                          <Paragraph
                            size="$2"
                            fontWeight={isToday ? '800' : '600'}
                            color={isToday ? '$color9' : '$color12'}
                          >
                            {day.getDate()}
                          </Paragraph>
                          {hasWorkout && (
                            <YStack
                              width={8}
                              height={8}
                              borderRadius={4}
                              backgroundColor="$orange9"
                            />
                          )}
                        </YStack>
                      </Card>
                    </YStack>
                  );
                })}
              </XStack>
            ))}
          </YStack>

          {/* Selected Day Details */}
          {selectedDate && (
            <YStack padding="$4" marginTop="$3" gap="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <H3 color="$color12">
                  {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </H3>
                {user && (
                  <Button
                    theme="active"
                    size="$3"
                    onPress={() => {
                      const iso = selectedDate.toISOString().split('T')[0];
                      router.push(`/session/new?date=${iso}`);
                    }}
                    icon={<Plus size={14} />}
                  >
                    Añadir
                  </Button>
                )}
              </XStack>

              {!user ? (
                <Card bordered padding="$4" borderRadius="$4" backgroundColor="$color2">
                  <Paragraph color="$color10" textAlign="center">
                    Inicia sesion para registrar entrenamientos
                  </Paragraph>
                </Card>
              ) : ssLoading ? (
                <YStack padding="$4" alignItems="center">
                  <Spinner size="small" color="$color9" />
                </YStack>
              ) : selectedSessions.length === 0 ? (
                <Card bordered padding="$4" borderRadius="$4" backgroundColor="$color2" alignItems="center" gap="$2">
                  <CalIcon size={32} color="$color6" />
                  <Paragraph color="$color10">Sin entrenamientos este dia</Paragraph>
                  <Button
                    theme="active"
                    size="$3"
                    onPress={() => {
                      const iso = selectedDate.toISOString().split('T')[0];
                      router.push(`/session/new?date=${iso}`);
                    }}
                  >
                    Registrar Entreno
                  </Button>
                </Card>
              ) : (
                <YStack gap="$2">
                  {selectedSessions.map((s) => (
                    <Card
                      key={s.id}
                      bordered
                      padding="$4"
                      borderRadius="$4"
                      backgroundColor="$color2"
                      onPress={() => router.push(`/session/${s.id}`)}
                    >
                      <XStack justifyContent="space-between" alignItems="center">
                        <YStack gap="$1">
                          <Paragraph fontWeight="700" color="$color12">{s.name}</Paragraph>
                          <Paragraph size="$2" color="$color10">
                            {new Date(s.startedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            {s.durationMinutes ? ` · ${s.durationMinutes} min` : ''}
                          </Paragraph>
                        </YStack>
                        <Paragraph color="$color9" fontWeight="700">{s.totalVolume.toLocaleString()} kg</Paragraph>
                      </XStack>
                    </Card>
                  ))}
                </YStack>
              )}
            </YStack>
          )}

          {/* Legend */}
          <YStack padding="$4" marginTop="$2">
            <Card bordered padding="$3" borderRadius="$4" backgroundColor="$color2">
              <XStack gap="$4" justifyContent="center">
                <XStack gap="$1" alignItems="center">
                  <YStack width={10} height={10} borderRadius={5} backgroundColor="$orange9" />
                  <Paragraph size="$1" color="$color10">Entreno</Paragraph>
                </XStack>
                <XStack gap="$1" alignItems="center">
                  <YStack width={10} height={10} borderRadius={5} backgroundColor="transparent" borderWidth={2} borderColor="$color9" />
                  <Paragraph size="$1" color="$color10">Hoy</Paragraph>
                </XStack>
              </XStack>
            </Card>
          </YStack>
        </ScrollView>
      </YStack>
    </Theme>
  );
}
