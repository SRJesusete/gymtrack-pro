import { useState, useMemo } from 'react';
import { ScrollView, Linking, Platform } from 'react-native';
import {
  YStack, XStack, H2, H3, H4, Paragraph, Button, Card,
  Theme, Spinner, Input, Divider,
} from '@blinkdotnew/mobile-ui';
import { PlayCircle, Search, Dumbbell, ChevronDown, ChevronUp, ExternalLink, Info } from '@blinkdotnew/mobile-ui';
import { useExercises, useUserExercises } from '@/hooks/useDatabase';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import type { Exercise, UserExercise } from '@/types';

const MUSCLE_GROUPS = [
  { key: 'Pecho', label: 'Pecho', color: '#EF4444' },
  { key: 'Espalda', label: 'Espalda', color: '#3B82F6' },
  { key: 'Piernas', label: 'Piernas', color: '#22C55E' },
  { key: 'Hombros', label: 'Hombros', color: '#F97316' },
  { key: 'Brazos', label: 'Brazos', color: '#A855F7' },
  { key: 'Core', label: 'Core', color: '#EAB308' },
];

const VIDEO_TIPS: Record<string, { search: string; tips: string[]; errors: string[] }> = {
  'Press Banca': {
    search: 'press banca tecnica correcta gym',
    tips: ['Pies firmes en el suelo', 'Retrae las escápulas', 'Arco lumbar ligero', 'Baja la barra al pecho controladamente'],
    errors: ['Rebotar la barra en el pecho', 'Levantar los pies', 'Hombros desprotegidos'],
  },
  'Press Banca Inclinado': {
    search: 'press banca inclinado tecnica',
    tips: ['Banco a 30-45°', 'Codos a 45° del torso', 'Control en la bajada'],
    errors: ['Angulo demasiado alto (>60°)', 'Abrir demasiado los codos'],
  },
  'Aperturas con Mancuernas': {
    search: 'aperturas con mancuernas pecho tecnica',
    tips: ['Ligera flexion de codos', 'Abrir hasta sentir estiramiento', 'Contraer pectoral al cerrar'],
    errors: ['Bajar demasiado las mancuernas', 'Estirar los brazos completamente'],
  },
  'Cruce de Poleas': {
    search: 'cruce de poleas pecho tecnica',
    tips: ['Poleas altas', 'Ligera inclinacion hacia delante', 'Cruzar las manos al final'],
    errors: ['Usar demasiado peso', 'Movimiento brusco'],
  },
  Sentadilla: {
    search: 'sentadilla con barra tecnica correcta',
    tips: ['Barra sobre los trapecios', 'Espalda recta, pecho arriba', 'Bajar hasta paralelo o mas', 'Rodillas alineadas con pies'],
    errors: ['Talones despegan del suelo', 'Rodillas se colapsan hacia dentro', 'Espalda se redondea'],
  },
  'Prensa de Piernas': {
    search: 'prensa piernas tecnica gym',
    tips: ['Espalda pegada al respaldo', '90° de flexion de rodilla', 'No bloquear rodillas al extender'],
    errors: ['Bajar demasiado (gluteos se levantan)', 'Extender completamente las piernas'],
  },
  'Peso Muerto': {
    search: 'peso muerto tecnica correcta principiantes',
    tips: ['Barra sobre medio pie', 'Espalda neutra siempre', 'Activar dorsales antes de tirar', 'Cadera y hombros suben juntos'],
    errors: ['Espalda redondeada', 'Barra se aleja del cuerpo', 'Tiron brusco inicial'],
  },
  Dominadas: {
    search: 'dominadas tecnica correcta espalda',
    tips: ['Agarre prono (palmas hacia fuera)', 'Activar escapulas al inicio', 'Subir hasta barbilla sobre barra'],
    errors: ['Balanceo del cuerpo', 'No completar el rango', 'Hombros encogidos'],
  },
  'Remo con Barra': {
    search: 'remo con barra tecnica espalda',
    tips: ['Torso a 45°', 'Barra hacia el ombligo', 'Codos pegados al cuerpo'],
    errors: ['Torso demasiado erguido', 'Usar impulso de piernas'],
  },
  'Jalón al Pecho': {
    search: 'jalon al pecho tecnica dorsal',
    tips: ['Agarre ancho', 'Pecho arriba', 'Llevar barra a la clavicula', 'Control en la subida'],
    errors: ['Balanceo hacia atras', 'Tirar con los biceps'],
  },
  'Press Militar': {
    search: 'press militar con barra tecnica hombros',
    tips: ['Barra desde las claviculas', 'Core activado', 'Empujar vertical, cabeza adelante'],
    errors: ['Arquear la espalda', 'Empujar hacia delante'],
  },
  'Elevaciones Laterales': {
    search: 'elevaciones laterales mancuernas tecnica',
    tips: ['Ligera flexion de codos', 'Subir hasta altura de hombros', 'Control en la bajada', 'No usar impulso'],
    errors: ['Subir demasiado las mancuernas', 'Balancear el cuerpo', 'Encoger los hombros'],
  },
  'Curl de Bíceps': {
    search: 'curl de biceps con barra tecnica',
    tips: ['Codos pegados al cuerpo', 'Solo mover el antebrazo', 'Apretar biceps arriba', 'Bajar controladamente'],
    errors: ['Balancear el cuerpo', 'Mover los hombros', 'No extender completamente'],
  },
  'Press Francés': {
    search: 'press frances triceps tecnica',
    tips: ['Codos fijos apuntando al techo', 'Bajar la barra controladamente', 'Extender completamente'],
    errors: ['Abrir los codos', 'Bajar demasiado rapido'],
  },
  'Plancha Abdominal': {
    search: 'plancha abdominal tecnica correcta',
    tips: ['Codos bajo los hombros', 'Cuerpo en linea recta', 'Gluteos y abdomen contraidos', 'Mirada al suelo'],
    errors: ['Cadera hundida', 'Cadera demasiado alta', 'Aguantar la respiracion'],
  },
};

