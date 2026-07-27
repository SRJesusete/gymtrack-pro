import { useState, useMemo, useEffect } from 'react';
import { ScrollView, Dimensions } from 'react-native';
import {
  YStack, XStack, H2, H3, H4, Paragraph, Button, Card,
  Theme, Spinner, Divider, Badge,
} from '@blinkdotnew/mobile-ui';
import { TrendingUp, Award, Dumbbell, LogIn, BarChart3 } from '@blinkdotnew/mobile-ui';
import Svg, { Rect, Line, Circle, Text as SvgText, Polyline } from 'react-native-svg';
import { useAuth } from '@/hooks/useAuth';
import { useSessions, useSessionWithExercises, usePersonalRecords } from '@/hooks/useDatabase';
import type { Session, SessionWithExercises } from '@/types';
import { TypeDistribution } from '@/components/TypeDistribution';
import { unpackType } from '@/constants/workoutTypes';
import { C } from '@/constants/theme';

const CHART_WIDTH = Dimensions.get('window').width - 64;
const CHART_HEIGHT = 200;
const CHART_PADDING = { top: 20, right: 20, bottom: 30, left: 50 };
const CHART_INNER_W = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
const CHART_INNER_H = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

const MUSCLE_COLORS: Record<string, string> = {
  Pecho: '#EF4444', Espalda: '#3B82F6', Piernas: '#22C55E',
  Hombros: '#F97316', Brazos: '#A855F7', Core: '#EAB308',
};
const MUSCLE_GROUPS = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core'];

interface VolumePoint {
  date: string;
  volume: number;
  label: string;
}

