import { Redirect } from 'expo-router';
import { useAuthStore } from '@/lib/auth-store';
import { getHomeRoute } from '@/lib/routing';

export default function Index() {
  const { user, hydrated } = useAuthStore();

  if (!hydrated) return null;

  return <Redirect href={getHomeRoute(user?.role)} />;
}
