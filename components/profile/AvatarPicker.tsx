import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { Check, ImageOff } from 'lucide-react-native';

const AVATAR_SEEDS = ['Willow', 'Sage', 'Breezy', 'Nova', 'Luna'];

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

interface AvatarPickerProps {
  selected: string;
  onSelect: (seed: string) => void;
  hasRealPhoto?: boolean;
}

export function AvatarPicker({ selected, onSelect, hasRealPhoto = false }: AvatarPickerProps) {
  if (hasRealPhoto) {
    return (
      <View>
        <Text className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 ml-1">
          Choose Avatar
        </Text>
        <View className="flex-row items-center gap-2 bg-stone-50 rounded-2xl border border-stone-200 px-4 py-3">
          <ImageOff size={14} color="#78716c" />
          <Text className="text-xs text-stone-500 flex-1">
            Remove your photo to use a generated avatar instead.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <Text className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 ml-1">
        Choose Avatar
      </Text>
      <View className="flex-row gap-3 flex-wrap">
        {AVATAR_SEEDS.map((seed) => {
          const isSelected = selected === seed;
          return (
            <Pressable
              key={seed}
              onPress={() => onSelect(seed)}
              className={`items-center gap-1.5 p-1 rounded-2xl border-2 ${
                isSelected ? 'border-amber-400 bg-amber-50' : 'border-transparent'
              }`}
            >
              <View className="w-14 h-14 rounded-full overflow-hidden bg-stone-100 relative">
                <Image
                  source={{ uri: avatarUrl(seed) }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
                {isSelected ? (
                  <View className="absolute bottom-0 right-0 w-5 h-5 bg-amber-500 rounded-full items-center justify-center">
                    <Check size={10} color="#fff" />
                  </View>
                ) : null}
              </View>
              <Text className={`text-[10px] font-bold ${isSelected ? 'text-amber-800' : 'text-stone-400'}`}>
                {seed}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export { AVATAR_SEEDS };
