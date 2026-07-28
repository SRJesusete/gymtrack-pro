import { useState, useMemo } from 'react';
import { ScrollView, Linking } from 'react-native';
import {
  YStack, XStack, H1, H3, Paragraph, Button, Card, Theme, Spinner, Input,
} from '@blinkdotnew/mobile-ui';
import { PlayCircle, Search, Dumbbell, ChevronDown, ChevronUp, Info } from '@blinkdotnew/mobile-ui';
import { useExercises, useUserExercises } from '@/hooks/useDatabase';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import type { Exercise, UserExercise } from '@/types';
import { C, FONT } from '@/constants/theme';

const MUSCLE_GROUPS = [
  { key: 'Pecho', label: 'Pecho', color: '#FF4D4D' },
  { key: 'Espalda', label: 'Espalda', color: '#3B82F6' },
  { key: 'Piernas', label: 'Piernas', color: '#22C55E' },
  { key: 'Hombros', label: 'Hombros', color: '#F97316' },
  { key: 'Brazos', label: 'Brazos', color: '#A855F7' },
  { key: 'Core', label: 'Core', color: '#EAB308' },
];

const YT_RED = '#FF3B30';

function groupColor(key: string): string {
  return MUSCLE_GROUPS.find((g) => g.key === key)?.color || C.volt;
}

const VIDEO_TIPS: Record<string, { search: string; tips: string[]; errors: string[] }> = {
  'Press Banca': { search: 'press banca tecnica correcta gym', tips: ['Pies firmes en el suelo', 'Retrae las escápulas', 'Arco lumbar ligero', 'Baja la barra al pecho controladamente'], errors: ['Rebotar la barra en el pecho', 'Levantar los pies', 'Hombros desprotegidos'] },
  'Press Banca Inclinado': { search: 'press banca inclinado tecnica', tips: ['Banco a 30-45°', 'Codos a 45° del torso', 'Control en la bajada'], errors: ['Angulo demasiado alto (>60°)', 'Abrir demasiado los codos'] },
  'Aperturas con Mancuernas': { search: 'aperturas con mancuernas pecho tecnica', tips: ['Ligera flexion de codos', 'Abrir hasta sentir estiramiento', 'Contraer pectoral al cerrar'], errors: ['Bajar demasiado las mancuernas', 'Estirar los brazos completamente'] },
  'Cruce de Poleas': { search: 'cruce de poleas pecho tecnica', tips: ['Poleas altas', 'Ligera inclinacion hacia delante', 'Cruzar las manos al final'], errors: ['Usar demasiado peso', 'Movimiento brusco'] },
  Sentadilla: { search: 'sentadilla con barra tecnica correcta', tips: ['Barra sobre los trapecios', 'Espalda recta, pecho arriba', 'Bajar hasta paralelo o mas', 'Rodillas alineadas con pies'], errors: ['Talones despegan del suelo', 'Rodillas se colapsan hacia dentro', 'Espalda se redondea'] },
  'Prensa de Piernas': { search: 'prensa piernas tecnica gym', tips: ['Espalda pegada al respaldo', '90° de flexion de rodilla', 'No bloquear rodillas al extender'], errors: ['Bajar demasiado (gluteos se levantan)', 'Extender completamente las piernas'] },
  'Peso Muerto': { search: 'peso muerto tecnica correcta principiantes', tips: ['Barra sobre medio pie', 'Espalda neutra siempre', 'Activar dorsales antes de tirar', 'Cadera y hombros suben juntos'], errors: ['Espalda redondeada', 'Barra se aleja del cuerpo', 'Tiron brusco inicial'] },
  Dominadas: { search: 'dominadas tecnica correcta espalda', tips: ['Agarre prono (palmas hacia fuera)', 'Activar escapulas al inicio', 'Subir hasta barbilla sobre barra'], errors: ['Balanceo del cuerpo', 'No completar el rango', 'Hombros encogidos'] },
  'Remo con Barra': { search: 'remo con barra tecnica espalda', tips: ['Torso a 45°', 'Barra hacia el ombligo', 'Codos pegados al cuerpo'], errors: ['Torso demasiado erguido', 'Usar impulso de piernas'] },
  'Jalón al Pecho': { search: 'jalon al pecho tecnica dorsal', tips: ['Agarre ancho', 'Pecho arriba', 'Llevar barra a la clavicula', 'Control en la subida'], errors: ['Balanceo hacia atras', 'Tirar con los biceps'] },
  'Press Militar': { search: 'press militar con barra tecnica hombros', tips: ['Barra desde las claviculas', 'Core activado', 'Empujar vertical, cabeza adelante'], errors: ['Arquear la espalda', 'Empujar hacia delante'] },
  'Elevaciones Laterales': { search: 'elevaciones laterales mancuernas tecnica', tips: ['Ligera flexion de codos', 'Subir hasta altura de hombros', 'Control en la bajada', 'No usar impulso'], errors: ['Subir demasiado las mancuernas', 'Balancear el cuerpo', 'Encoger los hombros'] },
  'Curl de Bíceps': { search: 'curl de biceps con barra tecnica', tips: ['Codos pegados al cuerpo', 'Solo mover el antebrazo', 'Apretar biceps arriba', 'Bajar controladamente'], errors: ['Balancear el cuerpo', 'Mover los hombros', 'No extender completamente'] },
  'Press Francés': { search: 'press frances triceps tecnica', tips: ['Codos fijos apuntando al techo', 'Bajar la barra controladamente', 'Extender completamente'], errors: ['Abrir los codos', 'Bajar demasiado rapido'] },
  'Plancha Abdominal': { search: 'plancha abdominal tecnica correcta', tips: ['Codos bajo los hombros', 'Cuerpo en linea recta', 'Gluteos y abdomen contraidos', 'Mirada al suelo'], errors: ['Cadera hundida', 'Cadera demasiado alta', 'Aguantar la respiracion'] },
};

