import { Stack, useRouter, useSegments } from 'expo-router';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { UserHeader } from '@/components/UserHeader';
import { View } from 'react-native';
import { ToastProvider } from '@/contexts/ToastContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    
    if (!user && !inAuthGroup) {
      // Redireciona para login se não estiver autenticado
      router.replace('/(auth)/sign-in');
    } else if (user && inAuthGroup) {
      // Redireciona para home se já estiver autenticado
      router.replace('/(tabs)');
    }
  }, [user, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ToastProvider>
        <View style={{ flex: 1 }}>
          {user && <UserHeader />}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen 
              name="(modals)/folder" 
              options={{ 
                presentation: 'modal',
                animation: 'slide_from_bottom'
              }} 
            />
            <Stack.Screen 
              name="(modals)/select-folder" 
              options={{ 
                presentation: 'modal',
                animation: 'slide_from_bottom'
              }} 
            />
          </Stack>
        </View>
        <StatusBar style="auto" />
      </ToastProvider>
    </ThemeProvider>
  );
}
