import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Plus, Trash2, X } from 'lucide-react-native';
import { clsx } from 'clsx';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { WeeklyHoursEditor } from '@/components/WeeklyHoursEditor';
import {
  api,
  ApiError,
  parseSalonImages,
  type Service,
  type ServiceTargetGender,
  type ServiceVariantInput,
  type SellerSalon,
  type StaffMember,
} from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { CATEGORIES } from '@/lib/categories';
import {
  buildDefaultWeeklyHours,
  normalizeWeeklyHoursFromApi,
  type SalonDayHours,
} from '@/lib/salonHours';
import { getDefaultApiUrl } from '@/lib/theme';

const GENDERS: ServiceTargetGender[] = ['MALE', 'FEMALE', 'UNISEX'];
const STAFF_GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;
const DEFAULT_STAFF_SKILLS = 'SALON_DEFAULT_STAFF';

type VariantDraft = { targetGender: ServiceTargetGender; price: string; duration: string };

function parseCategories(raw: string | null | undefined) {
  if (!raw) return { primary: null as string | null, related: [] as string[] };
  try {
    const parsed = JSON.parse(raw);
    return {
      primary: parsed.primary || null,
      related: Array.isArray(parsed.related) ? parsed.related : [],
    };
  } catch {
    return { primary: null, related: [] as string[] };
  }
}

function countRealStaff(staff: SellerSalon['staff']): StaffMember[] {
  return (staff || []).filter((s) => s.skills !== DEFAULT_STAFF_SKILLS);
}

