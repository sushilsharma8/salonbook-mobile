import { Pressable, ScrollView, Text, View } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import type { Booking } from '@/lib/api';

interface RecentlyVisitedProps {
  completedBookings: Booking[];
}

export function RecentlyVisited({ completedBookings }: RecentlyVisitedProps) {
  const router = useRouter();

  // Unique salons, most recent first (up to 3)
  const recentSalons = completedBookings
    .slice()
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .reduce<{ id: string; name: string; address: string }[]>((acc, booking) => {
      if (!acc.find((s) => s.id === booking.salonId)) {
        acc.push({
          id: booking.salonId,
          name: booking.salon.name,
          address: booking.salon.address,
        });
      }
      return acc;
    }, [])
    .slice(0, 3);

  if (recentSalons.length === 0) return null;

  return (
    <View className="mb-4">
      <Text className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 ml-1">
        Recently Visited
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
        <View className="flex-row gap-3 pb-1">
          {recentSalons.map((salon) => (
            <Pressable
              key={salon.id}
              onPress={() => router.push(`/salon/${salon.id}`)}
              className="bg-white rounded-2xl border border-stone-200/60 p-4 w-44 active:bg-stone-50"
            >
              <View className="w-10 h-10 bg-amber-100 rounded-xl items-center justify-center mb-3">
                <MapPin size={18} color="#92400e" />
              </View>
              <Text className="font-bold text-stone-900 text-sm" numberOfLines={1}>
                {salon.name}
              </Text>
              <Text className="text-[11px] text-stone-400 mt-0.5" numberOfLines={2}>
                {salon.address}
              </Text>
              <View className="mt-3 bg-stone-100 rounded-lg py-1.5 items-center">
                <Text className="text-[11px] font-bold text-stone-700">View Salon</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