function SimpleLineChart({ data, color }: { data: VolumePoint[]; color: string }) {
  if (data.length === 0) return null;

  const maxVol = Math.max(...data.map((d) => d.volume), 1);
  const stepX = data.length > 1 ? CHART_INNER_W / (data.length - 1) : CHART_INNER_W;

  const points = data.map((d, i) => ({
    x: CHART_PADDING.left + i * stepX,
    y: CHART_PADDING.top + CHART_INNER_H - (d.volume / maxVol) * CHART_INNER_H,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Y-axis ticks
  const yTicks = [0, Math.round(maxVol / 2), Math.round(maxVol)];

  // Only show some x-axis labels
  const maxLabels = Math.min(data.length, 5);
  const labelStep = Math.max(1, Math.floor(data.length / maxLabels));

  return (
    <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
      {/* Grid lines */}
      {yTicks.map((tick, i) => {
        const y = CHART_PADDING.top + CHART_INNER_H - (tick / maxVol) * CHART_INNER_H;
        return (
          <YStack key={i}>
            <Line
              x1={CHART_PADDING.left}
              y1={y}
              x2={CHART_PADDING.left + CHART_INNER_W}
              y2={y}
              stroke="#27272A"
              strokeWidth={1}
            />
          </YStack>
        );
      })}

      {/* Area fill */}
      <Polyline
        points={[
          `${CHART_PADDING.left},${CHART_PADDING.top + CHART_INNER_H}`,
          ...points.map((p) => `${p.x},${p.y}`),
          `${points[points.length - 1].x},${CHART_PADDING.top + CHART_INNER_H}`,
        ].join(' ')}
        fill={color + '20'}
        stroke="none"
      />

      {/* Line */}
      <Polyline points={pathD} fill="none" stroke={color} strokeWidth={2.5} />

      {/* Data points */}
      {points.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={4} fill={color} />
      ))}

      {/* Y-axis labels */}
      {yTicks.map((tick, i) => {
        const y = CHART_PADDING.top + CHART_INNER_H - (tick / maxVol) * CHART_INNER_H + 4;
        return (
          <SvgText
            key={i}
            x={CHART_PADDING.left - 8}
            y={y}
            fill="#71717A"
            fontSize="10"
            textAnchor="end"
          >
            {tick}
          </SvgText>
        );
      })}

      {/* X-axis labels */}
      {data.map((d, i) => {
        if (i % labelStep !== 0 && i !== data.length - 1) return null;
        return (
          <SvgText
            key={i}
            x={points[i].x}
            y={CHART_HEIGHT - 4}
            fill="#71717A"
            fontSize="10"
            textAnchor="middle"
          >
            {d.label}
          </SvgText>
        );
      })}
    </Svg>
  );
}

export default function ProgressScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: sessions, isLoading: ssLoading } = useSessions(user?.id || null);
  const { data: records } = usePersonalRecords(user?.id || null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [range, setRange] = useState<'month' | 'year' | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  // Sessions within the selected temporal range
  const rangedSessions = useMemo(() => {
    if (!sessions) return [];
    if (range === 'all') return sessions;
    const now = new Date();
    return sessions.filter((s) => {
      const d = new Date(s.startedAt);
      if (range === 'month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      return d.getFullYear() === now.getFullYear();
    });
  }, [sessions, range]);

  // Sessions used by the volume chart (range + optional type)
  const chartSessions = useMemo(() => {
    if (!typeFilter) return rangedSessions;
    return rangedSessions.filter((s) => unpackType(s.notes) === typeFilter);
  }, [rangedSessions, typeFilter]);

  // Volume by muscle group over time
  const volumeHistory = useMemo(() => {
    const sessions = chartSessions;
    if (!sessions || sessions.length === 0) return {};
    const map: Record<string, VolumePoint[]> = {};

    // Group sessions by date (day-level)
    const sorted = [...sessions]
      .filter((s) => s.completedAt)
      .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());

    // We'll need exercise data per session to get muscle groups
    // For now, approximate: use the total volume per session as the "all groups" chart
    const allPoints: VolumePoint[] = [];
    // For muscle-specific volume, we can approximate from session names
    const muscleVolume: Record<string, VolumePoint[]> = {};
    MUSCLE_GROUPS.forEach((g) => { muscleVolume[g] = []; });

    let runningTotal: Record<string, number> = {};
    MUSCLE_GROUPS.forEach((g) => { runningTotal[g] = 0; });

    for (const s of sorted) {
      const date = new Date(s.startedAt);
      const label = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

      // Approximate muscle group from session name/template
      const name = (s.name || '').toLowerCase();
      let matchedGroups: string[] = [];
      if (name.includes('push') || name.includes('pecho') || name.includes('banca')) matchedGroups.push('Pecho', 'Hombros', 'Brazos');
      if (name.includes('pull') || name.includes('espalda') || name.includes('dominada')) matchedGroups.push('Espalda', 'Brazos');
      if (name.includes('leg') || name.includes('pierna') || name.includes('sentadilla')) matchedGroups.push('Piernas');
      if (name.includes('full body') || name.includes('upper') || name.includes('cuerpo completo') || name.includes('hipertrofia') || name.includes('5x5') || name.includes('fuerza')) matchedGroups = MUSCLE_GROUPS;

      // Distribute volume across matched groups
      const groupCount = matchedGroups.length || MUSCLE_GROUPS.length;
      const volPerGroup = s.totalVolume / groupCount;

      for (const g of matchedGroups) {
        runningTotal[g] = (runningTotal[g] || 0) + volPerGroup;
        muscleVolume[g].push({
          date: s.startedAt,
          volume: Math.round(runningTotal[g]),
          label,
        });
      }

      // Add a combined running total
      const combined = Object.values(runningTotal).reduce((a, b) => a + b, 0);
      allPoints.push({
        date: s.startedAt,
        volume: Math.round(combined),
        label,
      });
    }

    return { all: allPoints, ...muscleVolume };
  }, [chartSessions]);

  if (authLoading) {
    return (
      <Theme name="dark">
        <YStack flex={1} backgroundColor={C.bg} justifyContent="center" alignItems="center">
          <Spinner size="large" color={C.volt} />
        </YStack>
      </Theme>
    );
  }

  if (!user) {
    return (
      <Theme name="dark">
        <YStack flex={1} backgroundColor={C.bg}>
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <YStack padding="$4" paddingTop="$6" gap="$2">
              <H2 color={C.text} fontWeight="800">Progreso</H2>
              <Paragraph color={C.sub}>Inicia sesión para ver tus estadísticas</Paragraph>
            </YStack>
            <YStack padding="$8" alignItems="center" gap="$3">
              <BarChart3 size={48} color={C.muted} />
              <Paragraph color={C.sub} textAlign="center">
                Registra entrenamientos para ver tu evolución
              </Paragraph>
            </YStack>
          </ScrollView>
        </YStack>
      </Theme>
    );
  }

  const activeGroup = selectedGroup || 'all';
  const chartData = volumeHistory[activeGroup] || [];

  return (
    <Theme name="dark">
      <YStack flex={1} backgroundColor={C.bg}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <YStack padding="$4" paddingTop="$6" gap="$2">
            <H2 color={C.text} fontWeight="800">Progreso</H2>
            <Paragraph color={C.sub}>
              Volumen acumulado a lo largo del tiempo
            </Paragraph>
          </YStack>

          {/* Range selector */}
          <XStack paddingHorizontal="$4" gap="$2" marginBottom="$2">
            {([['month', 'Mes'], ['year', 'Año'], ['all', 'Todo']] as const).map(([id, label]) => {
              const active = range === id;
              return (
                <Card
                  key={id}
                  flex={1}
                  paddingVertical="$2"
                  borderRadius={999}
                  alignItems="center"
                  backgroundColor={active ? C.volt : C.surface}
                  borderColor={active ? C.volt : C.border}
                  borderWidth={1}
                  onPress={() => setRange(id)}
                  pressStyle={{ scale: 0.97 }}
                  data-testid={`progress-range-${id}`}
                >
                  <Paragraph fontWeight="800" size="$2" color={active ? '#000000' : C.sub}>{label}</Paragraph>
                </Card>
              );
            })}
          </XStack>

          {/* Group Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            <XStack gap="$2" paddingVertical="$2">
              <Card
                bordered
                paddingHorizontal="$4"
                paddingVertical="$2"
                borderRadius="$6"
                backgroundColor={selectedGroup === null ? C.volt : C.elevated}
                onPress={() => setSelectedGroup(null)}
              >
                <Paragraph
                  fontWeight="600"
                  color={selectedGroup === null ? '#000000' : C.sub}
                  size="$2"
                >
                  Total
                </Paragraph>
              </Card>
              {MUSCLE_GROUPS.map((group) => (
                <Card
                  key={group}
                  bordered
                  paddingHorizontal="$4"
                  paddingVertical="$2"
                  borderRadius="$6"
                  backgroundColor={selectedGroup === group ? MUSCLE_COLORS[group] : C.elevated}
                  onPress={() => setSelectedGroup(group)}
                >
                  <Paragraph
                    fontWeight="600"
                    color={selectedGroup === group ? 'white' : C.sub}
                    size="$2"
                  >
                    {group}
                  </Paragraph>
                </Card>
              ))}
            </XStack>
          </ScrollView>

          {/* Chart */}
          <YStack padding="$4">
            {ssLoading ? (
              <YStack padding="$8" alignItems="center">
                <Spinner size="large" color={C.volt} />
              </YStack>
            ) : chartData.length === 0 ? (
              <Card bordered padding="$6" borderRadius="$4" backgroundColor={C.surface} alignItems="center" gap="$3">
                <TrendingUp size={48} color={C.muted} />
                <Paragraph color={C.sub} textAlign="center">
                  Registra entrenamientos para ver tu gráfico de volumen
                </Paragraph>
              </Card>
            ) : (
              <Card bordered padding="$3" borderRadius="$4" backgroundColor={C.surface}>
                <SimpleLineChart
                  data={chartData}
                  color={MUSCLE_COLORS[activeGroup] || '#F97316'}
                />
                <Paragraph size="$2" color={C.sub} textAlign="center" marginTop="$2">
                  Volumen acumulado (kg) · {activeGroup === 'all' ? 'Todos los grupos' : activeGroup}
                </Paragraph>
              </Card>
            )}
          </YStack>

          {/* Distribution by workout type */}
          {rangedSessions.length > 0 && (
            <YStack paddingHorizontal="$4" marginBottom="$2">
              <TypeDistribution
                sessions={rangedSessions}
                title={`Distribución por tipo · ${range === 'month' ? 'Mes' : range === 'year' ? 'Año' : 'Total'}`}
                metric="volume"
                selectedType={typeFilter}
                onSelectType={(id) => setTypeFilter((p) => (p === id ? null : id))}
              />
            </YStack>
          )}

          {/* Personal Records */}
          {records && records.length > 0 && (
            <YStack padding="$4" gap="$3">
              <H3 color={C.text}>Records Personales</H3>
              <YStack gap="$2">
                {records.slice(0, 8).map((pr) => (
                  <Card
                    key={pr.id}
                    bordered
                    padding="$3"
                    borderRadius="$4"
                    backgroundColor={C.surface}
                  >
                    <XStack justifyContent="space-between" alignItems="center">
                      <YStack gap="$1">
                        <Paragraph fontWeight="700" color={C.text}>{pr.exerciseName}</Paragraph>
                        <Paragraph size="$2" color={C.sub}>
                          {new Date(pr.achievedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </Paragraph>
                      </YStack>
                      <XStack gap="$2" alignItems="center">
                        <Award size={16} color={C.volt} />
                        <Paragraph color={C.volt} fontWeight="800">{pr.prValue} kg</Paragraph>
                      </XStack>
                    </XStack>
                  </Card>
                ))}
              </YStack>
            </YStack>
          )}

          {/* Stats Summary */}
          {sessions && sessions.length > 0 && (
            <YStack padding="$4" gap="$3">
              <H3 color={C.text}>Resumen</H3>
              <XStack gap="$3" flexWrap="wrap">
                <Card bordered padding="$4" borderRadius="$4" backgroundColor={C.surface} flex={1} minWidth={140}>
                  <YStack alignItems="center" gap="$1">
                    <Dumbbell size={20} color={C.volt} />
                    <H4 color={C.text} fontWeight="800">{sessions.length}</H4>
                    <Paragraph size="$2" color={C.sub}>Sesiones</Paragraph>
                  </YStack>
                </Card>
                <Card bordered padding="$4" borderRadius="$4" backgroundColor={C.surface} flex={1} minWidth={140}>
                  <YStack alignItems="center" gap="$1">
                    <TrendingUp size={20} color={C.success} />
                    <H4 color={C.text} fontWeight="800">
                      {sessions.reduce((sum, s) => sum + s.totalVolume, 0).toLocaleString()}
                    </H4>
                    <Paragraph size="$2" color={C.sub}>kg totales</Paragraph>
                  </YStack>
                </Card>
                <Card bordered padding="$4" borderRadius="$4" backgroundColor={C.surface} flex={1} minWidth={140}>
                  <YStack alignItems="center" gap="$1">
                    <Award size={20} color={C.volt} />
                    <H4 color={C.text} fontWeight="800">{records?.length || 0}</H4>
                    <Paragraph size="$2" color={C.sub}>PRs</Paragraph>
                  </YStack>
                </Card>
              </XStack>
            </YStack>
          )}
        </ScrollView>
      </YStack>
    </Theme>
  );
}