export default function SellerSalonScreen() {
  const token = useAuthStore((s) => s.token)!;
  const queryClient = useQueryClient();
  const baseUrl = getDefaultApiUrl();

  const { data: salon, isLoading, error, refetch } = useQuery({
    queryKey: ['seller-salon', token],
    queryFn: () => api.getSellerSalon(token),
  });

  const [salonData, setSalonData] = useState({ name: '', address: '', openTime: '09:00', closeTime: '18:00' });
  const [weeklyHours, setWeeklyHours] = useState<SalonDayHours[]>(() =>
    buildDefaultWeeklyHours('09:00', '18:00'),
  );
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [primaryCategory, setPrimaryCategory] = useState<string | null>(null);
  const [relatedCategories, setRelatedCategories] = useState<string[]>([]);
  const [salonError, setSalonError] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);

  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceVariants, setServiceVariants] = useState<VariantDraft[]>([
    { targetGender: 'MALE', price: '', duration: '' },
    { targetGender: 'FEMALE', price: '', duration: '' },
  ]);
  const [serviceError, setServiceError] = useState('');

  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffSkills, setStaffSkills] = useState('');
  const [staffGender, setStaffGender] = useState<string>('OTHER');

  useEffect(() => {
    if (!salon) return;
    setSalonData({
      name: salon.name,
      address: salon.address,
      openTime: salon.openTime,
      closeTime: salon.closeTime,
    });
    setWeeklyHours(normalizeWeeklyHoursFromApi(salon.hours, salon.openTime, salon.closeTime));
    setUploadedImages(parseSalonImages(salon.images, baseUrl));
    const cats = parseCategories(salon.categories);
    setPrimaryCategory(cats.primary);
    setRelatedCategories(cats.related);
  }, [salon, baseUrl]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['seller-salon'] });
    queryClient.invalidateQueries({ queryKey: ['seller-bookings'] });
  };

  const saveSalonMutation = useMutation({
    mutationFn: () =>
      api.saveSellerSalon(token, {
        ...salonData,
        images: JSON.stringify(uploadedImages),
        categories: JSON.stringify({ primary: primaryCategory, related: relatedCategories }),
        weeklyHours,
      }),
    onSuccess: () => {
      setSalonError('');
      invalidate();
      Alert.alert('Saved', 'Salon profile updated');
    },
    onError: (err) => {
      setSalonError(err instanceof ApiError ? err.message : 'Failed to save salon');
    },
  });

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (result.canceled || !result.assets.length) return;
    if (uploadedImages.length + result.assets.length > 20) {
      Alert.alert('Limit reached', 'Maximum 20 salon photos allowed.');
      return;
    }
    setUploadingImages(true);
    try {
      const files = result.assets.map((asset, i) => ({
        uri: asset.uri,
        name: asset.fileName || `photo-${Date.now()}-${i}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      }));
      const { urls } = await api.uploadSellerImages(token, files);
      setUploadedImages((prev) => [...prev, ...urls.map((u) => (u.startsWith('http') ? u : `${baseUrl}${u}`))]);
    } catch (err) {
      Alert.alert('Upload failed', err instanceof ApiError ? err.message : 'Could not upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const toggleRelatedCategory = (id: string) => {
    setRelatedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const resetServiceForm = () => {
    setShowServiceForm(false);
    setEditingService(null);
    setServiceName('');
    setServiceVariants([
      { targetGender: 'MALE', price: '', duration: '' },
      { targetGender: 'FEMALE', price: '', duration: '' },
    ]);
    setServiceError('');
  };

  const openEditService = (service: Service) => {
    setEditingService(service);
    setServiceName(service.name);
    setServiceVariants(
      GENDERS.map((g) => {
        const v = service.variants.find((x) => x.targetGender === g);
        return {
          targetGender: g,
          price: v ? String(v.price) : '',
          duration: v ? String(v.duration) : '',
        };
      }),
    );
    setShowServiceForm(true);
  };

  const saveService = async () => {
    setServiceError('');
    const variants: ServiceVariantInput[] = serviceVariants
      .filter((v) => v.price && v.duration)
      .map((v) => ({
        targetGender: v.targetGender,
        price: Number(v.price),
        duration: Number(v.duration),
      }));
    if (!serviceName.trim()) {
      setServiceError('Service name is required');
      return;
    }
    if (!variants.length) {
      setServiceError('Add at least one variant with price and duration');
      return;
    }
    try {
      if (editingService) {
        await api.updateSellerService(token, editingService.id, {
          name: serviceName.trim(),
          variants,
        });
      } else {
        await api.addSellerService(token, { name: serviceName.trim(), variants });
      }
      resetServiceForm();
      invalidate();
    } catch (err) {
      setServiceError(err instanceof ApiError ? err.message : 'Failed to save service');
    }
  };

  const deleteService = (id: string, name: string) => {
    Alert.alert('Delete service', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await api.deleteSellerService(token, id);
          invalidate();
        },
      },
    ]);
  };

  const addStaff = async () => {
    if (!staffName.trim()) {
      Alert.alert('Name required', 'Enter staff member name');
      return;
    }
    try {
      await api.addSellerStaff(token, {
        name: staffName.trim(),
        skills: staffSkills.trim() || undefined,
        gender: staffGender,
      });
      setShowStaffForm(false);
      setStaffName('');
      setStaffSkills('');
      setStaffGender('OTHER');
      invalidate();
    } catch (err) {
      Alert.alert('Error', err instanceof ApiError ? err.message : 'Failed to add staff');
    }
  };

  const deleteStaff = (id: string, name: string) => {
    Alert.alert('Remove staff', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await api.deleteSellerStaff(token, id);
          invalidate();
        },
      },
    ]);
  };

  if (isLoading) return <Screen loading />;

  if (error) {
    return (
      <Screen>
        <View className="items-center py-20">
          <Text className="text-stone-900 font-semibold mb-2">Could not load salon</Text>
          <Button label="Try again" onPress={() => refetch()} />
        </View>
      </Screen>
    );
  }

  const realStaff = countRealStaff(salon?.staff);
  const services = salon?.services ?? [];

  return (
    <Screen contentClassName="py-4">
      <Text className="text-3xl font-display font-bold text-stone-900 mb-1">Salon setup</Text>
      <Text className="text-stone-500 mb-6">Profile, services, and staff</Text>

      {/* Profile */}
      <View className="bg-white rounded-3xl p-6 border border-stone-200/60 mb-6">
        <Text className="text-lg font-display font-bold text-stone-900 mb-4">Profile</Text>
        {salonError ? (
          <Text className="text-red-600 text-sm mb-3">{salonError}</Text>
        ) : null}
        <Input
          label="Salon name"
          value={salonData.name}
          onChangeText={(name) => setSalonData({ ...salonData, name })}
          containerClassName="mb-4"
        />
        <Input
          label="Address"
          value={salonData.address}
          onChangeText={(address) => setSalonData({ ...salonData, address })}
          containerClassName="mb-4"
        />
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Input
              label="Opens"
              value={salonData.openTime}
              onChangeText={(openTime) => setSalonData({ ...salonData, openTime })}
            />
          </View>
          <View className="flex-1">
            <Input
              label="Closes"
              value={salonData.closeTime}
              onChangeText={(closeTime) => setSalonData({ ...salonData, closeTime })}
            />
          </View>
        </View>

        <WeeklyHoursEditor
          hours={weeklyHours}
          defaultOpen={salonData.openTime}
          defaultClose={salonData.closeTime}
          onChange={setWeeklyHours}
          onApplyDefault={() =>
            setWeeklyHours((prev) =>
              prev.map((d) =>
                d.isOpen
                  ? { ...d, startTime: salonData.openTime, endTime: salonData.closeTime }
                  : d,
              ),
            )
          }
        />

        <Text className="text-sm font-medium text-stone-700 mb-2">Primary category</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setPrimaryCategory(cat.id)}
              className={clsx(
                'px-3 py-2 rounded-xl border',
                primaryCategory === cat.id
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-white border-stone-200',
              )}
            >
              <Text className="text-sm font-medium text-stone-900">{cat.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text className="text-sm font-medium text-stone-700 mb-2">Related categories</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {CATEGORIES.filter((c) => c.id !== primaryCategory).map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => toggleRelatedCategory(cat.id)}
              className={clsx(
                'px-3 py-2 rounded-xl border',
                relatedCategories.includes(cat.id)
                  ? 'bg-stone-900 border-stone-900'
                  : 'bg-white border-stone-200',
              )}
            >
              <Text
                className={clsx(
                  'text-sm font-medium',
                  relatedCategories.includes(cat.id) ? 'text-white' : 'text-stone-900',
                )}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text className="text-sm font-medium text-stone-700 mb-2">Photos ({uploadedImages.length}/20)</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {uploadedImages.map((uri, index) => (
            <View key={`${uri}-${index}`} className="relative">
              <ExpoImage source={{ uri }} style={{ width: 72, height: 72, borderRadius: 12 }} />
              <Pressable
                onPress={() => setUploadedImages((prev) => prev.filter((_, i) => i !== index))}
                className="absolute -top-1 -right-1 bg-stone-900 rounded-full p-1"
              >
                <X size={12} color="#fff" />
              </Pressable>
            </View>
          ))}
          {uploadedImages.length < 20 ? (
            <Pressable
              onPress={pickImages}
              disabled={uploadingImages}
              className="w-[72px] h-[72px] rounded-xl border border-dashed border-stone-300 items-center justify-center bg-stone-50"
            >
              <Plus size={24} color="#a8a29e" />
            </Pressable>
          ) : null}
        </View>

        <Button
          label={saveSalonMutation.isPending ? 'Saving…' : 'Save salon profile'}
          fullWidth
          loading={saveSalonMutation.isPending}
          onPress={() => saveSalonMutation.mutate()}
        />
      </View>

      {/* Services */}
      <View className="bg-white rounded-3xl p-6 border border-stone-200/60 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-display font-bold text-stone-900">Services ({services.length})</Text>
          {!showServiceForm ? (
            <Pressable onPress={() => setShowServiceForm(true)} className="flex-row items-center gap-1">
              <Plus size={18} color="#1c1917" />
              <Text className="font-semibold text-stone-900">Add</Text>
            </Pressable>
          ) : null}
        </View>

        {showServiceForm ? (
          <View className="bg-stone-50 rounded-2xl p-4 mb-4 border border-stone-200">
            <Input
              label="Service name"
              value={serviceName}
              onChangeText={setServiceName}
              containerClassName="mb-3"
            />
            {serviceVariants.map((v, i) => (
              <View key={v.targetGender} className="mb-3">
                <Text className="text-xs font-bold text-stone-500 uppercase mb-1">{v.targetGender}</Text>
                <View className="flex-row gap-2">
                  <TextInput
                    className="flex-1 px-3 py-2 rounded-lg border border-stone-200 bg-white"
                    placeholder="Price ₹"
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
                    placeholder="Mins"
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
            <View className="flex-row gap-2">
              <Button label="Save" className="flex-1" onPress={saveService} />
              <Button label="Cancel" variant="outline" className="flex-1" onPress={resetServiceForm} />
            </View>
          </View>
        ) : null}

        {services.map((service) => (
          <Pressable
            key={service.id}
            onPress={() => openEditService(service)}
            className="flex-row items-center justify-between py-3 border-b border-stone-100"
          >
            <View className="flex-1">
              <Text className="font-semibold text-stone-900">{service.name}</Text>
              <Text className="text-stone-500 text-sm">
                {service.variants
                  .map((v) => `${v.targetGender}: ₹${v.price} · ${v.duration}m`)
                  .join(' · ')}
              </Text>
            </View>
            <Pressable onPress={() => deleteService(service.id, service.name)} hitSlop={8}>
              <Trash2 size={18} color="#dc2626" />
            </Pressable>
          </Pressable>
        ))}
        {!services.length ? (
          <Text className="text-stone-500 text-sm">No services yet. Add your menu above.</Text>
        ) : null}
      </View>

      {/* Staff */}
      <View className="bg-white rounded-3xl p-6 border border-stone-200/60 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-display font-bold text-stone-900">
            Staff ({realStaff.length})
          </Text>
          {!showStaffForm ? (
            <Pressable onPress={() => setShowStaffForm(true)} className="flex-row items-center gap-1">
              <Plus size={18} color="#1c1917" />
              <Text className="font-semibold text-stone-900">Add</Text>
            </Pressable>
          ) : null}
        </View>

        {showStaffForm ? (
          <View className="bg-stone-50 rounded-2xl p-4 mb-4 border border-stone-200">
            <Input label="Name" value={staffName} onChangeText={setStaffName} containerClassName="mb-3" />
            <Input
              label="Skills (optional)"
              value={staffSkills}
              onChangeText={setStaffSkills}
              containerClassName="mb-3"
            />
            <Text className="text-sm font-medium text-stone-700 mb-2">Gender</Text>
            <View className="flex-row gap-2 mb-4">
              {STAFF_GENDERS.map((g) => (
                <Pressable
                  key={g}
                  onPress={() => setStaffGender(g)}
                  className={clsx(
                    'flex-1 py-2 rounded-xl border items-center',
                    staffGender === g ? 'bg-amber-50 border-amber-300' : 'bg-white border-stone-200',
                  )}
                >
                  <Text className="text-sm font-bold text-stone-900">{g}</Text>
                </Pressable>
              ))}
            </View>
            <View className="flex-row gap-2">
              <Button label="Add staff" className="flex-1" onPress={addStaff} />
              <Button label="Cancel" variant="outline" className="flex-1" onPress={() => setShowStaffForm(false)} />
            </View>
          </View>
        ) : null}

        {realStaff.map((member) => (
          <View
            key={member.id}
            className="flex-row items-center justify-between py-3 border-b border-stone-100"
          >
            <View>
              <Text className="font-semibold text-stone-900">{member.name}</Text>
              {member.skills ? (
                <Text className="text-stone-500 text-sm">{member.skills}</Text>
              ) : null}
            </View>
            <Pressable onPress={() => deleteStaff(member.id, member.name)} hitSlop={8}>
              <Trash2 size={18} color="#dc2626" />
            </Pressable>
          </View>
        ))}
        {!realStaff.length ? (
          <Text className="text-stone-500 text-sm">No staff yet. Add team members above.</Text>
        ) : null}
      </View>
    </Screen>
  );
}