function getVideoInfo(name: string) {
  const exact = VIDEO_TIPS[name];
  if (exact) return exact;
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
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const allExercises = useMemo(() => [...(exercises || []), ...(userEx || [])], [exercises, userEx]);

  const grouped = useMemo(() => {
    const map: Record<string, (Exercise | UserExercise)[]> = {};
    const q = searchQuery.toLowerCase();
    const filtered = allExercises.filter((ex) => {
      const matchesQuery = !q || ex.name.toLowerCase().includes(q) || ex.muscleGroup.toLowerCase().includes(q);
      const matchesGroup = filterGroup === 'all' || (ex.muscleGroup || 'Otros') === filterGroup;
      return matchesQuery && matchesGroup;
    });
    for (const ex of filtered) {
      const g = ex.muscleGroup || 'Otros';
      if (!map[g]) map[g] = [];
      map[g].push(ex);
    }
    const sorted: Record<string, (Exercise | UserExercise)[]> = {};
    for (const mg of MUSCLE_GROUPS) if (map[mg.key]) sorted[mg.key] = map[mg.key];
    for (const [key, val] of Object.entries(map)) if (!sorted[key]) sorted[key] = val;
    return sorted;
  }, [allExercises, searchQuery, filterGroup]);

  const openVideo = (exerciseName: string) => {
    Linking.openURL(searchYouTube(getVideoInfo(exerciseName).search));
  };

  if (isLoading) {
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
          <YStack padding="$5" paddingTop="$6" gap="$2">
            <XStack alignItems="center" gap="$2">
              <YStack width={8} height={8} borderRadius={4} backgroundColor={C.volt} />
              <Paragraph color={C.volt} fontFamily={FONT.bodyBlack} letterSpacing={3} fontSize={11}>GUÍA TÉCNICA</Paragraph>
            </XStack>
            <H1 color={C.text} fontFamily={FONT.display} fontSize={40} lineHeight={40} letterSpacing={0.5} textTransform="uppercase">
              Ejercicios
            </H1>
            <Paragraph color={C.sub} fontFamily={FONT.body}>
              Domina la técnica con consejos y vídeos para cada movimiento.
            </Paragraph>
          </YStack>

          {/* Search */}
          <XStack marginHorizontal="$5" marginBottom="$3" alignItems="center" gap="$2"
            backgroundColor={C.surface} borderColor={C.border} borderWidth={1} borderRadius={999} paddingHorizontal="$4" paddingVertical="$1">
            <Search size={18} color={C.muted} />
            <Input
              flex={1}
              placeholder="Buscar ejercicio o grupo..."
              placeholderTextColor={C.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              backgroundColor="transparent"
              borderWidth={0}
              color={C.text}
              size="$4"
              data-testid="help-search-input"
            />
          </XStack>

          {/* Stats bento */}
          <XStack paddingHorizontal="$5" marginBottom="$4" gap="$3">
            <Card padding="$3" borderRadius={12} backgroundColor={C.surface} borderColor={C.border} borderWidth={1} flex={1} alignItems="center" gap="$1">
              <Paragraph fontSize={28} fontFamily={FONT.display} color={C.volt} letterSpacing={0.5}>{allExercises.length}</Paragraph>
              <Paragraph fontSize={9} color={C.muted} fontFamily={FONT.bodyBold} letterSpacing={1}>EJERCICIOS</Paragraph>
            </Card>
            <Card padding="$3" borderRadius={12} backgroundColor={C.surface} borderColor={C.border} borderWidth={1} flex={1} alignItems="center" gap="$1">
              <Paragraph fontSize={28} fontFamily={FONT.display} color={C.volt} letterSpacing={0.5}>{MUSCLE_GROUPS.length}</Paragraph>
              <Paragraph fontSize={9} color={C.muted} fontFamily={FONT.bodyBold} letterSpacing={1}>GRUPOS</Paragraph>
            </Card>
          </XStack>

          {/* Group filter chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
            <FilterChip label="Todos" color={C.volt} active={filterGroup === 'all'} onPress={() => setFilterGroup('all')} testid="help-filter-all" />
            {MUSCLE_GROUPS.map((g) => (
              <FilterChip key={g.key} label={g.label} color={g.color} active={filterGroup === g.key} onPress={() => setFilterGroup(g.key)} testid={`help-filter-${g.key}`} />
            ))}
          </ScrollView>

          {/* Groups */}
          {Object.entries(grouped).map(([group, exs]) => {
            const gc = groupColor(group);
            return (
              <YStack key={group} paddingHorizontal="$5" marginBottom="$4" gap="$2">
                <XStack alignItems="center" gap="$3" marginBottom="$1">
                  <YStack width={40} height={40} borderRadius={12} backgroundColor={gc + '22'} justifyContent="center" alignItems="center" borderColor={gc} borderWidth={1}>
                    <Dumbbell size={20} color={gc} />
                  </YStack>
                  <YStack flex={1}>
                    <Paragraph fontFamily={FONT.heading} color={C.text} fontSize={18} letterSpacing={0.3} textTransform="uppercase">{group}</Paragraph>
                    <Paragraph size="$2" color={C.muted} fontFamily={FONT.body}>{exs.length} ejercicios</Paragraph>
                  </YStack>
                </XStack>

                {exs.map((ex) => {
                  const videoInfo = getVideoInfo(ex.name);
                  const isOpen = expandedExercise === ex.id;
                  return (
                    <Card key={ex.id} borderRadius={12} backgroundColor={C.surface} borderColor={C.border} borderWidth={1} overflow="hidden" data-testid={`help-exercise-${ex.id}`}>
                      <XStack>
                        <YStack width={4} backgroundColor={gc} />
                        <YStack flex={1} padding="$4">
                          <XStack justifyContent="space-between" alignItems="flex-start" gap="$2">
                            <YStack flex={1} gap="$1">
                              <Paragraph fontWeight="800" color={C.text} fontFamily={FONT.bodyBold}>{ex.name}</Paragraph>
                              {ex.description ? (
                                <Paragraph size="$2" color={C.sub} fontFamily={FONT.body}>{ex.description}</Paragraph>
                              ) : null}
                            </YStack>
                            <XStack gap="$1">
                              <Button chromeless circular size="$3" onPress={() => router.push(`/exercise/${ex.id}`)} icon={<Info size={18} color={C.volt} />} data-testid={`help-info-${ex.id}`} />
                              <Button chromeless circular size="$3" onPress={() => openVideo(ex.name)} icon={<PlayCircle size={18} color={YT_RED} />} data-testid={`help-video-${ex.id}`} />
                            </XStack>
                          </XStack>

                          <Button chromeless size="$2" marginTop="$2" alignSelf="flex-start"
                            onPress={() => setExpandedExercise(isOpen ? null : ex.id)}
                            iconAfter={isOpen ? <ChevronUp size={14} color={C.volt} /> : <ChevronDown size={14} color={C.volt} />}
                            data-testid={`help-tips-toggle-${ex.id}`}>
                            <Paragraph size="$2" color={C.volt} fontWeight="700">{isOpen ? 'Ocultar consejos' : 'Ver consejos'}</Paragraph>
                          </Button>

                          {isOpen && (
                            <YStack gap="$3" marginTop="$3">
                              {videoInfo.tips.length > 0 && (
                                <YStack gap="$2">
                                  <Paragraph size="$1" color={C.volt} fontFamily={FONT.bodyBold} letterSpacing={1}>TÉCNICA CORRECTA</Paragraph>
                                  {videoInfo.tips.map((tip) => (
                                    <XStack key={tip} gap="$2" alignItems="flex-start">
                                      <YStack width={6} height={6} borderRadius={3} backgroundColor={C.volt} marginTop={6} />
                                      <Paragraph size="$2" color={C.sub} flex={1} fontFamily={FONT.body}>{tip}</Paragraph>
                                    </XStack>
                                  ))}
                                </YStack>
                              )}
                              {videoInfo.errors.length > 0 && (
                                <YStack gap="$2">
                                  <Paragraph size="$1" color={C.danger} fontFamily={FONT.bodyBold} letterSpacing={1}>ERRORES COMUNES</Paragraph>
                                  {videoInfo.errors.map((err) => (
                                    <XStack key={err} gap="$2" alignItems="flex-start">
                                      <YStack width={6} height={6} borderRadius={3} backgroundColor={C.danger} marginTop={6} />
                                      <Paragraph size="$2" color={C.sub} flex={1} fontFamily={FONT.body}>{err}</Paragraph>
                                    </XStack>
                                  ))}
                                </YStack>
                              )}
                              <Button size="$4" width="100%" borderRadius={999} backgroundColor={YT_RED} color="#FFFFFF" fontWeight="800"
                                pressStyle={{ opacity: 0.85, scale: 0.98 }} onPress={() => openVideo(ex.name)}
                                icon={<PlayCircle size={16} color="#FFFFFF" />} data-testid={`help-youtube-${ex.id}`}>
                                Ver vídeo en YouTube
                              </Button>
                            </YStack>
                          )}
                        </YStack>
                      </XStack>
                    </Card>
                  );
                })}
              </YStack>
            );
          })}

          {/* Empty */}
          {Object.keys(grouped).length === 0 && (
            <YStack padding="$8" alignItems="center" gap="$3">
              <Search size={48} color={C.border} />
              <Paragraph color={C.muted} textAlign="center" fontFamily={FONT.body}>
                {searchQuery ? `Sin resultados para "${searchQuery}"` : 'No hay ejercicios en este grupo'}
              </Paragraph>
            </YStack>
          )}
        </ScrollView>
      </YStack>
    </Theme>
  );
}

function FilterChip({ label, color, active, onPress, testid }: { label: string; color: string; active: boolean; onPress: () => void; testid: string }) {
  return (
    <Card paddingHorizontal="$3" paddingVertical="$2" borderRadius={999}
      backgroundColor={active ? color : C.surface} borderColor={active ? color : C.border} borderWidth={1}
      onPress={onPress} pressStyle={{ scale: 0.96 }} data-testid={testid}>
      <XStack alignItems="center" gap="$2">
        {!active && <YStack width={8} height={8} borderRadius={4} backgroundColor={color} />}
        <Paragraph size="$2" fontWeight="800" color={active ? '#000000' : C.sub}>{label}</Paragraph>
      </XStack>
    </Card>
  );
}
