import { useState, useCallback } from 'react';
import { ScrollView, Alert } from 'react-native';
import {
  YStack, XStack, H2, H3, H4, Paragraph, Button, Card,
  Input, Theme, Spinner, BlinkDialog, toast,
} from '@blinkdotnew/mobile-ui';
import { ChevronRight, Dumbbell, User, Zap, Flame, Target, Plus, Edit3, Trash2 } from '@blinkdotnew/mobile-ui';
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

const MUSCLE_GROUPS = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core'];
const PRESET_ICONS: Record<string, string> = { dumbbell: 'dumbbell', zap: 'zap', flame: 'flame', target: 'target', star: 'star' };
const PRESET_COLORS = ['#22C55E', '#F97316', '#EF4444', '#3B82F6', '#A855F7', '#EAB308'];

const BUILTIN_PRESETS: Record<string, {
  label: string; icon: any; color: string; bg: string; desc: string; time: string;
  exercises: { id: string; name: string; sets: number; reps: number; muscle: string }[];
}> = {
  facil: {
    label: 'Fácil', icon: Zap, color: '$green9', bg: '$green3', desc: 'Ideal si empiezas', time: '~30 min',
    exercises: [
      { id: 'ex_bench_press', name: 'Press Banca', sets: 3, reps: 10, muscle: 'Pecho' },
      { id: 'ex_lat_pulldown', name: 'Jalon al Pecho', sets: 3, reps: 10, muscle: 'Espalda' },
      { id: 'ex_squat', name: 'Sentadilla', sets: 3, reps: 12, muscle: 'Piernas' },
      { id: 'ex_ohp', name: 'Press Militar', sets: 3, reps: 10, muscle: 'Hombros' },
      { id: 'ex_plank', name: 'Plancha Abdominal', sets: 3, reps: 30, muscle: 'Core' },
    ],
  },
  medio: {
    label: 'Medio', icon: Flame, color: '$orange9', bg: '$orange3', desc: 'Rutina equilibrada', time: '~45 min',
    exercises: [
      { id: 'ex_bench_press', name: 'Press Banca', sets: 4, reps: 8, muscle: 'Pecho' },
      { id: 'ex_pullups', name: 'Dominadas', sets: 4, reps: 8, muscle: 'Espalda' },
      { id: 'ex_squat', name: 'Sentadilla', sets: 4, reps: 8, muscle: 'Piernas' },
      { id: 'ex_barbell_row', name: 'Remo con Barra', sets: 4, reps: 10, muscle: 'Espalda' },
      { id: 'ex_ohp', name: 'Press Militar', sets: 4, reps: 8, muscle: 'Hombros' },
      { id: 'ex_barbell_curl', name: 'Curl de Biceps', sets: 3, reps: 12, muscle: 'Brazos' },
      { id: 'ex_french_press', name: 'Press Frances', sets: 3, reps: 12, muscle: 'Brazos' },
    ],
  },
  dificil: {
    label: 'Difícil', icon: Target, color: '$red9', bg: '$red3', desc: 'Alta intensidad', time: '~60 min',
    exercises: [
      { id: 'ex_deadlift', name: 'Peso Muerto', sets: 5, reps: 5, muscle: 'Espalda' },
      { id: 'ex_bench_press', name: 'Press Banca', sets: 5, reps: 5, muscle: 'Pecho' },
      { id: 'ex_squat', name: 'Sentadilla', sets: 5, reps: 5, muscle: 'Piernas' },
      { id: 'ex_pullups', name: 'Dominadas', sets: 4, reps: 8, muscle: 'Espalda' },
      { id: 'ex_ohp', name: 'Press Militar', sets: 4, reps: 8, muscle: 'Hombros' },
      { id: 'ex_barbell_row', name: 'Remo con Barra', sets: 4, reps: 8, muscle: 'Espalda' },
      { id: 'ex_barbell_curl', name: 'Curl de Biceps', sets: 3, reps: 10, muscle: 'Brazos' },
      { id: 'ex_lateral_raise', name: 'Elevaciones Laterales', sets: 3, reps: 15, muscle: 'Hombros' },
    ],
  },
};

