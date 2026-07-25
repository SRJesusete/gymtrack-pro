import { useState, useCallback } from 'react';
import { ScrollView, Alert } from 'react-native';
import {
  YStack, XStack, H2, H3, H4, Paragraph, Button, Card,
  Input, Theme, Spinner, BlinkDialog, toast,
} from '@blinkdotnew/mobile-ui';
import { ChevronRight, Dumbbell, User, Zap, Flame, Target, Plus, Edit3, Trash2, TrendingUp, Clock, BarChart3, Sprout, Trophy, Gauge, ChevronDown } from '@blinkdotnew/mobile-ui';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import {
  useSessions,
  useAllExercises,
  useCreateUserExercise,
  useUserPresets,
  useCreateUserPreset,
  useDeleteUserPreset,
} from '@/hooks/useDatabase';
import { CATEGORIES, type CategoryDef, type LevelDef } from '@/constants/workoutPresets';

// ── Icon map (string → component) ──
const ICON_MAP: Record<string, any> = { TrendingUp, BarChart3, Dumbbell, Flame, Target, Zap };

// ── Level badge colors + icons ──
const LEVEL_STYLES: Record<string, { bg: string; text: string; border: string; tint: string; icon: any }> = {
  'Facil':    { bg: '#22C55E18', text: '#22C55E', border: '#22C55E', tint: '#22C55E0A', icon: Sprout },
  'Medio':   { bg: '#F9731618', text: '#F97316', border: '#F97316', tint: '#F973160A', icon: Gauge },
  'Dificil': { bg: '#EF444418', text: '#EF4444', border: '#EF4444', tint: '#EF44440A', icon: Trophy },
};

// ── Other constants ──
const MUSCLE_GROUPS = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core'];
const PRESET_COLORS = ['#22C55E', '#F97316', '#EF4444', '#3B82F6', '#A855F7', '#EAB308'];

interface PresetExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  defaultSets: number;
  defaultReps: number;
}

