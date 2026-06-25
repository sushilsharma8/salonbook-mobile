import { clsx } from 'clsx';
import { Pressable, Text, View } from 'react-native';
import type { Service, UserGender } from '@/lib/api';
import { getDisplayVariant } from '@/lib/api';

interface ServiceRowProps {
  service: Service;
  selected: boolean;
  gender?: UserGender | null;
  onPress: () => void;
}

export function ServiceRow({ service, selected, gender, onPress }: ServiceRowProps) {
  const variant = getDisplayVariant(service, gender);

  return (
    <Pressable
      onPress={onPress}
      className={clsx(
        'p-4 rounded-2xl border-2 flex-row items-center justify-between mb-3',
        selected ? 'border-stone-900 bg-stone-50' : 'border-stone-100 bg-white',
      )}
    >
      <View className="flex-1 pr-3">
        <Text className="font-bold text-stone-900 text-base">{service.name}</Text>
        <Text className="text-sm text-stone-500 mt-1">
          {variant?.duration ? `${variant.duration} mins` : gender ? 'Duration depends on profile' : '—'}
        </Text>
      </View>
      <Text className="font-bold text-stone-900 text-lg">
        {variant?.price != null ? `₹${variant.price}` : gender ? 'Profile based' : '—'}
      </Text>
    </Pressable>
  );
}
