import { useState, useCallback } from 'react';
import { ScrollView, Alert } from 'react-native';
import {
  YStack, XStack, H2, H3, H4, Paragraph, Button, Card,
  Input, Theme, Spinner, BlinkDialog, Divider, Badge, toast,
} from '@blinkdotnew/mobile-ui';
import { ClipboardList, Plus, Play, Trash2, Dumbbell, ChevronRight, Info, X } from '@blinkdotnew/mobile-ui';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTemplates, useDeleteTemplate, useExercises, useCreateTemplate } from '@/hooks/useDatabase';
import { C } from '@/constants/theme';

const CATEGORIES: { key: string; label: string; icon: string }[] = [
  { key: 'all', label: 'Todas', icon: 'all' },
  { key: 'Push', label: 'Push', icon: 'push' },
  { key: 'Pull', label: 'Pull', icon: 'pull' },
  { key: 'Piernas', label: 'Piernas', icon: 'legs' },
  { key: 'Full Body', label: 'Full Body', icon: 'full' },
  { key: 'Fuerza', label: 'Fuerza', icon: 'strength' },
  { key: 'Hipertrofia', label: 'Hipertrofia', icon: 'hypertrophy' },
  { key: 'Principiante', label: 'Inicio', icon: 'beginner' },
];

interface CreatorExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  defaultSets: number;
  defaultReps: number;
}

function categorizeTemplate(name: string, description: string): string[] {
  const cats: string[] = [];
  const text = `${name} ${description}`.toLowerCase();
  if (text.includes('push')) cats.push('Push');
  if (text.includes('pull')) cats.push('Pull');
  if (text.includes('leg') || text.includes('pierna')) cats.push('Piernas');
  if (text.includes('full body') || text.includes('upper')) cats.push('Full Body');
  if (text.includes('fuerza') || text.includes('5x5')) cats.push('Fuerza');
  if (text.includes('hipertrofi')) cats.push('Hipertrofia');
  if (text.includes('principiante') || text.includes('inici')) cats.push('Principiante');
  return cats;
}