export default function WorkoutHome() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: sessions, isLoading: ssLoading } = useSessions(user?.id || null);
  const { data: allExercises } = useAllExercises(user?.id || null);
  const { data: userPresets } = useUserPresets(user?.id || null);
  const createCustomExercise = useCreateUserExercise();
  const createPreset = useCreateUserPreset();
  const deletePreset = useDeleteUserPreset();

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Custom exercise modal
  const [showExerciseCreator, setShowExerciseCreator] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExGroup, setNewExGroup] = useState('Pecho');
  const [creatingEx, setCreatingEx] = useState(false);

  // Custom preset modal
  const [showPresetCreator, setShowPresetCreator] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetColor, setNewPresetColor] = useState(PRESET_COLORS[0]);
  const [presetExercises, setPresetExercises] = useState<PresetExercise[]>([]);
  const [showExPicker, setShowExPicker] = useState(false);
  const [creatingPreset, setCreatingPreset] = useState(false);

  const latestSession = sessions?.[0];

  const handleStartWorkout = useCallback((presetId: string) => {
    router.push(`/session/new?quickStart=${presetId}`);
  }, []);

  const handleUserPreset = useCallback((presetId: string) => {
    router.push(`/session/new?presetId=${presetId}`);
  }, []);

  const handleCreateExercise = async () => {
    if (!user || !newExName.trim()) return;
    setCreatingEx(true);
    try {
      await createCustomExercise.mutateAsync({ userId: user.id, name: newExName.trim(), muscleGroup: newExGroup });
      toast('Ejercicio creado', { variant: 'success' });
      setNewExName('');
      setShowExerciseCreator(false);
    } catch (e: any) {
      toast('Error', { message: e?.message, variant: 'error' });
    } finally { setCreatingEx(false); }
  };

  const handleCreatePreset = async () => {
    if (!user || !newPresetName.trim()) return;
    if (presetExercises.length === 0) { Alert.alert('Sin ejercicios', 'Anade al menos uno.'); return; }
    setCreatingPreset(true);
    try {
      await createPreset.mutateAsync({ userId: user.id, name: newPresetName.trim(), level: 'custom', color: newPresetColor, exercises: presetExercises });
      toast('Preset creado', { variant: 'success' });
      setNewPresetName('');
      setPresetExercises([]);
      setShowPresetCreator(false);
    } catch (e: any) {
      toast('Error', { message: e?.message, variant: 'error' });
    } finally { setCreatingPreset(false); }
  };

  const handleDeletePreset = (presetId: string, name: string) => {
    Alert.alert('Eliminar preset', `Seguro que quieres eliminar "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deletePreset.mutate(presetId) },
    ]);
  };

  const addExToPreset = (ex: { id: string; name: string; muscleGroup: string }) => {
    if (presetExercises.some((pe) => pe.exerciseId === ex.id)) return;
    setPresetExercises((prev) => [...prev, { exerciseId: ex.id, exerciseName: ex.name, muscleGroup: ex.muscleGroup, defaultSets: 3, defaultReps: 10 }]);
    setShowExPicker(false);
  };
  const removeExFromPreset = (i: number) => setPresetExercises((prev) => prev.filter((_, idx) => idx !== i));
  const updatePresetEx = (i: number, field: 'defaultSets' | 'defaultReps', value: number) =>
    setPresetExercises((prev) => prev.map((e, idx) => (idx === i ? { ...e, [field]: Math.max(1, Math.min(value, 99)) } : e)));

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
          <YStack padding="$4" paddingTop="$6" gap="$1">
            <H2 color="$color12" fontWeight="800">GymTrack Pro</H2>
            <Paragraph color="$color10">{user ? 'Que entrenas hoy?' : 'Tu diario de entrenamiento'}</Paragraph>
          </YStack>

          {/* Last Session */}
          {!ssLoading && latestSession && (
            <YStack paddingHorizontal="$4" marginBottom="$4">
              <Card bordered padding="$4" borderRadius="$4" backgroundColor="$color2" onPress={() => router.push(`/session/${latestSession.id}`)}>
                <XStack justifyContent="space-between" alignItems="center">
                  <YStack gap="$1">
                    <Paragraph size="$1" color="$color10" fontWeight="600">ULTIMO ENTRENO</Paragraph>
                    <Paragraph fontWeight="700" color="$color12">{latestSession.name}</Paragraph>
                    <XStack gap="$3">
                      <Paragraph size="$2" color="$color10">
                        {new Date(latestSession.startedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </Paragraph>
                      <Paragraph size="$2" color="$color9" fontWeight="600">{latestSession.totalVolume.toLocaleString()} kg</Paragraph>
                    </XStack>
                  </YStack>
                  <ChevronRight size={20} color="$color9" />
                </XStack>
              </Card>
            </YStack>
          )}

          {/* Categories */}
          <YStack paddingHorizontal="$4" gap="$3">
            <H3 color="$color11">Entreno Rapido</H3>

            {CATEGORIES.map((cat) => {
              const isOpen = expandedCategory === cat.id;
              const Icon = ICON_MAP[cat.icon] || Dumbbell;

              return (
                <YStack key={cat.id} gap="$0">
                  {/* Category Header */}
                  <Card
                    bordered
                    padding="$4"
                    borderRadius="$4"
                    backgroundColor={isOpen ? (cat.color + '16') : '$color2'}
                    onPress={() => setExpandedCategory(isOpen ? null : cat.id)}
                  >
                    <XStack justifyContent="space-between" alignItems="center">
                      <XStack gap="$3" alignItems="center">
                        <YStack width={44} height={44} borderRadius={12} backgroundColor={cat.color + '22'} justifyContent="center" alignItems="center">
                          <Icon size={22} color={cat.color} />
                        </YStack>
                        <YStack gap="$0.5">
                          <H4 color="$color12" fontWeight="700">{cat.title}</H4>
                          <Paragraph size="$2" color="$color10">{cat.desc}</Paragraph>
                        </YStack>
                      </XStack>
                      <XStack gap="$2" alignItems="center">
                        <Paragraph size="$1" color={cat.color} fontWeight="700">{cat.levels.length} niveles</Paragraph>
                        <ChevronRight size={16} color="$color10" style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }} />
                      </XStack>
                    </XStack>
                  </Card>

                  {/* Level Cards */}
                  {isOpen && (
                    <YStack gap="$2" paddingTop="$2" paddingLeft="$3">
                      {cat.levels.map((lvl) => {
                        const style = LEVEL_STYLES[lvl.badge] || LEVEL_STYLES['Medio'];
                        const LevelIcon = style.icon;
                        return (
                          <Card
                            key={lvl.id}
                            bordered
                            padding={0}
                            borderRadius="$4"
                            backgroundColor={style.tint}
                            borderColor={style.border + '30'}
                            borderWidth={1.5}
                            overflow="hidden"
                            onPress={() => handleStartWorkout(lvl.id)}
                          >
                            {/* Level header — colored stripe */}
                            <XStack
                              padding="$3"
                              backgroundColor={style.bg}
                              borderBottomWidth={1}
                              borderBottomColor={style.border + '20'}
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <XStack gap="$2.5" alignItems="center">
                                <YStack
                                  width={32} height={32}
                                  borderRadius={8}
                                  backgroundColor={style.border + '25'}
                                  justifyContent="center" alignItems="center"
                                >
                                  <LevelIcon size={16} color={style.text} />
                                </YStack>
                                <YStack gap="$0">
                                  <Paragraph fontWeight="700" color="$color12" size="$3">{lvl.label}</Paragraph>
                                  <XStack gap="$1.5" alignItems="center">
                                    <YStack width={5} height={5} borderRadius={3} backgroundColor={style.border} />
                                    <Paragraph size="$1" color={style.text} fontWeight="600">{lvl.badge}</Paragraph>
                                  </XStack>
                                </YStack>
                              </XStack>
                              <XStack gap="$2.5" alignItems="center">
                                <XStack gap="$1" alignItems="center" backgroundColor={style.tint} paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2">
                                  <Clock size={11} color={style.text} />
                                  <Paragraph size="$1" color={style.text} fontWeight="600">{lvl.time}</Paragraph>
                                </XStack>
                                <ChevronRight size={15} color={style.text} />
                              </XStack>
                            </XStack>

                            {/* Exercise list body */}
                            <YStack padding="$3" gap="$2">
                              {lvl.exercises.map((ex, i) => (
                                <XStack key={i} justifyContent="space-between" alignItems="center">
                                  <XStack gap="$2.5" alignItems="center" flex={1}>
                                    <YStack
                                      width={7} height={7} borderRadius={3}
                                      backgroundColor={style.border}
                                      opacity={0.7}
                                    />
                                    <Paragraph size="$2" color="$color11" flex={1} fontWeight="500">{ex.name}</Paragraph>
                                  </XStack>
                                  <YStack
                                    paddingHorizontal="$2" paddingVertical="$0.5"
                                    backgroundColor={style.tint}
                                    borderRadius="$2"
                                    borderWidth={0.5}
                                    borderColor={style.border + '25'}
                                    minWidth={52}
                                    alignItems="center"
                                  >
                                    <Paragraph size="$1" color={style.text} fontWeight="700">{ex.sets} x {ex.reps}</Paragraph>
                                  </YStack>
                                </XStack>
                              ))}
                            </YStack>
                          </Card>
                        );
                      })}
                    </YStack>
                  )}
                </YStack>
              );
            })}
          </YStack>

          {/* User Presets */}
          {userPresets && userPresets.length > 0 && (
            <YStack paddingHorizontal="$4" gap="$3" marginTop="$5">
              <H3 color="$color11">Mis Presets</H3>
              <XStack gap="$3" flexWrap="wrap">
                {userPresets.map((preset) => (
                  <Card key={preset.id} bordered padding="$4" borderRadius="$4" backgroundColor="$color2" minWidth={140} flex={1} onPress={() => handleUserPreset(preset.id)}>
                    <YStack alignItems="center" gap="$2">
                      <Dumbbell size={24} color={preset.color || '#F97316'} />
                      <H4 color="$color12" fontWeight="700" textAlign="center">{preset.name}</H4>
                      <Paragraph size="$1" color="$color10">{preset.level}</Paragraph>
                    </YStack>
                    <XStack justifyContent="flex-end" marginTop="$2">
                      <Button chromeless size="$2" onPress={() => handleDeletePreset(preset.id, preset.name)} icon={<Trash2 size={14} color="$red9" />} />
                    </XStack>
                  </Card>
                ))}
              </XStack>
            </YStack>
          )}

          {/* User actions */}
          {user && (
            <YStack paddingHorizontal="$4" gap="$2" marginTop="$3">
              <XStack gap="$2">
                <Button variant="outline" flex={1} size="$3" onPress={() => { setNewPresetName(''); setPresetExercises([]); setNewPresetColor(PRESET_COLORS[0]); setShowPresetCreator(true); }} icon={<Plus size={16} />}>Nuevo Preset</Button>
                <Button variant="outline" flex={1} size="$3" onPress={() => { setNewExName(''); setNewExGroup('Pecho'); setShowExerciseCreator(true); }} icon={<Edit3 size={16} />}>Nuevo Ejercicio</Button>
              </XStack>
            </YStack>
          )}

          {/* Auth CTA */}
          {!user && (
            <YStack padding="$4" marginTop="$5" alignItems="center" gap="$3">
              <Paragraph color="$color10" textAlign="center">Inicia sesion para crear ejercicios y presets personalizados</Paragraph>
              <Button theme="active" width="100%" onPress={() => router.push('/(tabs)/profile')} icon={<User size={18} />}>Iniciar Sesion</Button>
            </YStack>
          )}

        </ScrollView>

        {/* Create Exercise Dialog */}
        <BlinkDialog open={showExerciseCreator} onOpenChange={setShowExerciseCreator} title="Nuevo Ejercicio" description="Crea tu propio ejercicio personalizado">
          <YStack gap="$3" padding="$2">
            <Input placeholder="Nombre del ejercicio" value={newExName} onChangeText={setNewExName} size="$4" />
            <Paragraph color="$color10" size="$2">Grupo muscular</Paragraph>
            <XStack gap="$2" flexWrap="wrap">
              {MUSCLE_GROUPS.map((g) => (
                <Card key={g} bordered paddingHorizontal="$3" paddingVertical="$2" borderRadius="$4" backgroundColor={newExGroup === g ? '$color9' : '$color3'} onPress={() => setNewExGroup(g)}>
                  <Paragraph size="$2" fontWeight="600" color={newExGroup === g ? 'white' : '$color11'}>{g}</Paragraph>
                </Card>
              ))}
            </XStack>
            <Button theme="active" width="100%" onPress={handleCreateExercise} disabled={creatingEx || !newExName.trim()}>{creatingEx ? 'Creando...' : 'Crear Ejercicio'}</Button>
          </YStack>
        </BlinkDialog>

        {/* Create Preset Dialog */}
        <BlinkDialog open={showPresetCreator} onOpenChange={setShowPresetCreator} title="Nuevo Preset" description="Crea tu propio preset de inicio rapido">
          <ScrollView style={{ maxHeight: 500 }}>
            <YStack gap="$3" padding="$2">
              <Input placeholder="Nombre del preset" value={newPresetName} onChangeText={setNewPresetName} size="$4" />
              <Paragraph color="$color10" size="$2">Color</Paragraph>
              <XStack gap="$2">
                {PRESET_COLORS.map((c) => (
                  <Card key={c} bordered width={36} height={36} borderRadius="$4" backgroundColor={c} onPress={() => setNewPresetColor(c)} borderWidth={newPresetColor === c ? 3 : 1} borderColor={newPresetColor === c ? 'white' : 'transparent'} />
                ))}
              </XStack>
              {presetExercises.map((pe, idx) => (
                <Card key={`${pe.exerciseId}-${idx}`} bordered padding="$3" borderRadius="$3" backgroundColor="$color3">
                  <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
                    <YStack flex={1}><Paragraph fontWeight="600" color="$color12">{pe.exerciseName}</Paragraph><Paragraph size="$2" color="$color10">{pe.muscleGroup}</Paragraph></YStack>
                    <Button chromeless onPress={() => removeExFromPreset(idx)} icon={<Trash2 size={14} color="$red9" />} />
                  </XStack>
                  <XStack gap="$2">
                    <YStack flex={1}><Paragraph size="$1" color="$color10" marginBottom="$1">Series</Paragraph><Input size="$3" keyboardType="number-pad" value={String(pe.defaultSets)} onChangeText={(v) => updatePresetEx(idx, 'defaultSets', parseInt(v) || 1)} /></YStack>
                    <YStack flex={1}><Paragraph size="$1" color="$color10" marginBottom="$1">Reps</Paragraph><Input size="$3" keyboardType="number-pad" value={String(pe.defaultReps)} onChangeText={(v) => updatePresetEx(idx, 'defaultReps', parseInt(v) || 1)} /></YStack>
                  </XStack>
                </Card>
              ))}
              <Button variant="outline" width="100%" onPress={() => setShowExPicker(true)} icon={<Plus size={16} />}>Anadir Ejercicio</Button>
              {showExPicker && (
                <YStack gap="$2"><Paragraph color="$color11" fontWeight="600">Selecciona ejercicios:</Paragraph>
                  <ScrollView style={{ maxHeight: 250 }}><YStack gap="$1">
                    {(allExercises || []).map((ex: any) => (
                      <Card key={ex.id} bordered padding="$3" borderRadius="$3" onPress={() => addExToPreset(ex)} opacity={presetExercises.some((pe) => pe.exerciseId === ex.id) ? 0.4 : 1}>
                        <XStack justifyContent="space-between" alignItems="center">
                          <YStack><Paragraph fontWeight="600" color="$color12">{ex.name}</Paragraph><Paragraph size="$2" color="$color10">{ex.muscleGroup}</Paragraph></YStack>
                          {presetExercises.some((pe) => pe.exerciseId === ex.id) && <Paragraph size="$2" color="$green9">Anadido</Paragraph>}
                        </XStack>
                      </Card>
                    ))}
                  </YStack></ScrollView>
                </YStack>
              )}
              {presetExercises.length > 0 && <Button theme="active" width="100%" onPress={handleCreatePreset} disabled={creatingPreset}>{creatingPreset ? 'Creando...' : 'Crear Preset'}</Button>}
            </YStack>
          </ScrollView>
        </BlinkDialog>
      </YStack>
    </Theme>
  );
}
