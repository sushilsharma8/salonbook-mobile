import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';
import { Check, Edit2, User, X } from 'lucide-react-native';
import { clsx } from 'clsx';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { api, ApiError, type UserGender } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

const GENDERS: { value: UserGender; label: string }[] = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, token, setAuth, logout } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    gender: (user?.gender || '') as UserGender | '',
  });

  if (!user || !token) return null;

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
      await setAuth(updated, token);
      setEditing(false);
      Alert.alert('Success', 'Profile updated');
    } catch (err) {
      Alert.alert('Error', err instanceof ApiError ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(tabs)/explore');
  };

  return (
    <Screen contentClassName="py-4">
      <View className="bg-white rounded-3xl p-6 border border-stone-200/60">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center gap-4">
            <View className="w-14 h-14 bg-stone-100 rounded-full items-center justify-center border border-stone-200">
              <User size={28} color="#a8a29e" />
            </View>
            <View>
              <Text className="text-xl font-display font-bold text-stone-900">Profile</Text>
              <Text className="text-stone-500 text-sm">Your personal information</Text>
            </View>
          </View>
          {!editing ? (
            <Pressable
              onPress={() => setEditing(true)}
              className="flex-row items-center gap-1 px-4 py-2 bg-stone-100 rounded-xl"
            >
              <Edit2 size={16} color="#1c1917" />
              <Text className="font-bold text-stone-900 text-sm">Edit</Text>
            </Pressable>
          ) : (
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => {
                  setEditing(false);
                  setForm({
                    name: user.name,
                    phone: user.phone || '',
                    gender: user.gender || '',
                  });
                }}
                className="p-2 bg-stone-100 rounded-xl"
              >
                <X size={18} color="#57534e" />
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={saving}
                className="p-2 bg-stone-900 rounded-xl"
              >
                <Check size={18} color="#fff" />
              </Pressable>
            </View>
          )}
        </View>

        <View className="gap-5">
          <View>
            <Text className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1">
              Full Name
            </Text>
            {editing ? (
              <Input value={form.name} onChangeText={(name) => setForm({ ...form, name })} />
            ) : (
              <View className="bg-stone-50 px-5 py-4 rounded-2xl border border-stone-100">
                <Text className="text-lg font-medium text-stone-900">{user.name}</Text>
              </View>
            )}
          </View>

          <View>
            <Text className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1">
              Email
            </Text>
            <View className="bg-stone-50 px-5 py-4 rounded-2xl border border-stone-100 opacity-70">
              <Text className="text-lg font-medium text-stone-500">{user.email}</Text>
            </View>
          </View>

          <View>
            <Text className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1">
              Phone
            </Text>
            {editing ? (
              <Input
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(phone) => setForm({ ...form, phone: phone.replace(/\D/g, '').slice(0, 10) })}
              />
            ) : (
              <View className="bg-stone-50 px-5 py-4 rounded-2xl border border-stone-100">
                <Text className="text-lg font-medium text-stone-900">
                  {user.phone ? `+91 ${user.phone}` : '—'}
                </Text>
              </View>
            )}
          </View>

          <View>
            <Text className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1">
              Gender
            </Text>
            {editing ? (
              <View className="flex-row gap-2">
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
            ) : (
              <View className="bg-stone-50 px-5 py-4 rounded-2xl border border-stone-100">
                <Text className="text-lg font-medium text-stone-900 capitalize">
                  {user.gender?.toLowerCase() || '—'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <Button
        label="Log out"
        variant="outline"
        fullWidth
        className="mt-6"
        onPress={handleLogout}
      />
    </Screen>
  );
}
