import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { Plus, Trash2 } from 'lucide-react-native';
import { clsx } from 'clsx';
import { ManageBookingCard } from '@/components/ManageBookingCard';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import {
  api,
  ApiError,
  type BookingStatus,
  type Service,
  type ServiceTargetGender,
  type ServiceVariantInput,
} from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

const GENDERS: ServiceTargetGender[] = ['MALE', 'FEMALE', 'UNISEX'];
const STAFF_GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;

type VariantDraft = { targetGender: ServiceTargetGender; price: string; duration: string };

export default function AdminSalonManageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const token = useAuthStore((s) => s.token)!;
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [serviceVariants, setServiceVariants] = useState<VariantDraft[]>([
    { targetGender: 'MALE', price: '', duration: '' },
    { targetGender: 'FEMALE', price: '', duration: '' },
  ]);
  const [serviceError, setServiceError] = useState('');

  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffSkills, setStaffSkills] = useState('');
  const [staffGender, setStaffGender] = useState('OTHER');

  const { data: salon, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-salon', id, token],
    queryFn: () => api.getAdminSalon(token, id!),
    enabled: !!id,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-salon', id] });
    queryClient.invalidateQueries({ queryKey: ['admin-salons'] });
  };

  const statusMutation = useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: string; status: BookingStatus }) =>
      api.updateBookingStatus(token, bookingId, status),
    onSuccess: () => invalidate(),
  });

  const saveService = async () => {
    setServiceError('');
    const variants: ServiceVariantInput[] = serviceVariants
      .filter((v) => v.price && v.duration)
      .map((v) => ({
        targetGender: v.targetGender,
        price: Number(v.price),
        duration: Number(v.duration),
      }));
    if (!serviceName.trim() || !variants.length) {
      setServiceError('Name and at least one variant required');
      return;
    }
    try {
      await api.addAdminSalonService(token, id!, { name: serviceName.trim(), variants });
      setShowServiceForm(false);
      setServiceName('');
      setServiceVariants([
        { targetGender: 'MALE', price: '', duration: '' },
        { targetGender: 'FEMALE', price: '', duration: '' },
      ]);
      invalidate();
    } catch (err) {
      setServiceError(err instanceof ApiError ? err.message : 'Failed to add service');
    }
  };

  const deleteService = (service: Service) => {
    Alert.alert('Delete service', `Remove "${service.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await api.deleteAdminSalonService(token, id!, service.id);
          invalidate();
        },
      },
    ]);
  };

  const addStaff = async () => {
    if (!staffName.trim()) return;
    try {
      await api.addAdminSalonStaff(token, id!, {
        name: staffName.trim(),
        skills: staffSkills.trim() || undefined,
        gender: staffGender,
      });
      setShowStaffForm(false);
      setStaffName('');
      setStaffSkills('');
      invalidate();
    } catch (err) {
      Alert.alert('Error', err instanceof ApiError ? err.message : 'Failed to add staff');
    }
  };

  const deleteStaff = (staffId: string, name: string) => {
    Alert.alert('Remove staff', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await api.deleteAdminSalonStaff(token, id!, staffId);
          invalidate();
        },
      },
    ]);
  };

  const handleStatusChange = async (bookingId: string, status: BookingStatus) => {
    setUpdatingId(bookingId);
    try {
      await statusMutation.mutateAsync({ bookingId, status });
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) return <Screen loading />;

  if (error || !salon) {
    return (
      <Screen>
        <Text className="text-center text-stone-500 py-20">
          {(error as Error)?.message || 'Salon not found'}
        </Text>
        <Button label="Retry" onPress={() => refetch()} />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: salon.name, headerTintColor: '#1c1917' }} />
      <Screen contentClassName="py-4">
        <View className="bg-white rounded-2xl p-4 border border-stone-200/60 mb-6">
          <Text className="font-semibold text-stone-900">{salon.address}</Text>
          <Text className="text-stone-500 text-sm mt-1">
            {salon.openTime} – {salon.closeTime}
          </Text>
          {salon.owner ? (
            <Text className="text-stone-400 text-xs mt-2">
              Owner: {salon.owner.name} · {salon.owner.phone || salon.owner.email}
            </Text>
          ) : null}
        </View>

        {/* Services */}
        <View className="bg-white rounded-3xl p-6 border border-stone-200/60 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-display font-bold text-stone-900">
              Services ({salon.services.length})
            </Text>
            <Pressable onPress={() => setShowServiceForm(!showServiceForm)}>
              <Plus size={20} color="#1c1917" />
            </Pressable>
          </View>
          {showServiceForm ? (
            <View className="bg-stone-50 rounded-2xl p-4 mb-4">
              <Input label="Name" value={serviceName} onChangeText={setServiceName} containerClassName="mb-3" />
              {serviceVariants.map((v, i) => (
                <View key={v.targetGender} className="mb-2">
                  <Text className="text-xs font-bold text-stone-500 mb-1">{v.targetGender}</Text>
                  <View className="flex-row gap-2">
                    <TextInput
                      className="flex-1 px-3 py-2 rounded-lg border border-stone-200 bg-white"
                      placeholder="₹"
                      keyboardType="number-pad"
                      value={v.price}
                      onChangeText={(price) => {
                        const next = [...serviceVariants];
                        next[i] = { ...next[i], price };
                        setServiceVariants(next);
                      }}
                    />
                    <TextInput
                      className="flex-1 px-3 py-2 rounded-lg border border-stone-200 bg-white"
                      placeholder="mins"
                      keyboardType="number-pad"
                      value={v.duration}
                      onChangeText={(duration) => {
                        const next = [...serviceVariants];
                        next[i] = { ...next[i], duration };
                        setServiceVariants(next);
                      }}
                    />
                  </View>
                </View>
              ))}
              {serviceError ? <Text className="text-red-600 text-sm mb-2">{serviceError}</Text> : null}
              <Button label="Add service" onPress={saveService} />
            </View>
          ) : null}
          {salon.services.map((service) => (
            <View key={service.id} className="flex-row items-center justify-between py-3 border-b border-stone-100">
              <View className="flex-1">
                <Text className="font-semibold text-stone-900">{service.name}</Text>
                <Text className="text-stone-500 text-sm">
                  {service.variants.map((v) => `${v.targetGender}: ₹${v.price}`).join(' · ')}
                </Text>
              </View>
              <Pressable onPress={() => deleteService(service)}>
                <Trash2 size={18} color="#dc2626" />
              </Pressable>
            </View>
          ))}
        </View>

        {/* Staff */}
        <View className="bg-white rounded-3xl p-6 border border-stone-200/60 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-display font-bold text-stone-900">
              Staff ({salon.staff.length})
            </Text>
            <Pressable onPress={() => setShowStaffForm(!showStaffForm)}>
              <Plus size={20} color="#1c1917" />
            </Pressable>
          </View>
          {showStaffForm ? (
            <View className="bg-stone-50 rounded-2xl p-4 mb-4">
              <Input label="Name" value={staffName} onChangeText={setStaffName} containerClassName="mb-3" />
              <Input label="Skills" value={staffSkills} onChangeText={setStaffSkills} containerClassName="mb-3" />
              <View className="flex-row gap-2 mb-3">
                {STAFF_GENDERS.map((g) => (
                  <Pressable
                    key={g}
                    onPress={() => setStaffGender(g)}
                    className={clsx(
                      'flex-1 py-2 rounded-xl border items-center',
                      staffGender === g ? 'bg-amber-50 border-amber-300' : 'bg-white border-stone-200',
                    )}
                  >
                    <Text className="text-xs font-bold">{g}</Text>
                  </Pressable>
                ))}
              </View>
              <Button label="Add staff" onPress={addStaff} />
            </View>
          ) : null}
          {salon.staff.map((member) => (
            <View key={member.id} className="flex-row items-center justify-between py-3 border-b border-stone-100">
              <Text className="font-semibold text-stone-900">{member.name}</Text>
              <Pressable onPress={() => deleteStaff(member.id, member.name)}>
                <Trash2 size={18} color="#dc2626" />
              </Pressable>
            </View>
          ))}
        </View>

        {/* Bookings */}
        <Text className="text-lg font-display font-bold text-stone-900 mb-3">
          Bookings ({salon.bookings.length})
        </Text>
        {salon.bookings.map((booking) => (
          <ManageBookingCard
            key={booking.id}
            booking={booking}
            loading={updatingId === booking.id}
            onStatusChange={handleStatusChange}
          />
        ))}
      </Screen>
    </>
  );
}
