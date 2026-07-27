import { Tabs } from 'expo-router';
import { Dumbbell, History, ClipboardList, TrendingUp, User, Calendar, Info } from '@blinkdotnew/mobile-ui';

const VOLT = '#D4FF00';
const BG = '#09090B';
const MUTED = '#71717A';
const BORDER = '#27272A';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: VOLT,
        tabBarInactiveTintColor: MUTED,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: BG,
          borderTopColor: BORDER,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Entreno', tabBarIcon: ({ color, size }) => <Dumbbell size={size} color={color} /> }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendario', tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} /> }} />
      <Tabs.Screen name="history" options={{ title: 'Historial', tabBarIcon: ({ color, size }) => <History size={size} color={color} /> }} />
      <Tabs.Screen name="templates" options={{ title: 'Plantillas', tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} /> }} />
      <Tabs.Screen name="progress" options={{ title: 'Progreso', tabBarIcon: ({ color, size }) => <TrendingUp size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Cuenta', tabBarIcon: ({ color, size }) => <User size={size} color={color} /> }} />
      <Tabs.Screen name="help" options={{ title: 'Ayuda', tabBarIcon: ({ color, size }) => <Info size={size} color={color} /> }} />
    </Tabs>
  );
}
