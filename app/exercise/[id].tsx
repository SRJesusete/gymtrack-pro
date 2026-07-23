import { useMemo } from 'react';
import { ScrollView, Dimensions } from 'react-native';
import Svg, { Line, Circle as SvgCircle, Text as SvgText, Polyline, Rect } from 'react-native-svg';
import {
  YStack, XStack, H2, H3, H4, Paragraph, Button, Card,
  Theme, Spinner,
} from '@blinkdotnew/mobile-ui';
import { ArrowLeft, Trophy, TrendingUp, Dumbbell, Calendar, Clock } from '@blinkdotnew/mobile-ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useExerciseById, useExerciseHistory, useLatestRecordByExercise } from '@/hooks/useDatabase';
import type { ExerciseHistoryPoint } from '@/hooks/useDatabase';

const SCREEN_W = Dimensions.get('window').width;
const CHART_PAD_L = 48;
const CHART_PAD_R = 16;
const CHART_PAD_T = 20;
const CHART_PAD_B = 28;
const CHART_H = 200;
const CHART_W = SCREEN_W - 32;
const PLOT_W = CHART_W - CHART_PAD_L - CHART_PAD_R;
const PLOT_H = CHART_H - CHART_PAD_T - CHART_PAD_B;

function WeightChart({ points }: { points: ExerciseHistoryPoint[] }) {
  const data = useMemo(() => {
    const sorted = [...points].reverse(); // chronological
    if (sorted.length < 2) return { pts: [] as { x: number; y: number; label: string }[], yMax: 100 };

    const weights = sorted.map((p) => p.maxWeight);
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const range = maxW - minW || 10;

    const yMin = Math.max(0, minW - range * 0.2);
    const yMax = maxW + range * 0.3;

    return {
      pts: sorted.map((p, i) => ({
        x: CHART_PAD_L + (sorted.length === 1 ? PLOT_W / 2 : (i / (sorted.length - 1)) * PLOT_W),
        y: CHART_PAD_T + PLOT_H - ((p.maxWeight - yMin) / (yMax - yMin)) * PLOT_H,
        label: new Date(p.date).toLocaleDateString('es-ES', { day: 'd', month: 'short' }),
      })),
      yMin,
      yMax,
    };
  }, [points]);

  if (data.pts.length < 2) {
    return (
      <YStack padding="$4" alignItems="center">
        <Paragraph color="$color10">Necesitas al menos 2 sesiones para ver la progresion</Paragraph>
      </YStack>
    );
  }

  const yTicks = 4;
  const yStep = (data.yMax - data.yMin) / (yTicks - 1);

  return (
    <Svg width={CHART_W} height={CHART_H}>
      {/* Grid lines */}
      {Array.from({ length: yTicks }, (_, i) => {
        const y = CHART_PAD_T + (PLOT_H / (yTicks - 1)) * i;
        return (
          <Svg key={`grid-${i}`}>
            <Line x1={CHART_PAD_L} y1={y} x2={CHART_W - CHART_PAD_R} y2={y} stroke="$color5" strokeWidth={0.5} />
            <SvgText x={CHART_PAD_L - 6} y={y + 4} fill="$color10" fontSize={10} textAnchor="end">
              {Math.round(data.yMin + yStep * (yTicks - 1 - i))}
            </SvgText>
          </Svg>
        );
      })}

      {/* Line */}
      <Polyline
        points={data.pts.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke="#22C55E"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Area fill gradient-like effect */}
      <Polyline
        points={`${data.pts[0].x},${CHART_PAD_T + PLOT_H} ${data.pts.map((p) => `${p.x},${p.y}`).join(' ')} ${data.pts[data.pts.length - 1].x},${CHART_PAD_T + PLOT_H}`}
        fill="#22C55E"
        fillOpacity={0.08}
      />

      {/* Dots */}
      {data.pts.map((p, i) => (
        <SvgCircle key={i} cx={p.x} cy={p.y} r={4} fill="#22C55E" stroke="#1A1A2E" strokeWidth={2} />
      ))}

      {/* X labels (limited for space) */}
      {data.pts
        .filter((_, i) => data.pts.length <= 8 || i % Math.ceil(data.pts.length / 8) === 0)
        .map((p, i) => (
          <SvgText key={`x-${i}`} x={p.x} y={CHART_H - 4} fill="$color10" fontSize={9} textAnchor="middle">
            {p.label}
          </SvgText>
        ))}
    </Svg>
  );
}

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { data: exercise, isLoading: exLoading } = useExerciseById(id || null);
  const { data: history, isLoading: histLoading } = useExerciseHistory(user?.id || null, id || '');
  const { data: bestRecord } = useLatestRecordByExercise(user?.id || null, id || '');

  const isLoading = exLoading || histLoading;

  if (isLoading) {
    return (
      <Theme name="dark">
        <YStack flex={1} backgroundColor="$color1" justifyContent="center" alignItems="center">
          <Spinner size="large" color="$color9" />
        </YStack>
      </Theme>
    );
  }

  const exName = exercise?.name || 'Ejercicio';
  const exGroup = exercise?.muscleGroup || '';

  const totalSessions = history?.length || 0;
  const totalVolume = history?.reduce((sum, h) => sum + h.volume, 0) || 0;
  const bestSet = history
    ?.flatMap((h) => h.sets)
    .reduce((best, s) => (s.weight > best.weight ? s : best), { weight: 0, reps: 0 });

  return (
    <Theme name="dark">
      <YStack flex={1} backgroundColor="$color1">
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <YStack padding="$4" paddingTop="$6" gap="$1">
            <Button chromeless onPress={() => router.back()} alignSelf="flex-start" marginBottom="$2">
              <ArrowLeft size={24} color="$color11" />
            </Button>
            <H2 color="$color12" fontWeight="800">{exName}</H2>
            <Paragraph color="$color10">{exGroup}</Paragraph>
          </YStack>

          {/* Stats Cards */}
          <XStack paddingHorizontal="$4" gap="$3" marginBottom="$3">
            <Card bordered padding="$4" borderRadius="$4" backgroundColor="$color2" flex={1}>
              <YStack alignItems="center" gap="$1">
                <Trophy size={22} color="#EAB308" />
                <Paragraph size="$1" color="$color10">Record</Paragraph>
                <H3 color="$color12" fontWeight="800">
                  {bestRecord ? `${bestRecord.prValue} kg` : '--'}
                </H3>
              </YStack>
            </Card>
            <Card bordered padding="$4" borderRadius="$4" backgroundColor="$color2" flex={1}>
              <YStack alignItems="center" gap="$1">
                <Calendar size={22} color="$color9" />
                <Paragraph size="$1" color="$color10">Sesiones</Paragraph>
                <H3 color="$color12" fontWeight="800">{totalSessions}</H3>
              </YStack>
            </Card>
            <Card bordered padding="$4" borderRadius="$4" backgroundColor="$color2" flex={1}>
              <YStack alignItems="center" gap="$1">
                <TrendingUp size={22} color="$color9" />
                <Paragraph size="$1" color="$color10">Vol. Total</Paragraph>
                <H3 color="$color12" fontWeight="800">
                  {totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume} kg
                </H3>
              </YStack>
            </Card>
          </XStack>

          {/* Weight Progression Chart */}
          <YStack paddingHorizontal="$4" marginBottom="$3">
            <Card bordered padding="$4" borderRadius="$4" backgroundColor="$color2">
              <H4 color="$color11" marginBottom="$3">Progresion de Peso</H4>
              {history && history.length > 0 ? (
                <WeightChart points={history} />
              ) : (
                <YStack padding="$4" alignItems="center">
                  <Paragraph color="$color10">Registra entrenos para ver la progresion</Paragraph>
                </YStack>
              )}
            </Card>
          </YStack>

          {/* Recent Sessions */}
          {history && history.length > 0 && (
            <YStack paddingHorizontal="$4" gap="$2">
              <H4 color="$color11">Historial de Sesiones</H4>
              {history.slice(0, 15).map((point, idx) => (
                <Card
                  key={`${point.sessionId}-${idx}`}
                  bordered
                  padding="$3"
                  borderRadius="$4"
                  backgroundColor="$color2"
                >
                  <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
                    <YStack>
                      <Paragraph fontWeight="700" color="$color12" size="$3">
                        {point.sessionName}
                      </Paragraph>
                      <XStack gap="$2" alignItems="center">
                        <Clock size={12} color="$color10" />
                        <Paragraph size="$2" color="$color10">
                          {new Date(point.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Paragraph>
                      </XStack>
                    </YStack>
                    <YStack alignItems="flex-end">
                      <Paragraph fontWeight="700" color="#22C55E" size="$4">
                        {point.maxWeight} kg
                      </Paragraph>
                      <Paragraph size="$2" color="$color10">{point.volume} kg vol.</Paragraph>
                    </YStack>
                  </XStack>

                  {/* Sets pills */}
                  <XStack gap="$2" flexWrap="wrap">
                    {point.sets.map((set, si) => (
                      <Card
                        key={si}
                        bordered
                        paddingHorizontal="$3"
                        paddingVertical="$1"
                        borderRadius="$2"
                        backgroundColor={Number(set.isPr) ? '#22C55E20' : '$color3'}
                        borderColor={Number(set.isPr) ? '#22C55E' : 'transparent'}
                      >
                        <Paragraph size="$2" color={Number(set.isPr) ? '#22C55E' : '$color11'} fontWeight="600">
                          {set.weight}kg x{set.reps}
                          {Number(set.isWarmup) ? ' (cal.)' : ''}
                          {Number(set.isPr) ? ' PR' : ''}
                        </Paragraph>
                      </Card>
                    ))}
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
