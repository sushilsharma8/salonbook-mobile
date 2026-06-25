import { useMutation, useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { addDays, format, startOfToday } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Calendar, Clock, MapPin, Star } from 'lucide-react-native';
import { BookingConfirmSheet } from '@/components/BookingConfirmSheet';
import { Button } from '@/components/Button';
import { DatePicker } from '@/components/DatePicker';
import { ServiceRow } from '@/components/ServiceRow';
import { TimeSlotGrid } from '@/components/TimeSlotGrid';
import {
  api,
  getEffectiveVariant,
  parseSalonImages,
  type Service,
} from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { buildBookingIso } from '@/lib/bookingTime';
import {
  isSalonOpenOnDate,
  normalizeWeeklyHoursFromApi,
} from '@/lib/salonHours';
import { getDefaultApiUrl } from '@/lib/theme';

export default function SalonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, token } = useAuthStore();

  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: salon, isLoading, error } = useQuery({
    queryKey: ['salon', id],
    queryFn: () => api.getSalon(id!),
    enabled: !!id,
  });

  const serviceIds = selectedServices.map((s) => s.id);
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ['slots', id, serviceIds.join(','), dateStr, token],
    queryFn: () => api.getSlots(token!, id!, serviceIds, dateStr),
    enabled: !!token && !!user && user.role === 'CUSTOMER' && serviceIds.length > 0 && !!user.gender,
  });

  const bookingMutation = useMutation({
    mutationFn: () => {
      const bookingTimeStr = buildBookingIso(selectedDate, selectedTime);
      const totalAmount = selectedServices.reduce(
        (acc, s) => acc + (getEffectiveVariant(s, user?.gender)?.price ?? 0),
        0,
      );
      return api.createBooking(token!, {
        salonId: id!,
        serviceIds,
        time: bookingTimeStr,
        totalAmount,
      });
    },
    onSuccess: (data) => {
      setShowConfirm(false);
      setSuccessMessage('Booking successful! You can pay at the shop directly.');
      setSelectedServices([]);
      setSelectedTime('');

      const ownerPhone = salon?.owner?.phone;
      if (ownerPhone && data.actionToken) {
        const phone = String(ownerPhone).replace(/\D/g, '');
        const phoneNum = phone.length === 10 ? `91${phone}` : phone;
        const actionUrl = `${getDefaultApiUrl()}/booking/action/${data.actionToken}`;
        const msg =
          `Hello ${salon?.owner?.name}, you have a new booking at ${salon?.name}!\n\n` +
          `Customer: ${user?.name}\n` +
          `Services: ${selectedServices.map((s) => s.name).join(', ')}\n` +
          `Date: ${format(selectedDate, 'MMM d, yyyy')} at ${selectedTime}\n\n` +
          `Sign in with your salon account to accept or reject:\n${actionUrl}`;
        Linking.openURL(`https://wa.me/${phoneNum}?text=${encodeURIComponent(msg)}`);
      }
    },
    onError: (err: Error) => {
      setErrorMessage(err.message);
      setShowConfirm(false);
    },
  });

  const weeklyHours = useMemo(() => {
    if (!salon) return null;
    return normalizeWeeklyHoursFromApi(salon.hours, salon.openTime, salon.closeTime);
  }, [salon]);

  const dates = useMemo(
    () => Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i)),
    [],
  );

  const images = useMemo(
    () =>
      salon
        ? parseSalonImages(salon.images, getDefaultApiUrl())
        : ['https://picsum.photos/seed/salon/800/400'],
    [salon],
  );

  const visibleServices = useMemo(() => {
    if (!salon?.services) return [];
    if (!user?.gender) return salon.services;
    return salon.services.filter((s) => getEffectiveVariant(s, user.gender));
  }, [salon, user?.gender]);

  useEffect(() => {
    if (!weeklyHours) return;
    if (!isSalonOpenOnDate(weeklyHours, selectedDate)) {
      const nextOpen = dates.find((d) => isSalonOpenOnDate(weeklyHours, d));
      if (nextOpen) setSelectedDate(nextOpen);
    }
  }, [weeklyHours, salon?.id, selectedDate, dates]);

  const toggleService = (service: Service) => {
    if (!user) {
      router.push('/register');
      return;
    }
    setSelectedTime('');
    setSelectedServices((prev) => {
      const exists = prev.some((s) => s.id === service.id);
      return exists ? prev.filter((s) => s.id !== service.id) : [...prev, service];
    });
  };

  const requestBooking = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!user) {
      router.push('/register');
      return;
    }
    if (!user.gender) {
      Alert.alert('Profile required', 'Please set your gender in Profile before booking.', [
        { text: 'Go to Profile', onPress: () => router.push('/(tabs)/profile') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    if (!selectedServices.length || !selectedTime) return;
    setShowConfirm(true);
  };

  const bookingTotal = selectedServices.reduce(
    (acc, s) => acc + (getEffectiveVariant(s, user?.gender)?.price ?? 0),
    0,
  );
  const bookingDuration = selectedServices.reduce(
    (acc, s) => acc + (getEffectiveVariant(s, user?.gender)?.duration ?? 0),
    0,
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-page">
        <ActivityIndicator size="large" color="#1c1917" />
      </View>
    );
  }

  if (!salon || error) {
    return (
      <View className="flex-1 items-center justify-center bg-page px-6">
        <Text className="text-xl font-bold text-stone-900 mb-2">Salon not found</Text>
        <Text className="text-stone-500 text-center mb-6">{(error as Error)?.message}</Text>
        <Button label="Back to Explore" onPress={() => router.back()} />
      </View>
    );
  }

  const avgRating =
    salon.reviews?.length > 0
      ? (
          salon.reviews.reduce((sum, r) => sum + r.rating, 0) / salon.reviews.length
        ).toFixed(1)
      : null;

  return (
    <View className="flex-1 bg-page">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Gallery */}
        <View className="bg-white border-b border-stone-200/60">
          <Image
            source={{ uri: images[Math.min(selectedImageIndex, images.length - 1)] }}
            className="w-full h-56"
            contentFit="cover"
          />
          {images.length > 1 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-3">
              {images.map((image, index) => (
                <Pressable key={index} onPress={() => setSelectedImageIndex(index)}>
                  <Image
                    source={{ uri: image }}
                    className={`w-16 h-16 rounded-xl mr-2 border-2 ${
                      selectedImageIndex === index ? 'border-stone-900' : 'border-stone-200'
                    }`}
                    contentFit="cover"
                  />
                </Pressable>
              ))}
            </ScrollView>
          ) : null}

          <View className="px-5 pb-6">
            <Text className="text-3xl font-display font-bold text-stone-900 mb-4">{salon.name}</Text>
            <View className="flex-row flex-wrap gap-2">
              <View className="flex-row items-center gap-2 bg-stone-50 px-3 py-2 rounded-full border border-stone-100">
                <MapPin size={16} color="#1c1917" />
                <Text className="text-sm font-medium text-stone-700">{salon.address}</Text>
              </View>
              <View className="flex-row items-center gap-2 bg-stone-50 px-3 py-2 rounded-full border border-stone-100">
                <Clock size={16} color="#1c1917" />
                <Text className="text-sm font-medium text-stone-700">
                  {salon.openTime} - {salon.closeTime}
                </Text>
              </View>
              <View className="flex-row items-center gap-2 bg-stone-50 px-3 py-2 rounded-full border border-stone-100">
                <Star size={16} color="#eab308" fill="#eab308" />
                <Text className="text-sm font-medium text-stone-700">
                  {salon.reviews?.length || 0} Reviews
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Services */}
        <View className="mx-4 mt-6 bg-white rounded-3xl p-5 border border-stone-200/60">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-display font-bold text-stone-900">Services</Text>
            <View className="bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
              <Text className="text-xs font-bold text-stone-600 uppercase">
                {visibleServices.length} listed
              </Text>
            </View>
          </View>
          {visibleServices.map((service) => (
            <ServiceRow
              key={service.id}
              service={service}
              selected={selectedServices.some((s) => s.id === service.id)}
              gender={user?.gender}
              onPress={() => toggleService(service)}
            />
          ))}
          {visibleServices.length === 0 ? (
            <Text className="text-stone-500">No services available for your profile gender.</Text>
          ) : null}
        </View>

        {/* Reviews */}
        {salon.reviews && salon.reviews.length > 0 ? (
          <View className="mx-4 mt-6 bg-white rounded-3xl p-5 border border-stone-200/60">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-display font-bold text-stone-900">Reviews</Text>
              {avgRating ? (
                <View className="flex-row items-center bg-stone-50 px-3 py-1 rounded-xl border border-stone-100">
                  <Star size={16} color="#eab308" fill="#eab308" />
                  <Text className="font-bold text-stone-900 ml-1">{avgRating}</Text>
                </View>
              ) : null}
            </View>
            {salon.reviews.slice(0, 5).map((review) => (
              <View key={review.id} className="border-b border-stone-100 pb-4 mb-4 last:border-0">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-bold text-stone-900">{review.user?.name || 'User'}</Text>
                  <View className="flex-row items-center">
                    <Star size={12} color="#eab308" fill="#eab308" />
                    <Text className="font-bold text-xs ml-1">{review.rating}</Text>
                  </View>
                </View>
                {review.comment ? (
                  <Text className="text-stone-600 text-sm bg-stone-50 p-3 rounded-2xl">
                    {review.comment}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Booking */}
        <View className="mx-4 mt-6 bg-white rounded-3xl p-5 border border-stone-200/60 mb-6">
          <Text className="text-xl font-display font-bold text-stone-900 mb-4">Book Appointment</Text>

          {successMessage ? (
            <View className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
              <Text className="text-emerald-800 font-medium">{successMessage}</Text>
            </View>
          ) : null}
          {errorMessage ? (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <Text className="text-red-700">{errorMessage}</Text>
            </View>
          ) : null}

          {selectedServices.length === 0 ? (
            <View className="py-10 items-center bg-stone-50 rounded-2xl border border-dashed border-stone-200">
              <Text className="text-stone-500">Select at least one service first</Text>
            </View>
          ) : (
            <View>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {selectedServices.map((s) => (
                  <View key={s.id} className="bg-stone-100 px-3 py-1.5 rounded-full border border-stone-200">
                    <Text className="text-xs font-semibold text-stone-700">{s.name}</Text>
                  </View>
                ))}
              </View>

              {user && !user.gender ? (
                <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                  <Text className="text-amber-900 font-semibold mb-1">Profile gender required</Text>
                  <Text className="text-amber-800 text-sm mb-2">
                    Update your profile to see accurate pricing and available slots.
                  </Text>
                  <Link href="/(tabs)/profile" asChild>
                    <Pressable>
                      <Text className="text-stone-900 font-bold underline">Go to Profile</Text>
                    </Pressable>
                  </Link>
                </View>
              ) : null}

              <Text className="text-sm font-bold text-stone-700 mb-3 flex-row items-center">
                <Calendar size={16} color="#44403c" /> Select Date
              </Text>
              <DatePicker
                dates={dates}
                selectedDate={selectedDate}
                weeklyHours={weeklyHours}
                onSelect={(d) => {
                  setSelectedDate(d);
                  setSelectedTime('');
                }}
              />

              <Text className="text-sm font-bold text-stone-700 mb-3 mt-2">Select Time</Text>
              {!user || !token ? (
                <View className="py-6 items-center">
                  <Text className="text-stone-500 mb-3">Sign in to see available slots</Text>
                  <Button label="Sign up to book" onPress={() => router.push('/register')} />
                </View>
              ) : slotsLoading ? (
                <ActivityIndicator color="#1c1917" className="py-8" />
              ) : (
                <TimeSlotGrid
                  slots={slotsData?.slots || []}
                  selectedTime={selectedTime}
                  selectedDate={selectedDate}
                  onSelect={setSelectedTime}
                />
              )}

              {selectedTime ? (
                <View className="bg-stone-50 rounded-2xl p-4 mt-4 border border-stone-200/60">
                  <Text className="text-stone-600 text-sm">Total duration: {bookingDuration} mins</Text>
                  <Text className="text-2xl font-bold text-stone-900 mt-1">₹{bookingTotal}</Text>
                  <Text className="text-stone-500 text-sm mt-1">Pay at the shop</Text>
                  <Button
                    label="Book Appointment"
                    fullWidth
                    className="mt-4"
                    onPress={requestBooking}
                  />
                </View>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>

      <BookingConfirmSheet
        visible={showConfirm}
        services={selectedServices}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        total={bookingTotal}
        duration={bookingDuration}
        loading={bookingMutation.isPending}
        onConfirm={() => bookingMutation.mutate()}
        onClose={() => setShowConfirm(false)}
      />
    </View>
  );
}
