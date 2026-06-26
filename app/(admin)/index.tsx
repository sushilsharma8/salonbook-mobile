import { useQuery } from '@tanstack/react-query';
import { Text, View } from 'react-native';
import { Calendar, Banknote, Scissors, Users } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { formatBookingTime } from '@/lib/bookingTime';

export default function AdminDashboardScreen() {
  const token = useAuthStore((s) => s.token);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats', token],
    queryFn: () => api.getAdminStats(token!),
    enabled: !!token,
  });

  const { data: activity = [] } = useQuery({
    queryKey: ['admin-activity', token],
    queryFn: () => api.getAdminActivity(token!),
    enabled: !!token,
  });

  if (!token) return <Screen loading />;

  if (statsLoading) return <Screen loading />;

  const cards = [
    { label: 'Users', value: stats?.users ?? 0, icon: Users, color: '#57534e' },
    { label: 'Salons', value: stats?.salons ?? 0, icon: Scissors, color: '#57534e' },
    { label: 'Bookings', value: stats?.bookings ?? 0, icon: Calendar, color: '#57534e' },
    { label: 'Revenue', value: `₹${stats?.revenue ?? 0}`, icon: Banknote, color: '#059669' },
  ];

  return (
    <Screen contentClassName="py-4">
      <Text className="text-3xl font-display font-bold text-stone-900 mb-1">Admin Dashboard</Text>
      <Text className="text-stone-500 mb-6">Platform overview</Text>

      <View className="flex-row flex-wrap gap-3 mb-6">
        {cards.map((card) => (
          <View
            key={card.label}
            className="flex-1 min-w-[45%] bg-white p-4 rounded-2xl border border-stone-200/60"
          >
            <card.icon size={20} color={card.color} />
            <Text className="text-xs font-bold text-stone-400 uppercase mt-2 mb-1">{card.label}</Text>
            <Text className="text-2xl font-display font-bold text-stone-900">{card.value}</Text>
          </View>
        ))}
      </View>

      <View className="bg-white rounded-3xl p-6 border border-stone-200/60">
        <Text className="text-lg font-display font-bold text-stone-900 mb-4">Recent activity</Text>
        {activity.length === 0 ? (
          <Text className="text-stone-500 text-sm">No recent bookings</Text>
        ) : (
          activity.slice(0, 8).map((booking) => (
            <View key={booking.id} className="py-3 border-b border-stone-100">
              <Text className="font-semibold text-stone-900">{booking.user?.name}</Text>
              <Text className="text-stone-500 text-sm">
                {booking.salon?.name} · {formatBookingTime(booking.startTime, 'MMM d, h:mm a')} ·{' '}
                {booking.status}
              </Text>
            </View>
          ))
        )}
      </View>
    </Screen>
  );
}
