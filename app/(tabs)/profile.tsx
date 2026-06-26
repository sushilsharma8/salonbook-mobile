import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActionSheetIOS, Alert, Platform, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { QuickActions } from '@/components/profile/QuickActions';
import { EditProfileCard } from '@/components/profile/EditProfileCard';
import { PreferencesSection } from '@/components/profile/PreferencesSection';
import { StatsCard } from '@/components/profile/StatsCard';
import { RecentlyVisited } from '@/components/profile/RecentlyVisited';
import { AppFooter } from '@/components/profile/AppFooter';
import { api, ApiError, normalizeMyBookings, type User } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

const AVATAR_SEED_KEY = 'salonbook_avatar_seed';
const PREFS_KEY = 'salonbook_prefs';

const DEFAULT_PREFS: Record<string, boolean> = {
  whatsappUpdates: true,
  showPrices: true,
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, token, hydrated, setAuth, logout } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState<string>('');
  const [prefs, setPrefs] = useState<Record<string, boolean>>(DEFAULT_PREFS);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Load persisted preferences & avatar seed
  useEffect(() => {
    (async () => {
      const [seed, prefsRaw] = await Promise.all([
        AsyncStorage.getItem(AVATAR_SEED_KEY),
        AsyncStorage.getItem(PREFS_KEY),
      ]);
      if (seed) setAvatarSeed(seed);
      if (prefsRaw) {
        try {
          setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(prefsRaw) });
        } catch {}
      }
    })();
  }, []);

  // Initialise avatar seed from user name when not yet set
  useEffect(() => {
    if (user && !avatarSeed) {
      const seed = user.name || 'default';
      setAvatarSeed(seed);
      AsyncStorage.setItem(AVATAR_SEED_KEY, seed).catch(() => {});
    }
  }, [user, avatarSeed]);

  const handleAvatarSeedChange = useCallback(async (seed: string) => {
    setAvatarSeed(seed);
    await AsyncStorage.setItem(AVATAR_SEED_KEY, seed).catch(() => {});
  }, []);

  const handlePrefToggle = useCallback(async (key: string, value: boolean) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const pickAndUploadAvatar = useCallback(
    async (source: 'camera' | 'library') => {
      if (!token) return;

      let pickerResult: ImagePicker.ImagePickerResult;

      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Camera access is needed to take a photo.');
          return;
        }
        pickerResult = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Photo library access is needed to choose a photo.');
          return;
        }
        pickerResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
      }

      if (pickerResult.canceled || !pickerResult.assets?.length) return;

      const asset = pickerResult.assets[0];

      setAvatarUploading(true);
      try {
        // Resize + compress to max 512px, JPEG 0.7 quality
        const manipulated = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: 512, height: 512 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
        );

        const updated = await api.uploadUserAvatar(token, {
          uri: manipulated.uri,
          name: `avatar-${Date.now()}.jpg`,
          type: 'image/jpeg',
        });

        await setAuth(updated, token);
      } catch (err) {
        Alert.alert('Upload failed', err instanceof ApiError ? err.message : 'Could not upload photo.');
      } finally {
        setAvatarUploading(false);
      }
    },
    [token, setAuth],
  );

  const handleRemoveAvatar = useCallback(async () => {
    if (!token) return;
    setAvatarUploading(true);
    try {
      const updated = await api.deleteUserAvatar(token);
      await setAuth(updated, token);
    } catch (err) {
      Alert.alert('Error', err instanceof ApiError ? err.message : 'Could not remove photo.');
    } finally {
      setAvatarUploading(false);
    }
  }, [token, setAuth]);

  const handleAvatarPress = useCallback(() => {
    const hasPhoto = !!user?.avatarUrl;
    const options = hasPhoto
      ? ['Take Photo', 'Choose from Library', 'Remove Photo', 'Cancel']
      : ['Take Photo', 'Choose from Library', 'Cancel'];
    const cancelIndex = options.length - 1;
    const destructiveIndex = hasPhoto ? 2 : undefined;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: cancelIndex,
          destructiveButtonIndex: destructiveIndex,
          title: 'Profile Photo',
        },
        (index) => {
          if (index === 0) pickAndUploadAvatar('camera');
          else if (index === 1) pickAndUploadAvatar('library');
          else if (hasPhoto && index === 2) handleRemoveAvatar();
        },
      );
    } else {
      const androidOptions: { text: string; onPress?: () => void; style?: 'destructive' | 'cancel' }[] = [
        { text: 'Take Photo', onPress: () => pickAndUploadAvatar('camera') },
        { text: 'Choose from Library', onPress: () => pickAndUploadAvatar('library') },
      ];
      if (hasPhoto) {
        androidOptions.push({ text: 'Remove Photo', style: 'destructive', onPress: handleRemoveAvatar });
      }
      androidOptions.push({ text: 'Cancel', style: 'cancel' });
      Alert.alert('Profile Photo', undefined, androidOptions);
    }
  }, [user, pickAndUploadAvatar, handleRemoveAvatar]);

  // Bookings data
  const { data: bookingsData } = useQuery({
    queryKey: ['my-bookings', token],
    queryFn: () => api.getMyBookings(token!).then(normalizeMyBookings),
    enabled: !!token,
    staleTime: 60_000,
  });

  const bookings = bookingsData?.bookings ?? [];
  const reviews = bookingsData?.reviews ?? [];

  const totalBookings = bookings.length;
  const totalReviews = reviews.length;
  const completed = bookings.filter((b) => b.status === 'COMPLETED').length;
  const cancelled = bookings.filter((b) => b.status === 'CANCELLED').length;
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');

  const handleSaved = useCallback(
    async (updated: User) => {
      await setAuth(updated, token!);
      setEditing(false);
      Alert.alert('Saved', 'Your profile has been updated.');
    },
    [token, setAuth],
  );

  const handleLogout = async () => {
    await logout();
    router.replace('/(tabs)/explore');
  };

  if (!hydrated) return <Screen loading />;
  if (!user || !token) return <Screen loading />;

  return (
    <Screen contentClassName="py-4">
      {editing ? (
        <EditProfileCard
          user={user}
          token={token}
          avatarSeed={avatarSeed}
          onAvatarSeedChange={handleAvatarSeedChange}
          onSaved={handleSaved}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <ProfileHeader
          user={user}
          avatarSeed={avatarSeed}
          totalBookings={totalBookings}
          totalReviews={totalReviews}
          onEditPress={() => setEditing(true)}
          onAvatarPress={handleAvatarPress}
          avatarUploading={avatarUploading}
        />
      )}

      {!editing && (
        <>
          <QuickActions />

          <StatsCard
            totalBookings={totalBookings}
            completed={completed}
            cancelled={cancelled}
            reviews={totalReviews}
          />

          <RecentlyVisited completedBookings={completedBookings} />

          <PreferencesSection prefs={prefs} onToggle={handlePrefToggle} />

          {/* Profile info (collapsed view) */}
          <View className="bg-white rounded-3xl border border-stone-200/60 mb-4 overflow-hidden">
            <View className="px-6 py-4 border-b border-stone-100">
              <Text className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Account Details
              </Text>
            </View>
            <View className="px-6 py-4 gap-4">
              <InfoRow label="Email" value={user.email} />
              <View className="h-px bg-stone-100" />
              <InfoRow
                label="Phone"
                value={user.phone ? `+91 ${user.phone}` : 'Not added'}
                muted={!user.phone}
              />
              <View className="h-px bg-stone-100" />
              <InfoRow
                label="Gender"
                value={user.gender
                  ? user.gender.charAt(0) + user.gender.slice(1).toLowerCase()
                  : 'Not set'}
                muted={!user.gender}
              />
            </View>
          </View>

          <AppFooter />

          <Button
            label="Log out"
            variant="outline"
            fullWidth
            className="mb-2"
            onPress={handleLogout}
          />
        </>
      )}
    </Screen>
  );
}

function InfoRow({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm font-semibold text-stone-500">{label}</Text>
      <Text className={`text-sm font-medium ${muted ? 'text-stone-400' : 'text-stone-900'}`}>
        {value}
      </Text>
    </View>
  );
}
