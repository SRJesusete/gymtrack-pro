import React, { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import {
  YStack, XStack, H2, H3, H4, Paragraph, Button, Card,
  Theme, Spinner, Input, TextArea, BlinkDialog, toast,
} from '@blinkdotnew/mobile-ui';
import { Calendar as CalIcon, ChevronLeft, ChevronRight, Plus, Clock, Trash2, Save, Dumbbell } from '@blinkdotnew/mobile-ui';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useSessions, useQuickLogSession, useUpdateSession, useDeleteSession } from '@/hooks/useDatabase';
import type { Session } from '@/types';
import { C } from '@/constants/theme';

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

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [targetDate, setTargetDate] = useState<Date>(new Date());
  const [formName, setFormName] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const today = new Date();

  const sessionMap = useMemo(() => {
    const map: Record<string, Session[]> = {};
    if (!sessions) return map;
    for (const s of sessions) {
      const key = formatDateKey(new Date(s.startedAt));
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    return map;
  }, [sessions]);

  const monthDays = useMemo(() => getMonthDays(viewYear, viewMonth), [viewYear, viewMonth]);
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

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
    setModalOpen(true);
  };
  const openEdit = (s: Session) => {
    setEditingId(s.id);
    setTargetDate(new Date(s.startedAt));
    setFormName(s.name);
    setFormDuration(s.durationMinutes ? String(s.durationMinutes) : '');
    setFormNotes(s.notes || '');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!formName.trim()) {
      toast('Nombre requerido', { message: 'Ponle un nombre al entreno', variant: 'error' });
      return;
    }
    setSaving(true);
    try {
      const duration = parseInt(formDuration) || 0;
      if (editingId) {
        await updateSession.mutateAsync({
          id: editingId,
          name: formName.trim(),
          durationMinutes: duration,
          notes: formNotes.trim(),
        });
        toast('Entreno actualizado', { variant: 'success' });
      } else {
        const startedAt = new Date(
          `${formatDateKey(targetDate)}T${new Date().toTimeString().slice(0, 8)}`
        ).toISOString();
        await quickLog.mutateAsync({
          userId: user.id,
          name: formName.trim(),
          startedAt,
          durationMinutes: duration,
          notes: formNotes.trim(),
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
            <H2 color={C.text} fontWeight="800">Calendario</H2>
            <Paragraph color={C.sub}>
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

          {viewMode === 'month' ? (
            <>
              {/* Month navigation */}
              <XStack paddingHorizontal="$4" justifyContent="space-between" alignItems="center" marginBottom="$3">
                <Button chromeless onPress={goPrevMonth} icon={<ChevronLeft size={20} color={C.sub} />} data-testid="calendar-prev-month-btn" />
                <H3 color={C.text} fontWeight="700" data-testid="calendar-month-label">
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
                                    <YStack key={s.id} width={6} height={6} borderRadius={3} backgroundColor={C.volt} />
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
                <H4 color={C.text} fontWeight="700" data-testid="calendar-week-label">
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
  return (
    <Card bordered padding="$3" borderRadius="$4" backgroundColor={C.elevated} data-testid={`calendar-session-${session.id}`}>
      <XStack justifyContent="space-between" alignItems="flex-start" gap="$2">
        <YStack flex={1} gap="$1">
          <Paragraph fontWeight="700" color={C.text}>{session.name}</Paragraph>
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
          {session.notes ? (
            <Paragraph size="$2" color={C.sub} marginTop="$1">{session.notes}</Paragraph>
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
