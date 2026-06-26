import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Redirect } from 'expo-router';
import * as Linking from 'expo-linking';
import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Calendar, Clock, MapPin, Share2, Star } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { ReviewModal } from '@/components/ReviewModal';
import { Screen } from '@/components/Screen';
import { StatusBadge } from '@/components/StatusBadge';
import {
  api,
  normalizeMyBookings,
  type Booking,
} from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { bookingTimeMs, formatBookingTime, isBookingUpcoming } from '@/lib/bookingTime';
import { clsx } from 'clsx';

type Tab = 'upcoming' | 'past';

function buildDirectionsUrl(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

function buildWhatsAppShare(booking: Booking) {
  const text =
    `I booked at ${booking.salon.name} on SalonBook — ` +
    `${formatBookingTime(booking.startTime, 'MMM d')} at ${formatBookingTime(booking.startTime, 'h:mm a')}.`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export default function BookingsScreen() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['my-bookings', token],
    queryFn: () => api.getMyBookings(token!).then(normalizeMyBookings),
    enabled: !!token,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.updateBookingStatus(token!, id, 'CANCELLED'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
  });

  const reviewMutation = useMutation({
    mutationFn: (payload: { salonId: string; rating: number; comment: string }) =>
      api.createReview(token!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      setReviewTarget(null);
    },
  });

  const bookings = data?.bookings ?? [];
  const reviews = data?.reviews ?? [];

  const upcoming = bookings.filter((b) => isBookingUpcoming(b.startTime) && b.status !== 'CANCELLED');
  const past = bookings.filter((b) => !isBookingUpcoming(b.startTime) || b.status === 'CANCELLED');
  const nextUpcoming = useMemo(
    () =>
      upcoming
        .slice()
        .sort((a, b) => bookingTimeMs(a.startTime) - bookingTimeMs(b.startTime))[0],
    [upcoming],
  );

  const displayed = tab === 'upcoming' ? upcoming : past;

  const handleCancel = (booking: Booking) => {
    Alert.alert('Cancel booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, cancel',
        style: 'destructive',
        onPress: async () => {
          await cancelMutation.mutateAsync(booking.id);
          const ownerPhone = booking.salon.owner?.phone;
          if (ownerPhone) {
            const phone = String(ownerPhone).replace(/\D/g, '');
            const phoneNum = phone.length === 10 ? `91${phone}` : phone;
            const services = booking.services
              .map((s) => s.serviceNameAtBooking || s.service?.name)
              .filter(Boolean)
              .join(', ');
            const msg =
              `Hello ${booking.salon.owner?.name || 'there'}, ${user?.name ?? 'A customer'} has cancelled their booking` +
              `${services ? ` for ${services}` : ''} at ${booking.salon.name}` +
              ` on ${formatBookingTime(booking.startTime, 'MMM d, yyyy')} at ${formatBookingTime(booking.startTime, 'h:mm a')}.`;
            Linking.openURL(`https://wa.me/${phoneNum}?text=${encodeURIComponent(msg)}`);
          }
        },
      },
    ]);
  };

  const hasReviewed = (salonId: string) => reviews.some((r) => r.salonId === salonId);

  if (!hydrated) return <Screen loading />;
  if (!user || !token) return <Redirect href="/login" />;

  if (isLoading) return <Screen loading />;

  if (error) {
    return (
      <Screen>
        <View className="items-center py-20">
          <Text className="text-stone-900 font-semibold mb-2">Could not load bookings</Text>
          <Text className="text-stone-500 mb-4">{(error as Error).message}</Text>
          <Button label="Try again" onPress={() => refetch()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen contentClassName="py-4">
      <View className="bg-white rounded-3xl p-6 border border-stone-200/60 mb-6">
        <Text className="text-3xl font-display font-bold text-stone-900 mb-1">
          Welcome, {user.name}
        </Text>
        <Text className="text-stone-500 mb-4">Manage your upcoming appointments and history.</Text>
        <View className="flex-row gap-3">
          <View className="flex-1 bg-stone-50 rounded-2xl border border-stone-100 p-4 items-center">
            <Text className="text-2xl font-display font-bold text-stone-900">{bookings.length}</Text>
            <Text className="text-[10px] font-bold text-stone-500 uppercase mt-1">Bookings</Text>
          </View>
          <View className="flex-1 bg-stone-50 rounded-2xl border border-stone-100 p-4 items-center">
            <Text className="text-2xl font-display font-bold text-stone-900">{reviews.length}</Text>
            <Text className="text-[10px] font-bold text-stone-500 uppercase mt-1">Reviews</Text>
          </View>
        </View>
      </View>

      {nextUpcoming ? (
        <View className="bg-stone-900 rounded-3xl p-5 mb-6 border border-stone-800">
          <Text className="text-[11px] uppercase tracking-wider text-stone-300 font-bold mb-2">
            Next appointment
          </Text>
          <Text className="text-xl font-display font-bold text-white">
            {nextUpcoming.services
              .map((s) => s.serviceNameAtBooking || s.service?.name)
              .join(', ')}
          </Text>
          <Text className="text-stone-300 mt-1">
            {nextUpcoming.salon.name} ·{' '}
            {formatBookingTime(nextUpcoming.startTime, 'EEE, MMM d · h:mm a')}
          </Text>
          <Link href={`/salon/${nextUpcoming.salonId}`} asChild>
            <Pressable className="mt-4 bg-white self-start px-4 py-2.5 rounded-xl">
              <Text className="font-bold text-stone-900 text-sm">View salon</Text>
            </Pressable>
          </Link>
        </View>
      ) : null}

      <View className="flex-row bg-stone-100 p-1 rounded-xl mb-6">
        {(['upcoming', 'past'] as Tab[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            className={clsx(
              'flex-1 py-2 rounded-lg items-center',
              tab === t && 'bg-white shadow-sm',
            )}
          >
            <Text
              className={clsx(
                'text-sm font-bold capitalize',
                tab === t ? 'text-stone-900' : 'text-stone-500',
              )}
            >
              {t} ({t === 'upcoming' ? upcoming.length : past.length})
            </Text>
          </Pressable>
        ))}
      </View>

      {displayed.length === 0 ? (
        <View className="bg-white rounded-3xl p-10 border border-stone-200/60 items-center">
          <Text className="text-stone-900 font-medium text-lg">No {tab} bookings</Text>
          <Text className="text-stone-400 mt-2 text-center">
            {tab === 'upcoming' ? 'Book a salon to see appointments here.' : 'Past visits will appear here.'}
          </Text>
          <Link href="/(tabs)/explore" asChild>
            <Pressable className="mt-6 bg-stone-900 px-6 py-3 rounded-full">
              <Text className="text-white font-bold">Explore salons</Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        displayed.map((booking) => {
          const serviceNames = booking.services
            .map((s) => s.serviceNameAtBooking || s.service?.name)
            .filter(Boolean)
            .join(', ');
          const canReview =
            tab === 'past' &&
            booking.status === 'COMPLETED' &&
            !hasReviewed(booking.salonId);

          return (
            <View
              key={booking.id}
              className="bg-white rounded-3xl p-5 border border-stone-200/60 mb-4"
            >
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1 pr-2">
                  <Text className="text-lg font-display font-bold text-stone-900">{booking.salon.name}</Text>
                  <Text className="text-stone-500 text-sm mt-1">{serviceNames}</Text>
                </View>
                <StatusBadge status={booking.status} />
              </View>

              <View className="gap-2 mb-4">
                <View className="flex-row items-center gap-2">
                  <Calendar size={16} color="#a8a29e" />
                  <Text className="text-stone-600 text-sm">
                    {formatBookingTime(booking.startTime, 'EEE, MMM d, yyyy')}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Clock size={16} color="#a8a29e" />
                  <Text className="text-stone-600 text-sm">
                    {formatBookingTime(booking.startTime, 'h:mm a')}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <MapPin size={16} color="#a8a29e" />
                  <Text className="text-stone-600 text-sm flex-1" numberOfLines={2}>
                    {booking.salon.address}
                  </Text>
                </View>
              </View>

              <View className="flex-row flex-wrap gap-2">
                {tab === 'upcoming' && booking.status !== 'CANCELLED' ? (
                  <Button
                    label="Cancel"
                    variant="danger"
                    className="px-4 py-2"
                    onPress={() => handleCancel(booking)}
                  />
                ) : null}
                <Pressable
                  onPress={() => Linking.openURL(buildDirectionsUrl(booking.salon.address))}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 border border-stone-200"
                >
                  <Text className="font-semibold text-stone-900 text-sm">Directions</Text>
                </Pressable>
                <Pressable
                  onPress={() => Linking.openURL(buildWhatsAppShare(booking))}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 border border-stone-200 flex-row items-center gap-1"
                >
                  <Share2 size={14} color="#1c1917" />
                  <Text className="font-semibold text-stone-900 text-sm">Share</Text>
                </Pressable>
                {canReview ? (
                  <Pressable
                    onPress={() => setReviewTarget(booking)}
                    className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 flex-row items-center gap-1"
                  >
                    <Star size={14} color="#b45309" />
                    <Text className="font-semibold text-amber-900 text-sm">Review</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        })
      )}

      <ReviewModal
        visible={!!reviewTarget}
        salonName={reviewTarget?.salon.name || ''}
        loading={reviewMutation.isPending}
        onClose={() => setReviewTarget(null)}
        onSubmit={(rating, comment) => {
          if (!reviewTarget) return;
          reviewMutation.mutate({
            salonId: reviewTarget.salonId,
            rating,
            comment,
          });
        }}
      />
    </Screen>
  );
}