export default function TemplatesScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: templates, isLoading } = useTemplates(user?.id || null);
  const { data: exerciseList } = useExercises();
  const deleteTemplate = useDeleteTemplate();
  const createTemplate = useCreateTemplate();
  const [selectedCat, setSelectedCat] = useState('all');
  const [showCreator, setShowCreator] = useState(false);

  // Create template state
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creatorExercises, setCreatorExercises] = useState<CreatorExercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [creating, setCreating] = useState(false);

  const addExerciseToCreator = (ex: { id: string; name: string; muscleGroup: string }) => {
    if (creatorExercises.some((ce) => ce.exerciseId === ex.id)) return;
    setCreatorExercises((prev) => [
      ...prev,
      { exerciseId: ex.id, exerciseName: ex.name, muscleGroup: ex.muscleGroup, defaultSets: 3, defaultReps: 10 },
    ]);
    setShowExercisePicker(false);
  };

  const removeCreatorExercise = (index: number) => {
    setCreatorExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCreatorExercise = (index: number, field: 'defaultSets' | 'defaultReps', value: number) => {
    setCreatorExercises((prev) =>
      prev.map((ce, i) => (i === index ? { ...ce, [field]: Math.max(1, Math.min(value, 99)) } : ce))
    );
  };

  const handleCreateTemplate = async () => {
    if (!user) return;
    if (!newName.trim()) {
      Alert.alert('Nombre requerido', 'Ponle nombre a la plantilla.');
      return;
    }
    if (creatorExercises.length === 0) {
      Alert.alert('Sin ejercicios', 'Añade al menos un ejercicio.');
      return;
    }
    setCreating(true);
    try {
      await createTemplate.mutateAsync({
        userId: user.id,
        name: newName.trim(),
        description: newDesc.trim(),
        exercises: creatorExercises,
      });
      toast('Plantilla creada', { variant: 'success' });
      setShowCreator(false);
      setNewName('');
      setNewDesc('');
      setCreatorExercises([]);
    } catch (e: any) {
      toast('Error', { message: e?.message || 'No se pudo crear', variant: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const filtered = (templates || []).filter((tpl) => {
    if (selectedCat === 'all') return true;
    const cats = categorizeTemplate(tpl.name, tpl.description || '');
    return cats.includes(selectedCat);
  });

  const grouped: Record<string, typeof filtered> = {};
  for (const tpl of filtered) {
    const cats = categorizeTemplate(tpl.name, tpl.description || '');
    const cat = cats.length > 0 ? cats[0] : 'Otras';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(tpl);
  }

  const handleStartTemplate = useCallback((tplId: string) => {
    router.push(`/session/new?templateId=${tplId}`);
  }, []);

  const handleDelete = useCallback((tplId: string, name: string) => {
    Alert.alert(
      'Eliminar plantilla',
      `¿Seguro que quieres eliminar "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteTemplate.mutate(tplId),
        },
      ]
    );
  }, [deleteTemplate]);

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
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <YStack padding="$4" paddingTop="$6" gap="$2">
            <H2 color={C.text} fontWeight="800">Plantillas</H2>
            <Paragraph color={C.sub}>
              {templates?.length || 0} plantillas de entrenamiento
            </Paragraph>
          </YStack>

          {/* Category Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            <XStack gap="$2" paddingVertical="$2">
              {CATEGORIES.map((cat) => (
                <Card
                  key={cat.key}
                  bordered
                  paddingHorizontal="$4"
                  paddingVertical="$2"
                  borderRadius="$6"
                  backgroundColor={selectedCat === cat.key ? C.volt : C.elevated}
                  onPress={() => setSelectedCat(cat.key)}
                >
                  <Paragraph
                    fontWeight="600"
                    color={selectedCat === cat.key ? 'white' : C.sub}
                    size="$2"
                  >
                    {cat.label}
                  </Paragraph>
                </Card>
              ))}
            </XStack>
          </ScrollView>

          {/* Templates List */}
          {isLoading ? (
            <YStack padding="$8" alignItems="center">
              <Spinner size="large" color={C.volt} />
            </YStack>
          ) : filtered.length === 0 ? (
            <YStack padding="$8" alignItems="center" gap="$3">
              <ClipboardList size={48} color={C.muted} />
              <Paragraph color={C.sub} textAlign="center">
                {selectedCat === 'all'
                  ? 'No hay plantillas aún. ¡Crea la primera!'
                  : `No hay plantillas en la categoría seleccionada`}
              </Paragraph>
            </YStack>
          ) : (
            <YStack padding="$4" gap="$4">
              {Object.entries(grouped).map(([category, catTemplates]) => (
                <YStack key={category} gap="$2">
                  <XStack alignItems="center" gap="$2">
                    <Paragraph color={C.sub} fontWeight="700" size="$3">
                      {category}
                    </Paragraph>
                    <Divider flex={1} />
                    <Badge size="$1">{catTemplates.length}</Badge>
                  </XStack>

                  {catTemplates.map((tpl) => (
                    <Card
                      key={tpl.id}
                      bordered
                      padding="$4"
                      borderRadius="$4"
                      backgroundColor={C.surface}
                    >
                      <XStack justifyContent="space-between" alignItems="flex-start">
                        <YStack flex={1} gap="$1">
                          <Paragraph fontWeight="700" color={C.text}>{tpl.name}</Paragraph>
                          {tpl.description ? (
                            <Paragraph size="$2" color={C.sub}>{tpl.description}</Paragraph>
                          ) : null}
                          <Paragraph size="$1" color={C.volt}>
                            {new Date(tpl.createdAt).toLocaleDateString('es-ES', {
                              day: 'numeric', month: 'short',
                            })}
                          </Paragraph>
                        </YStack>
                        <XStack gap="$1">
                          <Button
                            chromeless
                            theme="green"
                            onPress={() => handleStartTemplate(tpl.id)}
                            icon={<Play size={18} />}
                          />
                          <Button
                            chromeless
                            onPress={() => handleDelete(tpl.id, tpl.name)}
                            icon={<Trash2 size={16} color={C.danger} />}
                          />
                        </XStack>
                      </XStack>
                    </Card>
                  ))}
                </YStack>
              ))}
            </YStack>
          )}
        </ScrollView>

        {/* FAB: Create Template */}
        <YStack position="absolute" bottom={24} right={24}>
          <Button
            backgroundColor={C.volt} color="#000000" fontWeight="800"
            circular
            size="$6"
            onPress={() => setShowCreator(true)}
            icon={<Plus size={24} />}
          />
        </YStack>

        {/* Create Template Dialog */}
        <BlinkDialog
          open={showCreator}
          onOpenChange={setShowCreator}
          title="Nueva Plantilla"
          description="Crea una plantilla reutilizable"
        >
          <ScrollView style={{ maxHeight: 500 }}>
            <YStack gap="$3" padding="$2">
              <Input
                placeholder="Nombre de la plantilla"
                value={newName}
                onChangeText={setNewName}
                size="$4"
              />
              <Input
                placeholder="Descripción (opcional)"
                value={newDesc}
                onChangeText={setNewDesc}
                size="$4"
              />

              {/* Selected Exercises */}
              {creatorExercises.map((ce, idx) => (
                <Card key={ce.exerciseId} bordered padding="$3" borderRadius="$3" backgroundColor={C.elevated}>
                  <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
                    <YStack flex={1}>
                      <Paragraph fontWeight="600" color={C.text}>{ce.exerciseName}</Paragraph>
                      <Paragraph size="$2" color={C.sub}>{ce.muscleGroup}</Paragraph>
                    </YStack>
                    <Button
                      chromeless
                      onPress={() => removeCreatorExercise(idx)}
                      icon={<X size={16} color={C.danger} />}
                    />
                  </XStack>
                  <XStack gap="$2">
                    <YStack flex={1}>
                      <Paragraph size="$1" color={C.sub} marginBottom="$1">Series</Paragraph>
                      <Input
                        size="$3"
                        keyboardType="number-pad"
                        value={String(ce.defaultSets)}
                        onChangeText={(v) => updateCreatorExercise(idx, 'defaultSets', parseInt(v) || 1)}
                      />
                    </YStack>
                    <YStack flex={1}>
                      <Paragraph size="$1" color={C.sub} marginBottom="$1">Reps</Paragraph>
                      <Input
                        size="$3"
                        keyboardType="number-pad"
                        value={String(ce.defaultReps)}
                        onChangeText={(v) => updateCreatorExercise(idx, 'defaultReps', parseInt(v) || 1)}
                      />
                    </YStack>
                  </XStack>
                </Card>
              ))}

              {/* Add Exercise Button */}
              <Button
                variant="outline"
                width="100%"
                onPress={() => setShowExercisePicker(true)}
                icon={<Plus size={18} />}
              >
                Añadir Ejercicio
              </Button>

              {/* Exercise Picker inside dialog */}
              {showExercisePicker && (
                <YStack gap="$2" marginTop="$2">
                  <Paragraph color={C.sub} fontWeight="600">Selecciona un ejercicio:</Paragraph>
                  <ScrollView style={{ maxHeight: 250 }}>
                    <YStack gap="$1">
                      {(exerciseList || []).map((ex) => (
                        <Card
                          key={ex.id}
                          bordered
                          padding="$3"
                          borderRadius="$3"
                          onPress={() => addExerciseToCreator(ex)}
                          opacity={creatorExercises.some((ce) => ce.exerciseId === ex.id) ? 0.4 : 1}
                        >
                          <XStack justifyContent="space-between" alignItems="center">
                            <YStack>
                              <Paragraph fontWeight="600" color={C.text}>{ex.name}</Paragraph>
                              <Paragraph size="$2" color={C.sub}>{ex.muscleGroup}</Paragraph>
                            </YStack>
                            {creatorExercises.some((ce) => ce.exerciseId === ex.id) && (
                              <Paragraph size="$2" color={C.success}>Añadido</Paragraph>
                            )}
                          </XStack>
                        </Card>
                      ))}
                    </YStack>
                  </ScrollView>
                </YStack>
              )}

              {/* Create Button */}
              {creatorExercises.length > 0 && (
                <Button
                  backgroundColor={C.volt} color="#000000" fontWeight="800"
                  width="100%"
                  onPress={handleCreateTemplate}
                  disabled={creating}
                  icon={creating ? <Spinner size="small" /> : <Plus size={18} />}
                  marginTop="$2"
                >
                  {creating ? 'Creando...' : 'Crear Plantilla'}
                </Button>
              )}
            </YStack>
          </ScrollView>
        </BlinkDialog>
      </YStack>
    </Theme>
  );
}
