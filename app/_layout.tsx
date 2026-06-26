import '../global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useAuthStore } from '@/lib/auth-store';
import { getHomeRoute } from '@/lib/routing';
import { ErrorBoundary as AppErrorBoundary } from '@/components/ErrorBoundary';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, hydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;

    const root = segments[0] as string | undefined;
    const tabSegment = root === '(tabs)' ? (segments as string[])[1] : undefined;
    const inAuthGroup = root === 'login' || root === 'register';

    if (!user) {
      if (
        root === '(seller)' ||
        root === '(admin)' ||
        root === 'admin' ||
        root === 'booking' ||
        tabSegment === 'bookings' ||
        tabSegment === 'profile'
      ) {
        router.replace('/login');
      }
      return;
    }

    if (inAuthGroup) {
      router.replace(getHomeRoute(user.role));
      return;
    }

    if (user.role === 'CUSTOMER' && (root === '(seller)' || root === '(admin)' || root === 'admin')) {
      router.replace('/(tabs)/explore');
      return;
    }

    if (user.role === 'SELLER' && root === '(tabs)') {
      router.replace('/(seller)');
      return;
    }

    if (user.role === 'ADMIN' && (root === '(tabs)' || root === '(seller)')) {
      router.replace('/(admin)');
      return;
    }
  }, [user, hydrated, segments, router]);

  // Always render children so the navigation tree stays mounted.
  // Individual protected screens handle the unauthenticated / loading state themselves.
  return <>{children}</>;
}

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const [fontsLoaded, fontError] = useFonts({
    Outfit_600SemiBold,
    Outfit_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthGate>
          <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#fafaf9' } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(seller)" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="login" options={{ presentation: 'modal' }} />
          <Stack.Screen name="register" options={{ presentation: 'modal' }} />
          <Stack.Screen
            name="salon/[id]"
            options={{ headerShown: true, headerTitle: '', headerTintColor: '#1c1917' }}
          />
          <Stack.Screen
            name="admin/salon/[id]"
            options={{ headerShown: true, headerTintColor: '#1c1917' }}
          />
          <Stack.Screen
            name="booking/action/[token]"
            options={{ headerShown: true, headerTintColor: '#1c1917' }}
          />
          </Stack>
        </AuthGate>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}
