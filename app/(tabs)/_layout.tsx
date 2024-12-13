import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].primary,
          tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].gray[400],
          headerShown: true,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Minhas Pastas',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="folder.fill" color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="camera"
          options={{
            title: 'Câmera',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="camera.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Armazenamento',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.pie.fill" color={color} />,
            headerShown: false,
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}
