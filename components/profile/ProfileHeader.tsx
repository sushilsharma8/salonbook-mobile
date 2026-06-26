import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Camera, Edit2 } from 'lucide-react-native';
import type { User } from '@/lib/api';
import { resolveImageUrl } from '@/lib/api';
import { getDefaultApiUrl } from '@/lib/theme';

interface ProfileHeaderProps {
  user: User;
  avatarSeed: string;
  totalBookings: number;
  totalReviews: number;
  onEditPress: () => void;
  onAvatarPress: () => void;
  avatarUploading?: boolean;
}

export function ProfileHeader({
  user,
  avatarSeed,
  totalBookings,
  totalReviews,
  onEditPress,
  onAvatarPress,
  avatarUploading = false,
}: ProfileHeaderProps) {
  const dicebearUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(avatarSeed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  const photoUrl = user.avatarUrl
    ? resolveImageUrl(getDefaultApiUrl(), user.avatarUrl)
    : dicebearUrl;

  return (
    <View className="bg-white rounded-3xl border border-stone-200/60 overflow-hidden mb-4">
      {/* Gradient banner */}
      <View className="h-20 bg-amber-50 border-b border-amber-100" />

      <View className="px-6 pb-6">
        {/* Avatar row */}
        <View className="flex-row items-end justify-between -mt-10 mb-4">
          <Pressable onPress={onAvatarPress} className="relative">
            <View className="w-20 h-20 rounded-full border-4 border-white bg-stone-100 overflow-hidden shadow-md">
              {avatarUploading ? (
                <View className="flex-1 items-center justify-center bg-stone-200">
                  <ActivityIndicator size="small" color="#92400e" />
                </View>
              ) : (
                <Image
                  source={{ uri: photoUrl }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              )}
            </View>
            {/* Camera icon badge */}
            <View className="absolute bottom-0 right-0 w-6 h-6 bg-amber-500 rounded-full items-center justify-center border-2 border-white">
              <Camera size={11} color="#fff" />
            </View>
          </Pressable>
          <Pressable
            onPress={onEditPress}
            className="flex-row items-center gap-1.5 px-4 py-2 bg-stone-100 rounded-xl border border-stone-200 mb-1"
          >
            <Edit2 size={14} color="#1c1917" />
            <Text className="font-bold text-stone-900 text-sm">Edit Profile</Text>
          </Pressable>
        </View>

        {/* Name & badge */}
        <View className="mb-5">
          <Text className="text-2xl font-display font-bold text-stone-900">{user.name}</Text>
          <View className="flex-row items-center gap-2 mt-1">
            <View className="bg-amber-100 px-3 py-0.5 rounded-full">
              <Text className="text-xs font-bold text-amber-800 uppercase tracking-wide">Customer</Text>
            </View>
            {user.email ? (
              <Text className="text-stone-400 text-sm" numberOfLines={1}>{user.email}</Text>
            ) : null}
          </View>
        </View>

        {/* Micro-stats */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-stone-50 rounded-2xl border border-stone-100 p-4 items-center">
            <Text className="text-2xl font-display font-bold text-stone-900">{totalBookings}</Text>
            <Text className="text-[10px] font-bold text-stone-500 uppercase tracking-wide mt-1">Bookings</Text>
          </View>
          <View className="flex-1 bg-stone-50 rounded-2xl border border-stone-100 p-4 items-center">
            <Text className="text-2xl font-display font-bold text-stone-900">{totalReviews}</Text>
            <Text className="text-[10px] font-bold text-stone-500 uppercase tracking-wide mt-1">Reviews</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