function getVideoInfo(name: string) {
  const exact = VIDEO_TIPS[name];
  if (exact) return exact;
  // Fuzzy match
  for (const [key, val] of Object.entries(VIDEO_TIPS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return { search: `${name} ejercicio gym tecnica`, tips: [], errors: [] };
}

function searchYouTube(query: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export default function HelpScreen() {
  const { user } = useAuth();
  const { data: exercises, isLoading } = useExercises();
  const { data: userEx } = useUserExercises(user?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const allExercises = useMemo(() => {
    return [...(exercises || []), ...(userEx || [])];
  }, [exercises, userEx]);

  const grouped = useMemo(() => {
    const map: Record<string, (Exercise | UserExercise)[]> = {};
    const filtered = searchQuery
      ? allExercises.filter((ex) =>
          ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : allExercises;
    for (const ex of filtered) {
      const g = ex.muscleGroup || 'Otros';
      if (!map[g]) map[g] = [];
      map[g].push(ex);
    }
    // Sort by predefined order
    const sorted: Record<string, (Exercise | UserExercise)[]> = {};
    for (const mg of MUSCLE_GROUPS) {
      if (map[mg.key]) sorted[mg.key] = map[mg.key];
    }
    for (const [key, val] of Object.entries(map)) {
      if (!sorted[key]) sorted[key] = val;
    }
    return sorted;
  }, [allExercises, searchQuery]);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const openVideo = (exerciseName: string) => {
    const info = getVideoInfo(exerciseName);
    const url = searchYouTube(info.search);
    Linking.openURL(url);
  };

  if (isLoading) {
    return (
      <Theme name="dark">
        <YStack flex={1} backgroundColor="$color1" justifyContent="center" alignItems="center">
          <Spinner size="large" color="$color9" />
        </YStack>
      </Theme>
    );
  }

  return (
    <Theme name="dark">
      <YStack flex={1} backgroundColor="$color1">
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <YStack padding="$4" paddingTop="$6" gap="$2">
            <H2 color="$color12" fontWeight="800">Ayuda</H2>
            <Paragraph color="$color10">
              Aprende la tecnica de cada ejercicio con videos y consejos
            </Paragraph>
          </YStack>

          {/* Search */}
          <YStack paddingHorizontal="$4" marginBottom="$3">
            <Input
              placeholder="Buscar ejercicio..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              size="$4"
            />
          </YStack>

          {/* Stats */}
          <XStack paddingHorizontal="$4" marginBottom="$3" gap="$3">
            <Card bordered padding="$3" borderRadius="$4" backgroundColor="$color2" flex={1}>
              <Paragraph size="$1" color="$color10">Ejercicios</Paragraph>
              <H3 color="$color12" fontWeight="800">{allExercises.length}</H3>
            </Card>
            <Card bordered padding="$3" borderRadius="$4" backgroundColor="$color2" flex={1}>
              <Paragraph size="$1" color="$color10">Grupos</Paragraph>
              <H3 color="$color12" fontWeight="800">{Object.keys(grouped).length}</H3>
            </Card>
          </XStack>

          {/* Groups */}
          {Object.entries(grouped).map(([group, exs]) => {
            const mg = MUSCLE_GROUPS.find((g) => g.key === group);
            const isExpanded = expandedGroups[group] !== false; // default expanded

            return (
              <YStack key={group} paddingHorizontal="$4" marginBottom="$2">
                {/* Group Header */}
                <Card
                  bordered
                  padding="$4"
                  borderRadius="$4"
                  backgroundColor="$color2"
                  onPress={() => toggleGroup(group)}
                >
                  <XStack justifyContent="space-between" alignItems="center">
                    <XStack gap="$3" alignItems="center">
                      <YStack
                        width={40}
                        height={40}
                        borderRadius={20}
                        backgroundColor={mg?.color + '20' || '$color3'}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Dumbbell size={20} color={mg?.color || '$color9'} />
                      </YStack>
                      <YStack>
                        <Paragraph fontWeight="700" color="$color12" size="$4">
                          {group}
                        </Paragraph>
                        <Paragraph size="$2" color="$color10">
                          {exs.length} ejercicios
                        </Paragraph>
                      </YStack>
                    </XStack>
                    {isExpanded ? (
                      <ChevronUp size={20} color="$color10" />
                    ) : (
                      <ChevronDown size={20} color="$color10" />
                    )}
                  </XStack>
                </Card>

                {/* Exercise List */}
                {isExpanded && (
                  <YStack gap="$2" marginTop="$2">
                    {exs.map((ex) => {
                      const videoInfo = getVideoInfo(ex.name);
                      const isExpandedEx = expandedExercise === ex.id;

                      return (
                        <Card
                          key={ex.id}
                          bordered
                          padding="$4"
                          borderRadius="$4"
                          backgroundColor="$color2"
                        >
                          <XStack justifyContent="space-between" alignItems="flex-start">
                            <YStack flex={1} gap="$1">
                              <Paragraph fontWeight="700" color="$color12">
                                {ex.name}
                              </Paragraph>
                              {ex.description ? (
                                <Paragraph size="$2" color="$color10">
                                  {ex.description}
                                </Paragraph>
                              ) : null}
                            </YStack>
                            <XStack gap="$1">
                              <Button
                                chromeless
                                onPress={() => router.push(`/exercise/${ex.id}`)}
                                icon={<Info size={18} color="$color9" />}
                              />
                              <Button
                                chromeless
                                theme="green"
                                onPress={() => openVideo(ex.name)}
                                icon={<PlayCircle size={18} color="#FF0000" />}
                              />
                            </XStack>
                          </XStack>

                          {/* Expand tips */}
                          <Button
                            chromeless
                            size="$2"
                            marginTop="$1"
                            onPress={() =>
                              setExpandedExercise(isExpandedEx ? null : ex.id)
                            }
                          >
                            <Paragraph size="$2" color="$color9">
                              {isExpandedEx ? 'Ocultar consejos' : 'Ver consejos'}
                            </Paragraph>
                          </Button>

                          {isExpandedEx && (
                            <YStack gap="$2" marginTop="$2">
                              {videoInfo.tips.length > 0 && (
                                <YStack gap="$1">
                                  <Paragraph size="$1" color="$green9" fontWeight="700">
                                    Tecnica correcta
                                  </Paragraph>
                                  {videoInfo.tips.map((tip, i) => (
                                    <XStack key={i} gap="$2" alignItems="center">
                                      <YStack width={6} height={6} borderRadius={3} backgroundColor="$green9" />
                                      <Paragraph size="$2" color="$color11">{tip}</Paragraph>
                                    </XStack>
                                  ))}
                                </YStack>
                              )}

                              {videoInfo.errors.length > 0 && (
                                <YStack gap="$1" marginTop="$1">
                                  <Paragraph size="$1" color="$red9" fontWeight="700">
                                    Errores comunes
                                  </Paragraph>
                                  {videoInfo.errors.map((err, i) => (
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
                                onPress={() => openVideo(ex.name)}
                                icon={<PlayCircle size={16} color="#FF0000" />}
                              >
                                <Paragraph size="$2" color="#FF0000">
                                  Ver video en YouTube
                                </Paragraph>
                              </Button>
                            </YStack>
                          )}
                        </Card>
                      );
                    })}
                  </YStack>
                )}
              </YStack>
            );
          })}

          {/* Empty search */}
          {searchQuery && Object.keys(grouped).length === 0 && (
            <YStack padding="$8" alignItems="center" gap="$3">
              <Search size={48} color="$color6" />
              <Paragraph color="$color10" textAlign="center">
                No se encontraron ejercicios para "{searchQuery}"
              </Paragraph>
            </YStack>
          )}
        </ScrollView>
      </YStack>
    </Theme>
  );
}
