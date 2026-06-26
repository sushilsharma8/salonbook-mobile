import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { ChevronRight, MapPin } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

export default function AdminSalonsScreen() {
  const token = useAuthStore((s) => s.token);

  const { data: salons = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-salons', token],
    queryFn: () => api.getAdminSalons(token!),
    enabled: !!token,
  });

  if (!token) return <Screen loading />;

  if (isLoading) return <Screen loading />;

  if (error) {
    return (
      <Screen>
        <Text className="text-center text-stone-500 py-20">{(error as Error).message}</Text>
      </Screen>
    );
  }

  return (
    <Screen contentClassName="py-4">
      <Text className="text-3xl font-display font-bold text-stone-900 mb-1">Salons</Text>
      <Text className="text-stone-500 mb-6">{salons.length} salons on the platform</Text>

      {salons.map((salon) => (
        <Link key={salon.id} href={`/admin/salon/${salon.id}`} asChild>
          <Pressable className="bg-white rounded-2xl p-4 border border-stone-200/60 mb-3 flex-row items-center">
            <View className="flex-1">
              <Text className="font-semibold text-stone-900 text-lg">{salon.name}</Text>
              <View className="flex-row items-center gap-1 mt-1">
                <MapPin size={14} color="#a8a29e" />
                <Text className="text-stone-500 text-sm flex-1" numberOfLines={1}>
                  {salon.address}
                </Text>
              </View>
              {salon.owner ? (
                <Text className="text-stone-400 text-xs mt-1">
                  Owner: {salon.owner.name} ({salon.owner.email})
                </Text>
              ) : null}
            </View>
            <ChevronRight size={20} color="#a8a29e" />
          </Pressable>
        </Link>
      ))}

      {!salons.length ? (
        <Text className="text-center text-stone-500 py-12">No salons yet</Text>
      ) : null}
    </Screen>
  );
}
