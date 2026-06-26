import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { ArrowRight, Circle, Clock, MapPin, Star } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import type { SalonListItem } from '@/lib/api';
import { parseSalonImages } from '@/lib/api';
import { getDefaultApiUrl } from '@/lib/theme';
import { isSalonOpenNow, normalizeWeeklyHoursFromApi } from '@/lib/salonHours';

interface SalonCardProps {
  salon: SalonListItem;
}

export function SalonCard({ salon }: SalonCardProps) {
  const images = parseSalonImages(salon.images, getDefaultApiUrl());
  const imageUrl = images[0] || 'https://picsum.photos/seed/salon/400/300';
  const weeklyHours = normalizeWeeklyHoursFromApi(salon.hours, salon.openTime, salon.closeTime);
  const openNow = isSalonOpenNow(weeklyHours, salon.openTime, salon.closeTime);
  const hasRating = salon.avgRating != null;

  return (
    <Link href={`/salon/${salon.id}`} asChild>
      <Pressable className="bg-white rounded-3xl overflow-hidden border border-stone-200/60 mb-6 active:opacity-95">
        <View className="relative h-56 bg-stone-100">
          <Image
            source={{ uri: imageUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
          <View
            className={`absolute top-3 left-3 flex-row items-center gap-1.5 px-2.5 py-1 rounded-full border ${
              openNow
                ? 'bg-emerald-950/70 border-emerald-400/30'
                : 'bg-stone-950/70 border-stone-400/25'
            }`}
          >
            <Circle size={8} color={openNow ? '#34d399' : '#a8a29e'} fill={openNow ? '#34d399' : '#a8a29e'} />
            <Text className="text-[11px] font-bold text-white">{openNow ? 'Open now' : 'Closed'}</Text>
          </View>
          {hasRating ? (
            <View className="absolute top-3 right-3 flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 border border-white/60">
              <Star size={14} color="#f59e0b" fill="#fbbf24" />
              <Text className="text-xs font-bold text-stone-900">{salon.avgRating!.toFixed(1)}</Text>
            </View>
          ) : (
            <View className="absolute top-3 right-3 flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/92 border border-white/50">
              <Circle size={8} color="#a78bfa" fill="#a78bfa" />
              <Text className="text-[11px] font-bold text-stone-700">New</Text>
            </View>
          )}
        </View>
        <View className="p-5">
          <Text className="text-xl font-display font-bold text-stone-900 mb-3">{salon.name}</Text>
          <View className="gap-2 mb-5">
            <View className="flex-row items-start gap-2">
              <MapPin size={16} color="#a8a29e" style={{ marginTop: 2 }} />
              <Text className="text-sm text-stone-500 flex-1" numberOfLines={2}>
                {salon.address}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Clock size={16} color="#a8a29e" />
              <Text className="text-sm text-stone-500">
                {salon.openTime} - {salon.closeTime}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center justify-between pt-4 border-t border-stone-100">
            <View className="bg-stone-100 px-4 py-1.5 rounded-full">
              <Text className="text-sm font-medium text-stone-600">{salon.serviceCount} services</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Text className="text-stone-900 font-semibold">Book Now</Text>
              <ArrowRight size={16} color="#1c1917" />
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
