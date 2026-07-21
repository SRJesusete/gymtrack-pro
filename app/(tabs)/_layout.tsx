import { Tabs } from 'expo-router';
import { Dumbbell, History, ClipboardList, TrendingUp, User } from '@blinkdotnew/mobile-ui';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '$color9',
        tabBarInactiveTintColor: '$color10',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '$color1',
          borderTopColor: '$color4',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Entreno',
          tabBarIcon: ({ color, size }) => <Dumbbell size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, size }) => <History size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="templates"
        options={{
          title: 'Plantillas',
          tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progreso',
          tabBarIcon: ({ color, size }) => <TrendingUp size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cuenta',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
