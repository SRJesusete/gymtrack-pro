import { useMemo } from 'react';
import { YStack, XStack, Paragraph, Card } from '@blinkdotnew/mobile-ui';
import type { Session } from '@/types';
import { C, FONT } from '@/constants/theme';
import { WORKOUT_TYPES, unpackType } from '@/constants/workoutTypes';

interface Props {
  sessions: Session[];
  title: string;
  metric?: 'minutes' | 'volume';
  onSelectType?: (id: string) => void;
  selectedType?: string | null;
}

export function TypeDistribution({ sessions, title, metric = 'minutes', onSelectType, selectedType }: Props) {
  const { rows, max, useVolume } = useMemo(() => {
    const acc: Record<string, { count: number; minutes: number; volume: number }> = {};
    for (const s of sessions) {
      const t = unpackType(s.notes);
      if (!acc[t]) acc[t] = { count: 0, minutes: 0, volume: 0 };
      acc[t].count++;
      acc[t].minutes += s.durationMinutes || 0;
      acc[t].volume += s.totalVolume || 0;
    }
    const rows = WORKOUT_TYPES
      .map((t) => ({ type: t, ...(acc[t.id] || { count: 0, minutes: 0, volume: 0 }) }))
      .filter((r) => r.count > 0);
    const useVolume = metric === 'volume' && rows.some((r) => r.volume > 0);
    const valueOf = (r: (typeof rows)[number]) => (useVolume ? r.volume : r.minutes);
    rows.sort((a, b) => valueOf(b) - valueOf(a));
    const max = Math.max(1, ...rows.map(valueOf));
    return { rows, max, useVolume };
  }, [sessions, metric]);

  if (rows.length === 0) return null;

  return (
    <Card bordered padding="$4" borderRadius={14} backgroundColor={C.surface} borderColor={C.border} data-testid="type-distribution">
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
        <Paragraph fontFamily={FONT.headingMed} color={C.sub} letterSpacing={1.5} fontSize={12} textTransform="uppercase">
          {title}
        </Paragraph>
        {onSelectType && selectedType ? (
          <Paragraph size="$1" color={C.volt} fontWeight="700">Toca para quitar filtro</Paragraph>
        ) : onSelectType ? (
          <Paragraph size="$1" color={C.muted}>Toca una barra</Paragraph>
        ) : null}
      </XStack>
      <YStack gap="$3">
        {rows.map((r) => {
          const value = useVolume ? r.volume : r.minutes;
          const active = selectedType === r.type.id;
          const dim = !!selectedType && !active;
          return (
            <YStack
              key={r.type.id}
              gap="$1"
              opacity={dim ? 0.4 : 1}
              onPress={onSelectType ? () => onSelectType(r.type.id) : undefined}
              pressStyle={onSelectType ? { opacity: 0.7 } : undefined}
              cursor={onSelectType ? 'pointer' : undefined}
              padding={onSelectType ? '$1' : 0}
              borderRadius={8}
              borderWidth={active ? 1 : 0}
              borderColor={active ? r.type.color : 'transparent'}
              backgroundColor={active ? C.elevated : 'transparent'}
              data-testid={`type-bar-${r.type.id}`}
            >
              <XStack justifyContent="space-between" alignItems="center">
                <XStack alignItems="center" gap="$2">
                  <YStack width={10} height={10} borderRadius={5} backgroundColor={r.type.color} />
                  <Paragraph size="$2" color={C.text} fontWeight="700">{r.type.label}</Paragraph>
                </XStack>
                <Paragraph size="$1" color={C.sub}>
                  {r.count} {r.count === 1 ? 'entreno' : 'entrenos'} · {r.minutes} min{r.volume > 0 ? ` · ${r.volume.toLocaleString()} kg` : ''}
                </Paragraph>
              </XStack>
              <YStack height={8} borderRadius={4} backgroundColor={C.elevated} overflow="hidden">
                <YStack height={8} borderRadius={4} backgroundColor={r.type.color} width={`${Math.max(6, Math.round((value / max) * 100))}%`} />
              </YStack>
            </YStack>
          );
        })}
      </YStack>
    </Card>
  );
}