const ICON_MAP: Record<string, any> = { Zap, Flame, Target, Dumbbell };

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

  const handleBuiltInPreset = useCallback((level: string) => {
    router.push(`/session/new?quickStart=${level}`);
  }, []);

  const handleUserPreset = useCallback((presetId: string) => {
    router.push(`/session/new?presetId=${presetId}`);
  }, []);

  const handleCreateExercise = async () => {
    if (!user || !newExName.trim()) return;
    setCreatingEx(true);
    try {
      await createCustomExercise.mutateAsync({
        userId: user.id,
        name: newExName.trim(),
        muscleGroup: newExGroup,
      });
      toast('Ejercicio creado', { variant: 'success' });
      setNewExName('');
      setShowExerciseCreator(false);
    } catch (e: any) {
      toast('Error', { message: e?.message, variant: 'error' });
    } finally {
      setCreatingEx(false);
    }
  };

  const handleCreatePreset = async () => {
    if (!user || !newPresetName.trim()) return;
    if (presetExercises.length === 0) {
      Alert.alert('Sin ejercicios', 'Añade al menos un ejercicio.');
      return;
    }
    setCreatingPreset(true);
    try {
      await createPreset.mutateAsync({
        userId: user.id,
        name: newPresetName.trim(),
        level: 'custom',
        color: newPresetColor,
        exercises: presetExercises,
      });
      toast('Preset creado', { variant: 'success' });
      setNewPresetName('');
      setPresetExercises([]);
      setShowPresetCreator(false);
    } catch (e: any) {
      toast('Error', { message: e?.message, variant: 'error' });
    } finally {
      setCreatingPreset(false);
    }
  };

  const addExToPreset = (ex: { id: string; name: string; muscleGroup: string }) => {
    if (presetExercises.some((pe) => pe.exerciseId === ex.id)) return;
    setPresetExercises((prev) => [
      ...prev,
      { exerciseId: ex.id, exerciseName: ex.name, muscleGroup: ex.muscleGroup, defaultSets: 3, defaultReps: 10 },
    ]);
    setShowExPicker(false);
  };

  const removeExFromPreset = (index: number) => {
    setPresetExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePresetEx = (index: number, field: 'defaultSets' | 'defaultReps', value: number) => {
    setPresetExercises((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: Math.max(1, Math.min(value, 99)) } : e))
    );
  };

  const handleDeletePreset = (presetId: string, name: string) => {
    Alert.alert('Eliminar preset', `¿Seguro que quieres eliminar "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deletePreset.mutate(presetId) },
    ]);
  };

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
              {user ? 'Bienvenido de vuelta' : 'Tu diario de entrenamiento'}
            </Paragraph>
          </YStack>

          {/* Built-in Quick Presets */}
          <YStack paddingHorizontal="$4" gap="$3" marginTop="$2">
            <H3 color="$color11">Entreno Rapido</H3>
            <XStack gap="$3">
              {Object.entries(BUILTIN_PRESETS).map(([key, preset]) => {
                const Icon = preset.icon;
                return (
                  <Card
                    key={key}
                    bordered
                    padding="$4"
                    flex={1}
                    borderRadius="$4"
                    backgroundColor={preset.bg}
                    onPress={() => handleBuiltInPreset(key)}
                  >
                    <YStack alignItems="center" gap="$2">
                      <Icon size={28} color={preset.color} />
                      <H4 color="$color12" fontWeight="700">{preset.label}</H4>
                      <Paragraph size="$1" color="$color10" textAlign="center">{preset.desc}</Paragraph>
                      <Paragraph size="$1" color={preset.color} fontWeight="600">{preset.exercises.length} ejercicios</Paragraph>
                      <Paragraph size="$1" color="$color10">{preset.time}</Paragraph>
                    </YStack>
                  </Card>
                );
              })}
            </XStack>
          </YStack>

          {/* User Presets */}
          {userPresets && userPresets.length > 0 && (
            <YStack paddingHorizontal="$4" gap="$3" marginTop="$4">
              <H3 color="$color11">Mis Presets</H3>
              <XStack gap="$3" flexWrap="wrap">
                {userPresets.map((preset) => (
                  <Card
                    key={preset.id}
                    bordered
                    padding="$4"
                    borderRadius="$4"
                    backgroundColor="$color2"
                    minWidth={140}
                    flex={1}
                    onPress={() => handleUserPreset(preset.id)}
                  >
                    <YStack alignItems="center" gap="$2">
                      <Dumbbell size={24} color={preset.color || '#F97316'} />
                      <H4 color="$color12" fontWeight="700" textAlign="center">{preset.name}</H4>
                      <Paragraph size="$1" color="$color10">{preset.level}</Paragraph>
                    </YStack>
                    <XStack justifyContent="flex-end" marginTop="$2">
                      <Button chromeless size="$2" onPress={() => handleDeletePreset(preset.id, preset.name)}>
                        <Trash2 size={14} color="$red9" />
                      </Button>
                    </XStack>
                  </Card>
                ))}
              </XStack>
            </YStack>
          )}

          {/* User action buttons */}
          {user && (
            <YStack paddingHorizontal="$4" gap="$2" marginTop="$3">
              <XStack gap="$2">
                <Button
                  variant="outline"
                  flex={1}
                  size="$3"
                  onPress={() => {
                    setNewPresetName('');
                    setPresetExercises([]);
                    setNewPresetColor(PRESET_COLORS[0]);
                    setShowPresetCreator(true);
                  }}
                  icon={<Plus size={16} />}
                >
                  Nuevo Preset
                </Button>
                <Button
                  variant="outline"
                  flex={1}
                  size="$3"
                  onPress={() => { setNewExName(''); setNewExGroup('Pecho'); setShowExerciseCreator(true); }}
                  icon={<Edit3 size={16} />}
                >
                  Nuevo Ejercicio
                </Button>
              </XStack>
            </YStack>
          )}

          {/* Templates section */}
          {!tlLoading && templates && templates.length > 0 && (
            <YStack paddingHorizontal="$4" gap="$2" marginTop="$4">
              <Paragraph color="$color11" fontWeight="600">O usa una plantilla guardada</Paragraph>
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
                      <Paragraph size="$2" color="$color10">{tpl.description || 'Sin descripcion'}</Paragraph>
                    </Card>
                  ))}
                </XStack>
              </ScrollView>
            </YStack>
          )}

          {selectedTemplate && (
            <YStack paddingHorizontal="$4" marginTop="$3">
              <Button variant="outline" theme="green" size="$4" width="100%" onPress={handleStartFromTemplate} icon={<Play size={18} />}>
                Empezar con Plantilla
              </Button>
            </YStack>
          )}

          {/* Recent Session */}
          {!ssLoading && latestSession && (
            <YStack padding="$4" marginTop="$4">
              <H3 color="$color12" marginBottom="$2">Ultimo Entreno</H3>
              <Card bordered padding="$4" borderRadius="$4" backgroundColor="$color2">
                <XStack justifyContent="space-between" alignItems="center">
                  <YStack>
                    <Paragraph fontWeight="700" color="$color12">{latestSession.name}</Paragraph>
                    <Paragraph size="$2" color="$color10">
                      {new Date(latestSession.startedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </Paragraph>
                    <Paragraph size="$2" color="$color9">{latestSession.totalVolume.toLocaleString()} kg vol.</Paragraph>
                  </YStack>
                  <Card bordered padding="$2" borderRadius="$4" backgroundColor="$color3" onPress={() => router.push(`/session/${latestSession.id}`)}>
                    <ChevronRight size={20} color="$color9" />
                  </Card>
                </XStack>
              </Card>
            </YStack>
          )}

          {/* Auth */}
          {!user && (
            <YStack padding="$4" marginTop="$4" alignItems="center" gap="$3">
              <Paragraph color="$color10" textAlign="center">Inicia sesion para crear ejercicios y presets personalizados</Paragraph>
              <Button theme="active" width="100%" onPress={() => router.push('/(tabs)/profile')} icon={<User size={18} />}>
                Iniciar Sesion
              </Button>
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
                <Card
                  key={g}
                  bordered
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius="$4"
                  backgroundColor={newExGroup === g ? '$color9' : '$color3'}
                  onPress={() => setNewExGroup(g)}
                >
                  <Paragraph size="$2" fontWeight="600" color={newExGroup === g ? 'white' : '$color11'}>{g}</Paragraph>
                </Card>
              ))}
            </XStack>
            <Button theme="active" width="100%" onPress={handleCreateExercise} disabled={creatingEx || !newExName.trim()}>
              {creatingEx ? 'Creando...' : 'Crear Ejercicio'}
            </Button>
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
                  <Card
                    key={c}
                    bordered
                    width={36}
                    height={36}
                    borderRadius="$4"
                    backgroundColor={c}
                    onPress={() => setNewPresetColor(c)}
                    borderWidth={newPresetColor === c ? 3 : 1}
                    borderColor={newPresetColor === c ? 'white' : 'transparent'}
                  />
                ))}
              </XStack>

              {presetExercises.map((pe, idx) => (
                <Card key={`${pe.exerciseId}-${idx}`} bordered padding="$3" borderRadius="$3" backgroundColor="$color3">
                  <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
                    <YStack flex={1}>
                      <Paragraph fontWeight="600" color="$color12">{pe.exerciseName}</Paragraph>
                      <Paragraph size="$2" color="$color10">{pe.muscleGroup}</Paragraph>
                    </YStack>
                    <Button chromeless onPress={() => removeExFromPreset(idx)} icon={<Trash2 size={14} color="$red9" />} />
                  </XStack>
                  <XStack gap="$2">
                    <YStack flex={1}>
                      <Paragraph size="$1" color="$color10" marginBottom="$1">Series</Paragraph>
                      <Input size="$3" keyboardType="number-pad" value={String(pe.defaultSets)} onChangeText={(v) => updatePresetEx(idx, 'defaultSets', parseInt(v) || 1)} />
                    </YStack>
                    <YStack flex={1}>
                      <Paragraph size="$1" color="$color10" marginBottom="$1">Reps</Paragraph>
                      <Input size="$3" keyboardType="number-pad" value={String(pe.defaultReps)} onChangeText={(v) => updatePresetEx(idx, 'defaultReps', parseInt(v) || 1)} />
                    </YStack>
                  </XStack>
                </Card>
              ))}

              <Button variant="outline" width="100%" onPress={() => setShowExPicker(true)} icon={<Plus size={16} />}>Añadir Ejercicio</Button>

              {showExPicker && (
                <YStack gap="$2">
                  <Paragraph color="$color11" fontWeight="600">Selecciona ejercicios:</Paragraph>
                  <ScrollView style={{ maxHeight: 250 }}>
                    <YStack gap="$1">
                      {(allExercises || []).map((ex: any) => (
                        <Card
                          key={ex.id}
                          bordered
                          padding="$3"
                          borderRadius="$3"
                          onPress={() => addExToPreset(ex)}
                          opacity={presetExercises.some((pe) => pe.exerciseId === ex.id) ? 0.4 : 1}
                        >
                          <XStack justifyContent="space-between" alignItems="center">
                            <YStack>
                              <Paragraph fontWeight="600" color="$color12">{ex.name}</Paragraph>
                              <Paragraph size="$2" color="$color10">{ex.muscleGroup}</Paragraph>
                            </YStack>
                            {presetExercises.some((pe) => pe.exerciseId === ex.id) && (
                              <Paragraph size="$2" color="$green9">Añadido</Paragraph>
                            )}
                          </XStack>
                        </Card>
                      ))}
                    </YStack>
                  </ScrollView>
                </YStack>
              )}

              {presetExercises.length > 0 && (
                <Button theme="active" width="100%" onPress={handleCreatePreset} disabled={creatingPreset}>
                  {creatingPreset ? 'Creando...' : 'Crear Preset'}
                </Button>
              )}
            </YStack>
          </ScrollView>
        </BlinkDialog>
      </YStack>
    </Theme>
  );
}
