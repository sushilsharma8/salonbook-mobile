import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Check, Info, X } from 'lucide-react-native';
import { clsx } from 'clsx';
import { Input } from '@/components/Input';
import { api, ApiError, type UserGender } from '@/lib/api';
import type { User } from '@/lib/api';
import { AvatarPicker } from './AvatarPicker';

const GENDERS: { value: UserGender; label: string }[] = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

interface EditProfileCardProps {
  user: User;
  token: string;
  avatarSeed: string;
  onAvatarSeedChange: (seed: string) => void;
  onSaved: (updated: User) => void;
  onCancel: () => void;
}

export function EditProfileCard({
  user,
  token,
  avatarSeed,
  onAvatarSeedChange,
  onSaved,
  onCancel,
}: EditProfileCardProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone || '',
    gender: (user.gender || '') as UserGender | '',
  });

  const handleSave = async () => {
    if (!form.gender) {
      Alert.alert('Gender required', 'Please select your gender for accurate pricing.');
      return;
    }
    setSaving(true);
    try {
      const updated = await api.updateProfile(token, {
        name: form.name.trim(),
        phone: form.phone,
        gender: form.gender,
      });
      onSaved(updated);
    } catch (err) {
      Alert.alert('Error', err instanceof ApiError ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="bg-white rounded-3xl border border-stone-200/60 mb-4 overflow-hidden">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-stone-100">
        <Text className="text-lg font-display font-bold text-stone-900">Edit Profile</Text>
        <View className="flex-row gap-2">
          <Pressable
            onPress={onCancel}
            className="p-2 bg-stone-100 rounded-xl"
          >
            <X size={18} color="#57534e" />
          </Pressable>
          <Pressable
            onPress={handleSave}
            disabled={saving}
            className={clsx('p-2 rounded-xl', saving ? 'bg-stone-300' : 'bg-stone-900')}
          >
            <Check size={18} color="#fff" />
          </Pressable>
        </View>
      </View>

      <View className="p-6 gap-5">
        {/* Avatar picker */}
        <AvatarPicker selected={avatarSeed} onSelect={onAvatarSeedChange} hasRealPhoto={!!user.avatarUrl} />

        {/* Divider */}
        <View className="h-px bg-stone-100" />

        {/* Full name */}
        <View>
          <Text className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1">
            Full Name
          </Text>
          <Input
            value={form.name}
            onChangeText={(name) => setForm({ ...form, name })}
            placeholder="Your full name"
          />
        </View>

        {/* Email (readonly) */}
        <View>
          <Text className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1">
            Email
          </Text>
          <View className="bg-stone-50 px-5 py-4 rounded-2xl border border-stone-100 opacity-60">
            <Text className="text-base font-medium text-stone-500">{user.email}</Text>
          </View>
        </View>

        {/* Phone */}
        <View>
          <Text className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1">
            Phone
          </Text>
          <Input
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(phone) =>
              setForm({ ...form, phone: phone.replace(/\D/g, '').slice(0, 10) })
            }
            placeholder="10-digit mobile number"
          />
        </View>

        {/* Gender */}
        <View>
          <Text className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1">
            Gender
          </Text>
          <View className="flex-row gap-2 mb-2">
            {GENDERS.map((g) => (
              <Pressable
                key={g.value}
                onPress={() => setForm({ ...form, gender: g.value })}
                className={clsx(
                  'flex-1 py-3 rounded-xl border items-center',
                  form.gender === g.value
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-white border-stone-200',
                )}
              >
                <Text className="font-bold text-sm text-stone-900">{g.label}</Text>
              </Pressable>
            ))}
          </View>
          {/* Gender pricing hint */}
          <View className="flex-row items-center gap-2 bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-100">
            <Info size={14} color="#92400e" />
            <Text className="text-xs text-amber-800 flex-1">
              Gender helps us show accurate service prices. Some services are priced differently for men and women.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
