import { useState, useEffect, useCallback, useMemo } from 'react';
import { ScrollView, Alert, Linking } from 'react-native';
import {
  YStack, XStack, H2, H3, H4, Paragraph, Button, Card,
  Input, Theme, toast, Spinner, BlinkDialog, Circle,
} from '@blinkdotnew/mobile-ui';
import { Dumbbell, Plus, Trash2, Check, ArrowLeft, Save, Flame, Clock, Target, Youtube, Play } from '@blinkdotnew/mobile-ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import {
  useExercises,
  useTemplateWithExercises,
  useCreateSession,
  useLatestRecordByExercise,
  getSuggestedWeight,
} from '@/hooks/useDatabase';
import { getPresetById, type WorkoutPreset } from '@/constants/workoutPresets';
import { C } from '@/constants/theme';

interface SetData {
  weight: string;
  reps: string;
  isWarmup: boolean;
}

interface ExerciseData {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  sets: SetData[];
  videoUrl?: string;
}

export default function NewSessionScreen() {
  const { templateId, presetId, date } = useLocalSearchParams<{ templateId?: string; presetId?: string; date?: string }>();
  const { user } = useAuth();
  const { data: exercises } = useExercises();
  const { data: template } = useTemplateWithExercises(templateId || null);
  const createSession = useCreateSession();
  const [sessionName, setSessionName] = useState('');
  const [exerciseData, setExerciseData] = useState<ExerciseData[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const preset = useMemo(() => (presetId ? getPresetById(presetId) : undefined), [presetId]);

  // Init from preset
  useEffect(() => {
    if (preset && exerciseData.length === 0) {
      setSessionName(preset.name);
      const data: ExerciseData[] = preset.exercises.map((pe) => ({
        exerciseId: pe.exerciseId,
        exerciseName: pe.exerciseName,
        muscleGroup: pe.muscleGroup,
        videoUrl: pe.videoUrl,
        sets: Array.from({ length: pe.defaultSets }, () => ({
          weight: '',
          reps: String(pe.defaultReps),
          isWarmup: false,
        })),
      }));
      setExerciseData(data);
    }
  }, [preset]);

  // Init from template
  useEffect(() => {
    if (!preset && template && exerciseData.length === 0) {
      setSessionName(template.name);
      const data: ExerciseData[] = template.exercises.map((te) => ({
        exerciseId: te.exerciseId,
        exerciseName: te.exerciseName,
        muscleGroup: te.muscleGroup,
        sets: Array.from({ length: te.defaultSets }, () => ({
          weight: '',
          reps: String(te.defaultReps),
          isWarmup: false,
        })),
      }));
      setExerciseData(data);
    }
  }, [template, preset]);

  const addExercise = (ex: { id: string; name: string; muscleGroup: string }) => {
    setExerciseData((prev) => [
      ...prev,
      {
        exerciseId: ex.id,
        exerciseName: ex.name,
        muscleGroup: ex.muscleGroup,
        sets: [{ weight: '', reps: '', isWarmup: false }],
      },
    ]);
    setShowExercisePicker(false);
  };

  const removeExercise = (index: number) => {
    setExerciseData((prev) => prev.filter((_, i) => i !== index));
  };

  const addSet = (exIndex: number) => {
    setExerciseData((prev) =>
      prev.map((ex, i) =>
        i === exIndex
          ? { ...ex, sets: [...ex.sets, { weight: '', reps: '', isWarmup: false }] }
          : ex
      )
    );
  };

  const removeSet = (exIndex: number, setIndex: number) => {
    setExerciseData((prev) =>
      prev.map((ex, i) =>
        i === exIndex
          ? { ...ex, sets: ex.sets.filter((_, j) => j !== setIndex) }
          : ex
      )
    );
  };

  const updateSet = (exIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
    setExerciseData((prev) =>
      prev.map((ex, i) =>
        i === exIndex
          ? {
              ...ex,
              sets: ex.sets.map((s, j) =>
                j === setIndex ? { ...s, [field]: value } : s
              ),
            }
          : ex
      )
    );
  };

  const toggleWarmup = (exIndex: number, setIndex: number) => {
    setExerciseData((prev) =>
      prev.map((ex, i) =>
        i === exIndex
          ? {
              ...ex,
              sets: ex.sets.map((s, j) =>
                j === setIndex ? { ...s, isWarmup: !s.isWarmup } : s
              ),
            }
          : ex
      )
    );
  };

  const calculateTotalVolume = () => {
    return exerciseData.reduce((total, ex) => {
      return total + ex.sets.reduce((exTotal, set) => {
        const w = parseFloat(set.weight) || 0;
        const r = parseInt(set.reps) || 0;
        return exTotal + w * r;
      }, 0);
    }, 0);
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Inicia sesión', 'Necesitas una cuenta para guardar entrenamientos.');
      return;
    }
    if (!sessionName.trim()) {
      Alert.alert('Nombre requerido', 'Ponle nombre a tu entrenamiento.');
      return;
    }
    const hasData = exerciseData.some((ex) =>
      ex.sets.some((s) => s.weight || s.reps)
    );
    if (!hasData) {
      Alert.alert('Sin datos', 'Registra al menos una serie.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        userId: user.id,
        name: sessionName,
        templateId: templateId || undefined,
        startedAt: date
          ? new Date(`${date}T${new Date().toTimeString().slice(0, 8)}`).toISOString()
          : undefined,
        exercises: exerciseData
          .filter((ex) => ex.sets.some((s) => s.weight || s.reps))
          .map((ex) => ({
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            muscleGroup: ex.muscleGroup,
            sets: ex.sets
              .filter((s) => s.weight || s.reps)
              .map((s) => ({
                weight: parseFloat(s.weight) || 0,
                reps: parseInt(s.reps) || 0,
                isWarmup: s.isWarmup,
              })),
          })),
      };

      await createSession.mutateAsync(payload);
      toast('Entreno guardado', { message: `${calculateTotalVolume().toLocaleString()} kg levantados`, variant: 'success' });
      router.back();
    } catch (e: any) {
      toast('Error', { message: e?.message || 'No se pudo guardar', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Theme name="dark">
      <YStack flex={1} backgroundColor={C.bg}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <XStack padding="$4" paddingTop="$6" justifyContent="space-between" alignItems="center">
            <Button chromeless onPress={() => router.back()} icon={<ArrowLeft size={20} />} />
            <H2 color={C.text} fontWeight="800">
              {preset ? preset.name : 'Nuevo Entreno'}
            </H2>
            <Button
              chromeless
              onPress={handleSave}
              disabled={saving}
              icon={saving ? <Spinner size="small" /> : <Save size={20} color={C.volt} />}
            />
          </XStack>

          {/* Preset info banner */}
          {preset && (
            <YStack paddingHorizontal="$4" marginBottom="$3">
              <Card
                bordered
                padding="$3"
                borderRadius="$4"
                backgroundColor={C.surface}
              >
                <XStack alignItems="center" gap="$3">
                  <Circle size={44} backgroundColor={C.elevated}>
                    <Paragraph size="$7">{preset.icon}</Paragraph>
                  </Circle>
                  <YStack flex={1} gap="$1">
                    <Paragraph color={C.sub} size="$2" numberOfLines={2}>
                      {preset.description}
                    </Paragraph>
                    <XStack gap="$4">
                      <XStack alignItems="center" gap="$1">
                        <Clock size={12} color={C.sub} />
                        <Paragraph size="$1" color={C.sub}>
                          ~{preset.estimatedMinutes} min
                        </Paragraph>
                      </XStack>
                      <XStack alignItems="center" gap="$1">
                        <Dumbbell size={12} color={C.sub} />
                        <Paragraph size="$1" color={C.sub}>
                          {preset.exercises.length} ejercicios
                        </Paragraph>
                      </XStack>
                      <XStack alignItems="center" gap="$1">
                        <Target size={12} color={C.sub} />
                        <Paragraph size="$1" color={C.sub}>
                          Nivel: {preset.level}
                        </Paragraph>
                      </XStack>
                    </XStack>
                  </YStack>
                </XStack>
              </Card>
            </YStack>
          )}

          {/* Session Name */}
          <YStack paddingHorizontal="$4" gap="$2">
            <Input
              placeholder="Nombre del entrenamiento"
              value={sessionName}
              onChangeText={setSessionName}
              size="$4"
            />
          </YStack>

          {/* Exercises */}
          {exerciseData.map((ex, exIndex) => (
            <ExerciseCard
              key={`${ex.exerciseId}-${exIndex}`}
              exercise={ex}
              exIndex={exIndex}
              onAddSet={() => addSet(exIndex)}
              onRemoveSet={(i) => removeSet(exIndex, i)}
              onUpdateSet={(i, f, v) => updateSet(exIndex, i, f, v)}
              onToggleWarmup={(i) => toggleWarmup(exIndex, i)}
              onRemoveExercise={() => removeExercise(exIndex)}
              userId={user?.id || null}
            />
          ))}

          {/* Add Exercise */}
          <YStack padding="$4" gap="$3" marginTop="$2">
            <Button
              variant="outline"
              width="100%"
              onPress={() => setShowExercisePicker(true)}
              icon={<Plus size={18} />}
            >
              Añadir Ejercicio
            </Button>
          </YStack>

          {/* Volume Summary */}
          {exerciseData.length > 0 && (
            <YStack padding="$4" backgroundColor={C.surface} margin="$4" borderRadius="$4">
              <XStack justifyContent="space-between">
                <Paragraph color={C.sub} fontWeight="600">Volumen total estimado</Paragraph>
                <Paragraph color={C.volt} fontWeight="800">
                  {calculateTotalVolume().toLocaleString()} kg
                </Paragraph>
              </XStack>
            </YStack>
          )}
        </ScrollView>

        {/* Exercise Picker Modal */}
        <BlinkDialog
          open={showExercisePicker}
          onOpenChange={setShowExercisePicker}
          title="Seleccionar Ejercicio"
          description="Elige un ejercicio para añadir"
        >
          <ScrollView style={{ maxHeight: 400 }}>
            <YStack gap="$2">
              {(exercises || []).map((ex) => (
                <Card
                  key={ex.id}
                  bordered
                  padding="$3"
                  borderRadius="$3"
                  onPress={() => addExercise(ex)}
                >
                  <XStack justifyContent="space-between" alignItems="center">
                    <YStack>
                      <Paragraph fontWeight="600" color={C.text}>{ex.name}</Paragraph>
                      <Paragraph size="$2" color={C.sub}>{ex.muscleGroup}</Paragraph>
                    </YStack>
                    <Plus size={16} color={C.volt} />
                  </XStack>
                </Card>
              ))}
            </YStack>
          </ScrollView>
        </BlinkDialog>
      </YStack>
    </Theme>
  );
}

// -- Exercise Card Subcomponent --

function ExerciseCard({
  exercise,
  exIndex,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onToggleWarmup,
  onRemoveExercise,
  userId,
}: {
  exercise: ExerciseData;
  exIndex: number;
  onAddSet: () => void;
  onRemoveSet: (i: number) => void;
  onUpdateSet: (i: number, field: 'weight' | 'reps', value: string) => void;
  onToggleWarmup: (i: number) => void;
  onRemoveExercise: () => void;
  userId: string | null;
}) {
  const { data: pr } = useLatestRecordByExercise(userId, exercise.exerciseId);

  return (
    <Card
      bordered
      padding="$4"
      margin="$4"
      marginBottom="$1"
      borderRadius="$4"
      backgroundColor={C.surface}
    >
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
        <YStack flex={1}>
          <XStack alignItems="center" gap="$2">
            <H4 color={C.text}>{exercise.exerciseName}</H4>
            {pr && (
              <Card paddingHorizontal="$2" paddingVertical="$1" backgroundColor="$orange4" borderRadius="$2">
                <Paragraph size="$1" color="$orange10" fontWeight="700">PR: {pr.prValue}kg</Paragraph>
              </Card>
            )}
          </XStack>
          <XStack alignItems="center" gap="$3" marginTop="$1">
            <Paragraph size="$2" color={C.sub}>{exercise.muscleGroup}</Paragraph>
            {exercise.videoUrl && (
              <Button
                chromeless
                size="$2"
                onPress={() => Linking.openURL(exercise.videoUrl!)}
              >
                <XStack alignItems="center" gap="$1">
                  <Youtube size={14} color={C.danger} />
                  <Paragraph size="$1" color={C.danger} fontWeight="600">Ver video</Paragraph>
                </XStack>
              </Button>
            )}
          </XStack>
        </YStack>
        <Button chromeless onPress={onRemoveExercise} icon={<Trash2 size={18} color={C.danger} />} />
      </XStack>

      {/* Set Headers */}
      <XStack paddingHorizontal="$2" marginBottom="$1">
        <Paragraph size="$1" color={C.sub} width={40} fontWeight="600">Serie</Paragraph>
        <Paragraph size="$1" color={C.sub} flex={1} fontWeight="600">Peso (kg)</Paragraph>
        <Paragraph size="$1" color={C.sub} flex={1} fontWeight="600">Reps</Paragraph>
        <Paragraph size="$1" color={C.sub} width={60} fontWeight="600">Calent.</Paragraph>
      </XStack>

      {/* Sets */}
      {exercise.sets.map((set, setIndex) => (
        <XStack
          key={setIndex}
          paddingVertical="$1"
          paddingHorizontal="$2"
          alignItems="center"
          backgroundColor={set.isWarmup ? C.elevated : 'transparent'}
          borderRadius="$3"
          gap="$1"
        >
          <Paragraph color={C.sub} width={40} fontWeight="600">{setIndex + 1}</Paragraph>
          <YStack flex={1}>
            <Input
              size="$3"
              keyboardType="decimal-pad"
              placeholder="0"
              value={set.weight}
              onChangeText={(v) => onUpdateSet(setIndex, 'weight', v)}
            />
          </YStack>
          <YStack flex={1}>
            <Input
              size="$3"
              keyboardType="number-pad"
              placeholder="0"
              value={set.reps}
              onChangeText={(v) => onUpdateSet(setIndex, 'reps', v)}
            />
          </YStack>
          <Button
            chromeless
            size="$2"
            width={60}
            backgroundColor={set.isWarmup ? '$orange6' : C.elevated}
            onPress={() => onToggleWarmup(setIndex)}
          >
            <Flame size={14} color={set.isWarmup ? '$orange10' : C.sub} />
          </Button>
          <Button chromeless onPress={() => onRemoveSet(setIndex)} icon={<Trash2 size={14} color={C.sub} />} />
        </XStack>
      ))}

      {/* Suggested Weight */}
      <SuggestionBanner exercise={exercise} userId={userId} />

      <Button
        variant="outline"
        size="$3"
        marginTop="$3"
        onPress={onAddSet}
        icon={<Plus size={14} />}
      >
        Añadir Serie
      </Button>
    </Card>
  );
}

// -- Suggested Weight Banner --

function SuggestionBanner({
  exercise,
  userId,
}: {
  exercise: ExerciseData;
  userId: string | null;
}) {
  const { data: pr } = useLatestRecordByExercise(userId, exercise.exerciseId);
  if (!pr) return null;

  const lastSet = exercise.sets[exercise.sets.length - 1];
  const lastWeight = lastSet && lastSet.weight ? parseFloat(lastSet.weight) : 0;
  const lastReps = lastSet && lastSet.reps ? parseInt(lastSet.reps) : 0;

  if (lastWeight <= 0) return null;

  const suggested = getSuggestedWeight(lastWeight, lastReps);

  return (
    <Card padding="$3" backgroundColor={C.elevated} borderRadius="$3" marginTop="$2">
      <XStack alignItems="center" gap="$2">
        <Dumbbell size={14} color={C.success} />
        <Paragraph size="$2" color={C.success}>
          {suggested > lastWeight
            ? `Sube a ${suggested} kg (sobrecarga progresiva)`
            : `Mantén ${lastWeight} kg y apunta a más reps`}
        </Paragraph>
      </XStack>
    </Card>
  );
}
