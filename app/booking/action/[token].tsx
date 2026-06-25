import { useMutation, useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Calendar, Clock, Scissors, User } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { StatusBadge } from '@/components/StatusBadge';
import { api, ApiError } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { formatBookingTime, isPendingBookingActionable } from '@/lib/bookingTime';
import { getHomeRoute } from '@/lib/routing';

export default function BookingActionScreen() {
  const { token: actionToken } = useLocalSearchParams<{ token: string }>();
  const authToken = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [actionDone, setActionDone] = useState<'CONFIRMED' | 'CANCELLED' | null>(null);
  const [actionError, setActionError] = useState('');

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking-action', actionToken, authToken],
    queryFn: () => api.getBookingByActionToken(authToken!, actionToken!),
    enabled: !!authToken && !!actionToken,
  });

  const actionMutation = useMutation({
    mutationFn: (action: 'CONFIRMED' | 'CANCELLED') =>
      api.postBookingAction(authToken!, actionToken!, action),
    onSuccess: (_, action) => {
      setActionDone(action);
      setActionError('');
    },
    onError: (err) => {
      setActionError(err instanceof ApiError ? err.message : 'Action failed');
    },
  });

  if (!authToken || !user) {
    return (
      <Screen>
        <View className="items-center py-20 px-6">
          <Text className="text-xl font-display font-bold text-stone-900 mb-2">Sign in required</Text>
          <Text className="text-stone-500 text-center mb-6">
            Salon owners and admins must sign in to respond to booking requests.
          </Text>
          <Button label="Sign in" onPress={() => router.replace('/login')} />
        </View>
      </Screen>
    );
  }

  if (user.role === 'CUSTOMER') {
    return (
      <Screen>
        <View className="items-center py-20 px-6">
          <Text className="text-xl font-display font-bold text-stone-900 mb-2">Access denied</Text>
          <Text className="text-stone-500 text-center mb-6">
            Only salon owners and admins can manage booking requests.
          </Text>
          <Button label="Go home" onPress={() => router.replace(getHomeRoute(user.role))} />
        </View>
      </Screen>
    );
  }

  if (isLoading) return <Screen loading />;

  if (error || !booking) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Booking', headerTintColor: '#1c1917' }} />
        <Screen>
          <Text className="text-center text-stone-500 py-20">
            {(error as Error)?.message || 'Booking not found or link expired'}
          </Text>
        </Screen>
      </>
    );
  }

  const services = booking.services
    ?.map((s) => s.serviceNameAtBooking || s.service?.name)
    .filter(Boolean)
    .join(', ');
  const canRespond = isPendingBookingActionable(booking) && !actionDone;

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Booking request', headerTintColor: '#1c1917' }} />
      <Screen contentClassName="py-4">
        <View className="items-center mb-6">
          <Scissors size={28} color="#a8a29e" />
          <Text className="text-2xl font-display font-bold text-stone-900 mt-2">Booking Request</Text>
          <Text className="text-stone-500 text-sm">Review and respond</Text>
        </View>

        <View className="bg-white rounded-3xl p-6 border border-stone-200/60">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xs font-bold uppercase text-stone-400">{booking.salon?.name}</Text>
            <StatusBadge status={actionDone === 'CONFIRMED' ? 'CONFIRMED' : actionDone === 'CANCELLED' ? 'CANCELLED' : booking.status} />
          </View>

          <View className="gap-3 mb-4">
            <View className="flex-row items-center gap-2">
              <User size={18} color="#a8a29e" />
              <Text className="font-semibold text-stone-900">{booking.user?.name}</Text>
              {booking.user?.phone ? (
                <Text className="text-stone-500 text-sm">+91 {booking.user.phone}</Text>
              ) : null}
            </View>
            {services ? (
              <View className="flex-row items-center gap-2">
                <Scissors size={18} color="#a8a29e" />
                <Text className="text-stone-700">{services}</Text>
              </View>
            ) : null}
            <View className="flex-row items-center gap-2">
              <Calendar size={18} color="#a8a29e" />
              <Text className="text-stone-700">
                {formatBookingTime(booking.startTime, 'EEEE, MMMM d, yyyy')}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Clock size={18} color="#a8a29e" />
              <Text className="text-stone-700">
                {formatBookingTime(booking.startTime, 'h:mm a')}
                {booking.staff?.name ? ` (${booking.staff.name})` : ''}
              </Text>
            </View>
          </View>

          <View className="bg-stone-50 rounded-xl p-4 flex-row justify-between items-center mb-4">
            <Text className="text-stone-500 font-medium">Total</Text>
            <Text className="text-2xl font-display font-bold text-stone-900">₹{booking.totalAmount}</Text>
          </View>

          {actionError ? (
            <Text className="text-red-600 text-sm text-center mb-3">{actionError}</Text>
          ) : null}

          {actionDone ? (
            <View
              className={`p-4 rounded-xl ${
                actionDone === 'CONFIRMED' ? 'bg-emerald-50' : 'bg-red-50'
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  actionDone === 'CONFIRMED' ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {actionDone === 'CONFIRMED' ? 'Booking accepted!' : 'Booking rejected.'}
              </Text>
            </View>
          ) : canRespond ? (
            <View className="flex-row gap-3">
              <Button
                label="Accept"
                className="flex-1"
                loading={actionMutation.isPending}
                onPress={() => actionMutation.mutate('CONFIRMED')}
              />
              <Button
                label="Reject"
                variant="danger"
                className="flex-1"
                loading={actionMutation.isPending}
                onPress={() => actionMutation.mutate('CANCELLED')}
              />
            </View>
          ) : booking.status === 'PENDING' ? (
            <Text className="text-stone-500 text-sm text-center">
              This booking expired because the appointment time has passed.
            </Text>
          ) : (
            <Text className="text-stone-500 text-sm text-center">
              This booking has already been {booking.status.toLowerCase().replace('_', ' ')}.
            </Text>
          )}
        </View>
      </Screen>
    </>
  );
}
