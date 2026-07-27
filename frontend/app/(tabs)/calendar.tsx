import React, { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import {
  YStack, XStack, H2, H3, H4, Paragraph, Button, Card,
  Theme, Spinner, Input, TextArea, BlinkDialog, toast, DatePicker,
} from '@blinkdotnew/mobile-ui';
import { Calendar as CalIcon, ChevronLeft, ChevronRight, Plus, Clock, Trash2, Save, Dumbbell } from '@blinkdotnew/mobile-ui';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useSessions, useQuickLogSession, useUpdateSession, useDeleteSession } from '@/hooks/useDatabase';
import type { Session } from '@/types';
import { C, FONT } from '@/constants/theme';
import { WORKOUT_TYPES, getTypeColor, getTypeLabel, packNotes, unpackType, stripTypeMarker } from '@/constants/workoutTypes';

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
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  return days;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const offset = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - offset);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDays(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
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
  const quickLog = useQuickLogSession();
  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();

  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [targetDate, setTargetDate] = useState<Date>(new Date());
  const [formName, setFormName] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formType, setFormType] = useState<string>('fuerza');
  const [formDateObj, setFormDateObj] = useState<Date>(new Date());
  const [saving, setSaving] = useState(false);

  const today = new Date();

  const filteredSessions = useMemo(() => {
    if (!sessions) return [];
    if (filterType === 'all') return sessions;
    return sessions.filter((s) => unpackType(s.notes) === filterType);
  }, [sessions, filterType]);

  const sessionMap = useMemo(() => {
    const map: Record<string, Session[]> = {};
    for (const s of filteredSessions) {
      const key = formatDateKey(new Date(s.startedAt));
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    return map;
  }, [filteredSessions]);

  const monthDays = useMemo(() => getMonthDays(viewYear, viewMonth), [viewYear, viewMonth]);
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const periodStats = useMemo(() => {
    let count = 0, volume = 0, minutes = 0;
    const weekKeys = new Set(weekDays.map((d) => formatDateKey(d)));
    for (const s of filteredSessions) {
      const d = new Date(s.startedAt);
      const inRange = viewMode === 'month'
        ? d.getFullYear() === viewYear && d.getMonth() === viewMonth
        : weekKeys.has(formatDateKey(d));
      if (inRange) { count++; volume += s.totalVolume || 0; minutes += s.durationMinutes || 0; }
    }
    return { count, volume, minutes };
  }, [filteredSessions, viewMode, viewYear, viewMonth, weekDays]);

  // Distribution per type over the current period (ignores the type filter)
  const typeStats = useMemo(() => {
    const acc: Record<string, { count: number; minutes: number; volume: number }> = {};
    if (sessions) {
      const weekKeys = new Set(weekDays.map((d) => formatDateKey(d)));
      for (const s of sessions) {
        const d = new Date(s.startedAt);
        const inRange = viewMode === 'month'
          ? d.getFullYear() === viewYear && d.getMonth() === viewMonth
          : weekKeys.has(formatDateKey(d));
        if (!inRange) continue;
        const t = unpackType(s.notes);
        if (!acc[t]) acc[t] = { count: 0, minutes: 0, volume: 0 };
        acc[t].count++;
        acc[t].minutes += s.durationMinutes || 0;
        acc[t].volume += s.totalVolume || 0;
      }
    }
    const rows = WORKOUT_TYPES
      .map((t) => ({ type: t, ...(acc[t.id] || { count: 0, minutes: 0, volume: 0 }) }))
      .filter((r) => r.count > 0)
      .sort((a, b) => b.minutes - a.minutes);
    const maxMin = Math.max(1, ...rows.map((r) => r.minutes));
    return { rows, maxMin };
  }, [sessions, viewMode, viewYear, viewMonth, weekDays]);

  const selectedSessions = useMemo(() => {
    if (!selectedDate) return [];
    return sessionMap[formatDateKey(selectedDate)] || [];
  }, [selectedDate, sessionMap]);

  // ── Navigation ──
  const goPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
    setSelectedDate(null);
  };
  const goNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
    setSelectedDate(null);
  };
  const goPrevWeek = () => {
    const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); setSelectedDate(null);
  };
  const goNextWeek = () => {
    const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); setSelectedDate(null);
  };

  // ── Modal handlers ──
  const openAdd = (date: Date) => {
    setEditingId(null);
    setTargetDate(date);
    setFormName('');
    setFormDuration('');
    setFormNotes('');
    setFormType('fuerza');
    setFormDateObj(date);
    setModalOpen(true);
  };
  const openEdit = (s: Session) => {
    setEditingId(s.id);
    setTargetDate(new Date(s.startedAt));
    setFormName(s.name);
    setFormDuration(s.durationMinutes ? String(s.durationMinutes) : '');
    setFormNotes(stripTypeMarker(s.notes));
    setFormType(unpackType(s.notes));
    setFormDateObj(new Date(s.startedAt));
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!formName.trim()) {
      toast('Nombre requerido', { message: 'Ponle un nombre al entreno', variant: 'error' });
      return;
    }
    const base = editingId ? targetDate : new Date();
    const startedAtDate = new Date(formDateObj);
    startedAtDate.setHours(base.getHours(), base.getMinutes(), base.getSeconds());
    const startedAt = startedAtDate.toISOString();
    setSaving(true);
    try {
      const duration = parseInt(formDuration) || 0;
      const packedNotes = packNotes(formNotes.trim(), formType);
      if (editingId) {
        await updateSession.mutateAsync({
          id: editingId,
          name: formName.trim(),
          durationMinutes: duration,
          notes: packedNotes,
          startedAt,
        });
        toast('Entreno actualizado', { variant: 'success' });
      } else {
        await quickLog.mutateAsync({
          userId: user.id,
          name: formName.trim(),
          startedAt,
          durationMinutes: duration,
          notes: packedNotes,
        });
        toast('Entreno guardado', { message: 'Añadido al calendario', variant: 'success' });
      }
      setModalOpen(false);
    } catch (e: any) {
      toast('Error', { message: e?.message || 'No se pudo guardar', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await deleteSession.mutateAsync(editingId);
      toast('Entreno eliminado', { variant: 'success' });
      setModalOpen(false);
    } catch (e: any) {
      toast('Error', { message: e?.message || 'No se pudo eliminar', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <Theme name="dark">
        <YStack flex={1} backgroundColor={C.bg} justifyContent="center" alignItems="center">
          <Spinner size="large" color={C.volt} />
        </YStack>
      </Theme>
    );
  }

  return (
    <Theme name="dark">
      <YStack flex={1} backgroundColor={C.bg}>
        <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <YStack padding="$4" paddingTop="$6" gap="$2">
            <H2 color={C.text} fontFamily={FONT.display} fontSize={34} letterSpacing={0.5} textTransform="uppercase">Calendario</H2>
            <Paragraph color={C.sub} fontFamily={FONT.body}>
              {user ? 'Registra y revisa tus entrenos por día' : 'Inicia sesión para usar el calendario'}
            </Paragraph>
          </YStack>

          {/* View toggle */}
          <XStack paddingHorizontal="$4" gap="$2" marginBottom="$3">
            <Button
              flex={1}
              size="$3"
              theme={viewMode === 'month' ? 'active' : undefined}
              backgroundColor={viewMode === 'month' ? C.volt : C.surface}
              color={viewMode === 'month' ? C.bg : C.sub}
              onPress={() => setViewMode('month')}
              data-testid="calendar-view-month-btn"
            >
              Mes
            </Button>
            <Button
              flex={1}
              size="$3"
              theme={viewMode === 'week' ? 'active' : undefined}
              backgroundColor={viewMode === 'week' ? C.volt : C.surface}
              color={viewMode === 'week' ? C.bg : C.sub}
              onPress={() => setViewMode('week')}
              data-testid="calendar-view-week-btn"
            >
              Semana
            </Button>
          </XStack>

          {/* Period summary */}
          <XStack paddingHorizontal="$4" gap="$2" marginBottom="$4" data-testid="calendar-summary">
            <CalStat value={String(periodStats.count)} label={viewMode === 'month' ? 'ENTRENOS · MES' : 'ENTRENOS · SEM'} />
            <CalStat value={periodStats.volume.toLocaleString()} label="KG TOTALES" />
            <CalStat value={String(periodStats.minutes)} label="MINUTOS" />
          </XStack>

          {/* Type filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            <FilterChip label="Todos" active={filterType === 'all'} color={C.volt} onPress={() => setFilterType('all')} testid="calendar-filter-all" />
            {WORKOUT_TYPES.map((t) => (
              <FilterChip key={t.id} label={t.label} active={filterType === t.id} color={t.color} onPress={() => setFilterType(t.id)} testid={`calendar-filter-${t.id}`} />
            ))}
          </ScrollView>

          {/* Distribution by type */}
          {user && typeStats.rows.length > 0 && (
            <YStack paddingHorizontal="$4" marginBottom="$4">
              <Card bordered padding="$4" borderRadius={14} backgroundColor={C.surface} borderColor={C.border} data-testid="calendar-type-chart">
                <Paragraph fontFamily={FONT.headingMed} color={C.sub} letterSpacing={1.5} fontSize={12} textTransform="uppercase" marginBottom="$3">
                  Distribución por tipo · {viewMode === 'month' ? 'Mes' : 'Semana'}
                </Paragraph>
                <YStack gap="$3">
                  {typeStats.rows.map((r) => (
                    <YStack key={r.type.id} gap="$1">
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
                        <YStack height={8} borderRadius={4} backgroundColor={r.type.color} width={`${Math.max(6, Math.round((r.minutes / typeStats.maxMin) * 100))}%`} />
                      </YStack>
                    </YStack>
                  ))}
                </YStack>
              </Card>
            </YStack>
          )}

          {viewMode === 'month' ? (
            <>
              {/* Month navigation */}
              <XStack paddingHorizontal="$4" justifyContent="space-between" alignItems="center" marginBottom="$3">
                <Button chromeless onPress={goPrevMonth} icon={<ChevronLeft size={20} color={C.sub} />} data-testid="calendar-prev-month-btn" />
                <H3 color={C.text} fontFamily={FONT.heading} fontSize={22} letterSpacing={0.5} data-testid="calendar-month-label">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </H3>
                <Button chromeless onPress={goNextMonth} icon={<ChevronRight size={20} color={C.sub} />} data-testid="calendar-next-month-btn" />
              </XStack>

              {/* Day names */}
              <XStack paddingHorizontal="$4" marginBottom="$2">
                {DAY_NAMES.map((d) => (
                  <YStack key={d} flex={1} alignItems="center" paddingVertical="$1">
                    <Paragraph size="$1" color={C.sub} fontWeight="600">{d}</Paragraph>
                  </YStack>
                ))}
              </XStack>

              {/* Grid */}
              <YStack paddingHorizontal="$4" gap="$1">
                {Array.from({ length: Math.ceil(monthDays.length / 7) }).map((_, row) => (
                  <XStack key={row} gap="$1">
                    {monthDays.slice(row * 7, row * 7 + 7).map((day, col) => {
                      if (!day) return <YStack key={`empty-${col}`} flex={1} height={64} />;
                      const dayKey = formatDateKey(day);
                      const daySessions = sessionMap[dayKey];
                      const hasWorkout = daySessions && daySessions.length > 0;
                      const isToday = sameDay(day, today);
                      const isSelected = selectedDate && sameDay(day, selectedDate);
                      return (
                        <YStack key={dayKey} flex={1} height={64}>
                          <Card
                            padding="$1"
                            borderRadius="$3"
                            backgroundColor={isSelected ? C.border : isToday ? C.elevated : 'transparent'}
                            borderColor={isSelected ? C.volt : isToday ? C.volt : 'transparent'}
                            borderWidth={isToday || isSelected ? 2 : 0}
                            minHeight={60}
                            onPress={() => setSelectedDate(isSelected ? null : day)}
                            data-testid={`calendar-day-${dayKey}`}
                          >
                            <YStack flex={1} alignItems="center" justifyContent="center" gap="$1">
                              <Paragraph size="$2" fontWeight={isToday ? '800' : '600'} color={isToday ? C.volt : C.text}>
                                {day.getDate()}
                              </Paragraph>
                              {hasWorkout && (
                                <XStack gap={2}>
                                  {daySessions!.slice(0, 3).map((s) => (
                                    <YStack key={s.id} width={6} height={6} borderRadius={3} backgroundColor={getTypeColor(unpackType(s.notes))} />
                                  ))}
                                </XStack>
                              )}
                            </YStack>
                          </Card>
                        </YStack>
                      );
                    })}
                  </XStack>
                ))}
              </YStack>

              {/* Selected day details */}
              {selectedDate && (
                <DayDetails
                  date={selectedDate}
                  sessions={selectedSessions}
                  user={user}
                  loading={ssLoading}
                  onAdd={() => openAdd(selectedDate)}
                  onEdit={openEdit}
                  onOpenFull={(id) => router.push(`/session/${id}`)}
                />
              )}
            </>
          ) : (
            <>
              {/* Week navigation */}
              <XStack paddingHorizontal="$4" justifyContent="space-between" alignItems="center" marginBottom="$3">
                <Button chromeless onPress={goPrevWeek} icon={<ChevronLeft size={20} color={C.sub} />} data-testid="calendar-prev-week-btn" />
                <H4 color={C.text} fontFamily={FONT.heading} fontSize={18} letterSpacing={0.5} data-testid="calendar-week-label">
                  {weekDays[0].getDate()} {MONTH_NAMES[weekDays[0].getMonth()].slice(0, 3)} – {weekDays[6].getDate()} {MONTH_NAMES[weekDays[6].getMonth()].slice(0, 3)}
                </H4>
                <Button chromeless onPress={goNextWeek} icon={<ChevronRight size={20} color={C.sub} />} data-testid="calendar-next-week-btn" />
              </XStack>

              {/* Week day rows */}
              <YStack paddingHorizontal="$4" gap="$2">
                {weekDays.map((day, i) => {
                  const dayKey = formatDateKey(day);
                  const daySessions = sessionMap[dayKey] || [];
                  const isToday = sameDay(day, today);
                  return (
                    <Card
                      key={dayKey}
                      bordered
                      padding="$3"
                      borderRadius="$4"
                      backgroundColor={C.surface}
                      borderColor={isToday ? C.volt : C.border}
                      borderWidth={isToday ? 2 : 1}
                      data-testid={`calendar-week-day-${dayKey}`}
                    >
                      <XStack justifyContent="space-between" alignItems="center" marginBottom={daySessions.length ? '$2' : 0}>
                        <XStack alignItems="center" gap="$2">
                          <YStack alignItems="center" width={42}>
                            <Paragraph size="$1" color={isToday ? C.volt : C.sub} fontWeight="700">{DAY_NAMES[i]}</Paragraph>
                            <Paragraph size="$5" color={isToday ? C.volt : C.text} fontWeight="800">{day.getDate()}</Paragraph>
                          </YStack>
                          {daySessions.length === 0 && (
                            <Paragraph size="$2" color={C.sub}>Sin entrenos</Paragraph>
                          )}
                        </XStack>
                        {user && (
                          <Button
                            size="$2"
                            backgroundColor={C.volt} color="#000000" fontWeight="800" borderRadius={999}
                            onPress={() => openAdd(day)}
                            icon={<Plus size={14} />}
                            data-testid={`calendar-week-add-${dayKey}`}
                          >
                            Añadir
                          </Button>
                        )}
                      </XStack>
                      <YStack gap="$2">
                        {daySessions.map((s) => (
                          <SessionRow key={s.id} session={s} onEdit={() => openEdit(s)} onOpenFull={() => router.push(`/session/${s.id}`)} />
                        ))}
                      </YStack>
                    </Card>
                  );
                })}
              </YStack>
            </>
          )}

          {/* Legend */}
          <YStack padding="$4" marginTop="$2">
            <Card bordered padding="$3" borderRadius="$4" backgroundColor={C.surface}>
              <XStack gap="$4" justifyContent="center">
                <XStack gap="$1" alignItems="center">
                  <YStack width={10} height={10} borderRadius={5} backgroundColor={C.volt} />
                  <Paragraph size="$1" color={C.sub}>Entreno</Paragraph>
                </XStack>
                <XStack gap="$1" alignItems="center">
                  <YStack width={10} height={10} borderRadius={5} backgroundColor="transparent" borderWidth={2} borderColor={C.volt} />
                  <Paragraph size="$1" color={C.sub}>Hoy</Paragraph>
                </XStack>
              </XStack>
            </Card>
          </YStack>
        </ScrollView>

        {/* Add / Edit modal */}
        <BlinkDialog
          open={modalOpen}
          onOpenChange={setModalOpen}
          title={editingId ? 'Editar entreno' : 'Nuevo entreno'}
          description={targetDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        >
          <YStack gap="$3" paddingTop="$2">
            <YStack gap="$1">
              <Paragraph size="$2" color={C.sub} fontWeight="600">Nombre</Paragraph>
              <Input
                placeholder="Ej. Pecho y tríceps"
                value={formName}
                onChangeText={setFormName}
                size="$4"
                data-testid="calendar-form-name-input"
              />
            </YStack>
            <YStack gap="$1">
              <Paragraph size="$2" color={C.sub} fontWeight="600">Duración (min)</Paragraph>
              <Input
                placeholder="Ej. 60"
                value={formDuration}
                onChangeText={setFormDuration}
                keyboardType="number-pad"
                size="$4"
                data-testid="calendar-form-duration-input"
              />
            </YStack>
            <YStack gap="$1">
              <Paragraph size="$2" color={C.sub} fontWeight="600">Notas</Paragraph>
              <TextArea
                placeholder="Cómo te fue, sensaciones, pesos..."
                value={formNotes}
                onChangeText={setFormNotes}
                minHeight={90}
                data-testid="calendar-form-notes-input"
              />
            </YStack>

            <YStack gap="$1">
              <Paragraph size="$2" color={C.sub} fontWeight="600">Fecha</Paragraph>
              <DatePicker
                value={formDateObj}
                onDateChange={setFormDateObj}
                startDay={1}
                placeholder="Selecciona la fecha"
              />
            </YStack>

            <YStack gap="$2">
              <Paragraph size="$2" color={C.sub} fontWeight="600">Tipo de entreno</Paragraph>
              <XStack gap="$2" flexWrap="wrap">
                {WORKOUT_TYPES.map((t) => {
                  const active = formType === t.id;
                  return (
                    <Card
                      key={t.id}
                      paddingHorizontal="$3"
                      paddingVertical="$2"
                      borderRadius={999}
                      backgroundColor={active ? t.color : C.elevated}
                      borderColor={active ? t.color : C.border}
                      borderWidth={1}
                      onPress={() => setFormType(t.id)}
                      pressStyle={{ scale: 0.96 }}
                      data-testid={`calendar-form-type-${t.id}`}
                    >
                      <XStack alignItems="center" gap="$2">
                        {!active && <YStack width={8} height={8} borderRadius={4} backgroundColor={t.color} />}
                        <Paragraph size="$2" fontWeight="700" color={active ? '#000000' : C.text}>{t.label}</Paragraph>
                      </XStack>
                    </Card>
                  );
                })}
              </XStack>
            </YStack>

            <XStack gap="$2" marginTop="$2">
              {editingId && (
                <Button
                  theme="red"
                  backgroundColor={C.danger}
                  color="white"
                  onPress={handleDelete}
                  disabled={saving}
                  icon={<Trash2 size={16} color="white" />}
                  data-testid="calendar-form-delete-btn"
                >
                  Eliminar
                </Button>
              )}
              <Button
                flex={1}
                backgroundColor={C.volt} color="#000000" fontWeight="800" borderRadius={999}
                onPress={handleSave}
                disabled={saving}
                icon={saving ? <Spinner size="small" /> : <Save size={16} />}
                data-testid="calendar-form-save-btn"
              >
                {editingId ? 'Guardar cambios' : 'Guardar entreno'}
              </Button>
            </XStack>
          </YStack>
        </BlinkDialog>
      </YStack>
    </Theme>
  );
}

// ── Period summary stat ──
function CalStat({ value, label }: { value: string; label: string }) {
  return (
    <Card flex={1} padding="$3" borderRadius={12} backgroundColor={C.surface} borderColor={C.border} borderWidth={1} alignItems="center" gap="$1">
      <Paragraph fontSize={24} fontFamily={FONT.display} color={C.volt} letterSpacing={0.5}>{value}</Paragraph>
      <Paragraph fontSize={9} color={C.muted} fontFamily={FONT.bodyBold} letterSpacing={0.5}>{label}</Paragraph>
    </Card>
  );
}

// ── Type filter chip ──
function FilterChip({ label, active, color, onPress, testid }: { label: string; active: boolean; color: string; onPress: () => void; testid: string }) {
  return (
    <Card
      paddingHorizontal="$3"
      paddingVertical="$2"
      borderRadius={999}
      backgroundColor={active ? color : C.surface}
      borderColor={active ? color : C.border}
      borderWidth={1}
      onPress={onPress}
      pressStyle={{ scale: 0.96 }}
      data-testid={testid}
    >
      <XStack alignItems="center" gap="$2">
        {!active && <YStack width={8} height={8} borderRadius={4} backgroundColor={color} />}
        <Paragraph size="$2" fontWeight="700" color={active ? '#000000' : C.sub}>{label}</Paragraph>
      </XStack>
    </Card>
  );
}

// ── Selected day details (month view) ──
function DayDetails({
  date, sessions, user, loading, onAdd, onEdit, onOpenFull,
}: {
  date: Date;
  sessions: Session[];
  user: { id: string } | null;
  loading: boolean;
  onAdd: () => void;
  onEdit: (s: Session) => void;
  onOpenFull: (id: string) => void;
}) {
  return (
    <YStack padding="$4" marginTop="$3" gap="$3">
      <XStack justifyContent="space-between" alignItems="center">
        <H4 color={C.text} flex={1}>
          {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </H4>
        {user && (
          <Button backgroundColor={C.volt} color="#000000" fontWeight="800" borderRadius={999} size="$3" onPress={onAdd} icon={<Plus size={14} />} data-testid="calendar-day-add-btn">
            Añadir
          </Button>
        )}
      </XStack>

      {!user ? (
        <Card bordered padding="$4" borderRadius="$4" backgroundColor={C.surface}>
          <Paragraph color={C.sub} textAlign="center">Inicia sesión para registrar entrenamientos</Paragraph>
        </Card>
      ) : loading ? (
        <YStack padding="$4" alignItems="center"><Spinner size="small" color={C.volt} /></YStack>
      ) : sessions.length === 0 ? (
        <Card bordered padding="$4" borderRadius="$4" backgroundColor={C.surface} alignItems="center" gap="$2">
          <CalIcon size={32} color={C.muted} />
          <Paragraph color={C.sub}>Sin entrenamientos este día</Paragraph>
          <Button backgroundColor={C.volt} color="#000000" fontWeight="800" borderRadius={999} size="$3" onPress={onAdd} icon={<Plus size={14} />}>Registrar Entreno</Button>
        </Card>
      ) : (
        <YStack gap="$2">
          {sessions.map((s) => (
            <SessionRow key={s.id} session={s} onEdit={() => onEdit(s)} onOpenFull={() => onOpenFull(s.id)} />
          ))}
        </YStack>
      )}
    </YStack>
  );
}

// ── Single workout row ──
function SessionRow({
  session, onEdit, onOpenFull,
}: {
  session: Session;
  onEdit: () => void;
  onOpenFull: () => void;
}) {
  const time = new Date(session.startedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const typeId = unpackType(session.notes);
  const cleanNotes = stripTypeMarker(session.notes);
  return (
    <Card bordered padding="$3" borderRadius="$4" backgroundColor={C.elevated} data-testid={`calendar-session-${session.id}`}>
      <XStack justifyContent="space-between" alignItems="flex-start" gap="$2">
        <YStack flex={1} gap="$1">
          <XStack alignItems="center" gap="$2" flexWrap="wrap">
            <Paragraph fontWeight="700" color={C.text}>{session.name}</Paragraph>
            <XStack alignItems="center" gap="$1" paddingHorizontal="$2" paddingVertical={2} borderRadius={999} backgroundColor={C.surface} borderColor={getTypeColor(typeId)} borderWidth={1}>
              <YStack width={6} height={6} borderRadius={3} backgroundColor={getTypeColor(typeId)} />
              <Paragraph size="$1" color={getTypeColor(typeId)} fontWeight="700">{getTypeLabel(typeId)}</Paragraph>
            </XStack>
          </XStack>
          <XStack gap="$3" alignItems="center" flexWrap="wrap">
            <XStack gap="$1" alignItems="center">
              <Clock size={12} color={C.sub} />
              <Paragraph size="$1" color={C.sub}>
                {time}{session.durationMinutes ? ` · ${session.durationMinutes} min` : ''}
              </Paragraph>
            </XStack>
            {session.totalVolume > 0 && (
              <XStack gap="$1" alignItems="center">
                <Dumbbell size={12} color={C.volt} />
                <Paragraph size="$1" color={C.volt} fontWeight="600">{session.totalVolume.toLocaleString()} kg</Paragraph>
              </XStack>
            )}
          </XStack>
          {cleanNotes ? (
            <Paragraph size="$2" color={C.sub} marginTop="$1">{cleanNotes}</Paragraph>
          ) : null}
        </YStack>
        <YStack gap="$1">
          <Button size="$2" chromeless onPress={onEdit} data-testid={`calendar-edit-${session.id}`}>
            <Paragraph size="$2" color={C.volt} fontWeight="700">Editar</Paragraph>
          </Button>
          {session.totalVolume > 0 && (
            <Button size="$2" chromeless onPress={onOpenFull}>
              <Paragraph size="$1" color={C.sub}>Ver</Paragraph>
            </Button>
          )}
        </YStack>
      </XStack>
    </Card>
  );
}
