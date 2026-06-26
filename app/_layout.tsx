import '../global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useAuthStore } from '@/lib/auth-store';
import { getHomeRoute } from '@/lib/routing';
import { AppSplash } from '@/components/AppSplash';
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
    const inAuthGroup = root === 'login' || root === 'register';

    if (!root || root === 'index') {
      router.replace(getHomeRoute(user?.role));
      return;
    }

    if (!user) {
      if (root === '(seller)' || root === '(admin)' || root === 'admin' || root === 'booking') {
        router.replace('/login');
      }
      // ponytail: tab routes handle auth via push('/login') on-screen — replace here unmounts Tabs under Fabric
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

  return <>{children}</>;
}

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [showSplash, setShowSplash] = useState(true);
  const [splashMounted, setSplashMounted] = useState(true);
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

  const ready = fontsLoaded && hydrated;

  useEffect(() => {
    if (ready) {
      setShowSplash(false);
    }
  }, [ready]);

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthGate>
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
          <StatusBar style="dark" />
        </AuthGate>
        {splashMounted ? (
          <AppSplash visible={showSplash} onFinish={() => setSplashMounted(false)} />
        ) : null}
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}
