import { useState, useEffect, useCallback } from 'react';
import { ScrollView, Alert } from 'react-native';
import {
  YStack, XStack, H2, H3, H4, Paragraph, Button, Card,
  Input, Theme, toast, Spinner, BlinkDialog,
} from '@blinkdotnew/mobile-ui';
import { Dumbbell, Plus, Trash2, Check, ArrowLeft, Save, Flame, HelpCircle, PlayCircle, X } from '@blinkdotnew/mobile-ui';
import { router, useLocalSearchParams } from 'expo-router';
import { Linking } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import {
  useExercises,
  useUserExercises,
  useTemplateWithExercises,
  useCreateSession,
  useLatestRecordByExercise,
  useUserPresetWithExercises,
  getSuggestedWeight,
} from '@/hooks/useDatabase';
import { getGuide } from '@/constants/exerciseGuides';
import { ALL_PRESETS } from '@/constants/workoutPresets';

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
}

export default function NewSessionScreen() {
  const { templateId, quickStart, presetId, date } = useLocalSearchParams<{ templateId?: string; quickStart?: string; presetId?: string; date?: string }>();
  const { user } = useAuth();
  const { data: exercises } = useExercises();
  const { data: userEx } = useUserExercises(user?.id || null);
  const { data: template } = useTemplateWithExercises(templateId || null);
  const { data: userPreset } = useUserPresetWithExercises(presetId || null);
  const createSession = useCreateSession();
  const [sessionName, setSessionName] = useState('');
  const [exerciseData, setExerciseData] = useState<ExerciseData[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [guideExercise, setGuideExercise] = useState<{ name: string; muscle: string } | null>(null);

  // If date param is provided, pre-fill name with friendly date
  useEffect(() => {
    if (date && !sessionName && !templateId && !quickStart && !presetId) {
      const d = new Date(date + 'T00:00:00');
      const friendly = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
      setSessionName(`Entreno ${friendly}`);
    }
  }, [date]);

  // Merged exercise list
  const allExercises = [...(exercises || []), ...(userEx || [])];

  // Init from quick preset (uses shared ALL_PRESETS)
  useEffect(() => {
    if (quickStart && ALL_PRESETS[quickStart] && exerciseData.length === 0 && !template) {
      const preset = ALL_PRESETS[quickStart];
      setSessionName(preset.name);
      const data: ExerciseData[] = preset.exercises.map((pe) => ({
        exerciseId: pe.id,
        exerciseName: pe.name,
        muscleGroup: pe.muscle,
        sets: Array.from({ length: pe.sets }, () => ({
          weight: '',
          reps: String(pe.reps),
          isWarmup: false,
        })),
      }));
      setExerciseData(data);
    }
  }, [quickStart]);

  // Init from template
  useEffect(() => {
    if (template && exerciseData.length === 0) {
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
  }, [template]);

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
      <YStack flex={1} backgroundColor="$color1">
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <XStack padding="$4" paddingTop="$6" justifyContent="space-between" alignItems="center">
            <Button chromeless onPress={() => router.back()} icon={<ArrowLeft size={20} />} />
            <H2 color="$color12" fontWeight="800">
              Nuevo Entreno
            </H2>
            <Button
              chromeless
              onPress={handleSave}
              disabled={saving}
              icon={saving ? <Spinner size="small" /> : <Save size={20} color="$color9" />}
            />
          </XStack>

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
              onShowGuide={(name, muscle) => setGuideExercise({ name, muscle })}
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
            <YStack padding="$4" backgroundColor="$color2" margin="$4" borderRadius="$4">
              <XStack justifyContent="space-between">
                <Paragraph color="$color11" fontWeight="600">Volumen total estimado</Paragraph>
                <Paragraph color="$color9" fontWeight="800">
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
                      <Paragraph fontWeight="600" color="$color12">{ex.name}</Paragraph>
                      <Paragraph size="$2" color="$color10">{ex.muscleGroup}</Paragraph>
                    </YStack>
                    <Plus size={16} color="$color9" />
                  </XStack>
                </Card>
              ))}
            </YStack>
          </ScrollView>
        </BlinkDialog>

        {/* Exercise Guide Dialog */}
        <BlinkDialog
          open={!!guideExercise}
          onOpenChange={(v) => { if (!v) setGuideExercise(null); }}
          title={guideExercise?.name || 'Guía del Ejercicio'}
          description={`Técnica correcta para ${guideExercise?.name || ''}`}
        >
          {guideExercise && (() => {
            const guide = getGuide(guideExercise.name);
            return (
              <YStack gap="$3" padding="$2">
                {guide.tips.length > 0 && (
                  <YStack gap="$1">
                    <Paragraph color="$green9" fontWeight="700" size="$2">Técnica correcta</Paragraph>
                    {guide.tips.map((tip, i) => (
                      <XStack key={i} gap="$2" alignItems="center">
                        <YStack width={6} height={6} borderRadius={3} backgroundColor="$green9" />
                        <Paragraph size="$2" color="$color11">{tip}</Paragraph>
                      </XStack>
                    ))}
                  </YStack>
                )}
                {guide.errors.length > 0 && (
                  <YStack gap="$1" marginTop="$1">
                    <Paragraph color="$red9" fontWeight="700" size="$2">Errores comunes</Paragraph>
                    {guide.errors.map((err, i) => (
                      <XStack key={i} gap="$2" alignItems="center">
                        <YStack width={6} height={6} borderRadius={3} backgroundColor="$red9" />
                        <Paragraph size="$2" color="$color11">{err}</Paragraph>
                      </XStack>
                    ))}
                  </YStack>
                )}
                <Button
                  variant="outline"
                  size="$3"
                  width="100%"
                  marginTop="$2"
                  onPress={() => Linking.openURL(guide.videoUrl)}
                  icon={<PlayCircle size={16} color="#FF0000" />}
                >
                  <Paragraph size="$2" color="#FF0000">Ver video en YouTube</Paragraph>
                </Button>
              </YStack>
            );
          })()}
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
  onShowGuide,
  userId,
}: {
  exercise: ExerciseData;
  exIndex: number;
  onAddSet: () => void;
  onRemoveSet: (i: number) => void;
  onUpdateSet: (i: number, field: 'weight' | 'reps', value: string) => void;
  onToggleWarmup: (i: number) => void;
  onRemoveExercise: () => void;
  onShowGuide?: (name: string, muscle: string) => void;
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
      backgroundColor="$color2"
    >
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
        <YStack flex={1}>
          <XStack alignItems="center" gap="$2">
            <H4 color="$color12">{exercise.exerciseName}</H4>
            {pr && (
              <Card paddingHorizontal="$2" paddingVertical="$1" backgroundColor="$orange4" borderRadius="$2">
                <Paragraph size="$1" color="$orange10" fontWeight="700">PR: {pr.prValue}kg</Paragraph>
              </Card>
            )}
          </XStack>
          <Paragraph size="$2" color="$color10">{exercise.muscleGroup}</Paragraph>
        </YStack>
        <Button chromeless onPress={onRemoveExercise} icon={<Trash2 size={18} color="$red9" />} />
        <Button chromeless onPress={() => onShowGuide?.(exercise.exerciseName, exercise.muscleGroup)} icon={<HelpCircle size={18} color="$color9" />} />
      </XStack>

      {/* Set Headers */}
      <XStack paddingHorizontal="$2" marginBottom="$1">
        <Paragraph size="$1" color="$color10" width={40} fontWeight="600">Serie</Paragraph>
        <Paragraph size="$1" color="$color10" flex={1} fontWeight="600">Peso (kg)</Paragraph>
        <Paragraph size="$1" color="$color10" flex={1} fontWeight="600">Reps</Paragraph>
        <Paragraph size="$1" color="$color10" width={60} fontWeight="600">Calent.</Paragraph>
      </XStack>

      {/* Sets */}
      {exercise.sets.map((set, setIndex) => (
        <XStack
          key={setIndex}
          paddingVertical="$1"
          paddingHorizontal="$2"
          alignItems="center"
          backgroundColor={set.isWarmup ? '$orange2' : 'transparent'}
          borderRadius="$3"
          gap="$1"
        >
          <Paragraph color="$color10" width={40} fontWeight="600">{setIndex + 1}</Paragraph>
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
            backgroundColor={set.isWarmup ? '$orange6' : '$color3'}
            onPress={() => onToggleWarmup(setIndex)}
          >
            <Flame size={14} color={set.isWarmup ? '$orange10' : '$color10'} />
          </Button>
          <Button chromeless onPress={() => onRemoveSet(setIndex)} icon={<Trash2 size={14} color="$color10" />} />
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
    <Card padding="$3" backgroundColor="$green2" borderRadius="$3" marginTop="$2">
      <XStack alignItems="center" gap="$2">
        <Dumbbell size={14} color="$green9" />
        <Paragraph size="$2" color="$green11">
          {suggested > lastWeight
            ? `Sube a ${suggested} kg (sobrecarga progresiva)`
            : `Mantén ${lastWeight} kg y apunta a más reps`}
        </Paragraph>
      </XStack>
    </Card>
  );
}
