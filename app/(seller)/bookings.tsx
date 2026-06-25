import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { RefreshControl, Pressable, Text, View } from 'react-native';
import { clsx } from 'clsx';
import { ManageBookingCard } from '@/components/ManageBookingCard';
import { Screen } from '@/components/Screen';
import { api, type BookingStatus } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { isBookingUpcoming } from '@/lib/bookingTime';

type Tab = 'active' | 'past';

export default function SellerBookingsScreen() {
  const token = useAuthStore((s) => s.token)!;
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('active');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: bookings = [], isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['seller-bookings', token],
    queryFn: () => api.getSellerBookings(token),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      api.updateBookingStatus(token, id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seller-bookings'] }),
  });

  const active = useMemo(
    () => bookings.filter((b) => isBookingUpcoming(b.startTime) && b.status !== 'CANCELLED'),
    [bookings],
  );
  const past = useMemo(
    () => bookings.filter((b) => !isBookingUpcoming(b.startTime) || b.status === 'CANCELLED'),
    [bookings],
  );
  const displayed = tab === 'active' ? active : past;

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    setUpdatingId(id);
    try {
      await statusMutation.mutateAsync({ id, status });
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) return <Screen loading />;

  if (error) {
    return (
      <Screen>
        <Text className="text-center text-stone-500 py-20">{(error as Error).message}</Text>
      </Screen>
    );
  }

  return (
    <Screen
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      contentClassName="py-4"
    >
      <Text className="text-3xl font-display font-bold text-stone-900 mb-1">Bookings</Text>
      <Text className="text-stone-500 mb-6">Manage incoming appointments</Text>

      <View className="flex-row bg-stone-100 rounded-xl p-1 mb-6">
        {(['active', 'past'] as Tab[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            className={clsx('flex-1 py-2.5 rounded-lg items-center', tab === t && 'bg-white shadow-sm')}
          >
            <Text
              className={clsx(
                'font-semibold text-sm capitalize',
                tab === t ? 'text-stone-900' : 'text-stone-500',
              )}
            >
              {t} ({t === 'active' ? active.length : past.length})
            </Text>
          </Pressable>
        ))}
      </View>

      {displayed.length === 0 ? (
        <Text className="text-center text-stone-500 py-12">No {tab} bookings</Text>
      ) : (
        displayed.map((booking) => (
          <ManageBookingCard
            key={booking.id}
            booking={booking}
            loading={updatingId === booking.id}
            onStatusChange={handleStatusChange}
          />
        ))
      )}
    </Screen>
  );
}
