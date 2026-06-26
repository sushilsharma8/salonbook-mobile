import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { AlertTriangle, Calendar, CheckCircle, Scissors } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { OnboardingChecklist } from '@/components/OnboardingChecklist';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { isBookingUpcoming, isPendingBookingActionable } from '@/lib/bookingTime';

export default function SellerDashboardScreen() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const { data: salon, isLoading, error, refetch } = useQuery({
    queryKey: ['seller-salon', token],
    queryFn: () => api.getSellerSalon(token!),
    enabled: !!token,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['seller-bookings', token],
    queryFn: () => api.getSellerBookings(token!),
    enabled: !!salon && !!token,
  });

  if (!user || !token) {
    return (
      <Screen>
        <Text className="text-center text-stone-500 py-20">Please log in to continue.</Text>
      </Screen>
    );
  }

  if (isLoading) return <Screen loading />;

  if (error) {
    return (
      <Screen>
        <View className="items-center py-20">
          <Text className="text-stone-900 font-semibold mb-2">Could not load dashboard</Text>
          <Text className="text-stone-500 mb-4">{(error as Error).message}</Text>
          <Button label="Try again" onPress={() => refetch()} />
        </View>
      </Screen>
    );
  }

  const pendingCount = bookings.filter((b) => isPendingBookingActionable(b)).length;
  const revenue = bookings
    .filter((b) => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.totalAmount, 0);
  const activeCount = bookings.filter(
    (b) => isBookingUpcoming(b.startTime) && b.status !== 'CANCELLED',
  ).length;

  return (
    <Screen contentClassName="py-4">
      <View className="bg-white rounded-3xl p-6 border border-stone-200/60 mb-6">
        <View className="flex-row items-center gap-3 mb-2">
          <Scissors size={24} color="#1c1917" />
          <Text className="text-2xl font-display font-bold text-stone-900">Seller Dashboard</Text>
        </View>
        <Text className="text-stone-500">Welcome back, {user.name}</Text>
        {!salon ? (
          <Link href="/(seller)/salon" asChild>
            <Pressable className="mt-4 bg-stone-900 rounded-xl py-3.5 items-center">
              <Text className="text-white font-semibold">Set up your salon</Text>
            </Pressable>
          </Link>
        ) : null}
      </View>

      {salon && pendingCount > 0 ? (
        <Link href="/(seller)/bookings" asChild>
          <Pressable className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex-row items-center gap-3 mb-6">
            <AlertTriangle size={20} color="#d97706" />
            <View className="flex-1">
              <Text className="font-bold text-amber-900">
                {pendingCount} booking{pendingCount === 1 ? '' : 's'} awaiting response
              </Text>
              <Text className="text-sm text-amber-700">Tap to review pending requests.</Text>
            </View>
          </Pressable>
        </Link>
      ) : null}

      {salon ? (
        <>
          <View className="flex-row flex-wrap gap-3 mb-6">
            <View className="flex-1 min-w-[45%] bg-white p-4 rounded-2xl border border-stone-200/60">
              <Calendar size={20} color="#57534e" />
              <Text className="text-xs font-bold text-stone-400 uppercase mt-2 mb-1">Bookings</Text>
              <Text className="text-2xl font-display font-bold text-stone-900">{bookings.length}</Text>
            </View>
            <View className="flex-1 min-w-[45%] bg-white p-4 rounded-2xl border border-stone-200/60">
              <CheckCircle size={20} color="#059669" />
              <Text className="text-xs font-bold text-stone-400 uppercase mt-2 mb-1">Revenue</Text>
              <Text className="text-2xl font-display font-bold text-stone-900">₹{revenue}</Text>
            </View>
            <View className="flex-1 min-w-[45%] bg-white p-4 rounded-2xl border border-stone-200/60">
              <AlertTriangle size={20} color="#d97706" />
              <Text className="text-xs font-bold text-stone-400 uppercase mt-2 mb-1">Pending</Text>
              <Text className="text-2xl font-display font-bold text-stone-900">{pendingCount}</Text>
            </View>
            <View className="flex-1 min-w-[45%] bg-white p-4 rounded-2xl border border-stone-200/60">
              <Calendar size={20} color="#1c1917" />
              <Text className="text-xs font-bold text-stone-400 uppercase mt-2 mb-1">Active</Text>
              <Text className="text-2xl font-display font-bold text-stone-900">{activeCount}</Text>
            </View>
          </View>
          <OnboardingChecklist salon={salon} />
        </>
      ) : null}
    </Screen>
  );
}
