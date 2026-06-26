import { Pressable, Share, Text, View } from 'react-native';
import { Calendar, Star, Store, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface Tile {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  onPress: () => void;
  accent?: boolean;
}

function ActionTile({ icon, label, sublabel, onPress, accent }: Tile) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 rounded-2xl p-4 border ${
        accent
          ? 'bg-amber-50 border-amber-200 active:bg-amber-100'
          : 'bg-white border-stone-200/60 active:bg-stone-50'
      }`}
    >
      <View className={`w-9 h-9 rounded-xl items-center justify-center mb-3 ${accent ? 'bg-amber-200' : 'bg-stone-100'}`}>
        {icon}
      </View>
      <Text className="text-sm font-bold text-stone-900">{label}</Text>
      <Text className="text-[11px] text-stone-400 mt-0.5">{sublabel}</Text>
    </Pressable>
  );
}

export function QuickActions() {
  const router = useRouter();

  const handleInvite = () => {
    Share.share({
      message:
        'Book your salon appointments easily with SalonBook! Find top salons near you, pick a time, and you\'re done. Download the app and never miss your beauty routine. 💇‍♀️✂️',
      title: 'Invite friends to SalonBook',
    });
  };

  return (
    <View className="mb-4">
      <Text className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 ml-1">
        Quick Actions
      </Text>
      <View className="flex-row gap-3 mb-3">
        <ActionTile
          icon={<Calendar size={18} color="#1c1917" />}
          label="My Bookings"
          sublabel="View appointments"
          onPress={() => router.push('/(tabs)/bookings')}
        />
        <ActionTile
          icon={<Store size={18} color="#1c1917" />}
          label="Explore Salons"
          sublabel="Discover nearby"
          onPress={() => router.push('/(tabs)/explore')}
        />
      </View>
      <View className="flex-row gap-3">
        <ActionTile
          icon={<Star size={18} color="#92400e" />}
          label="Leave a Review"
          sublabel="Rate past visits"
          onPress={() => router.push('/(tabs)/bookings')}
          accent
        />
        <ActionTile
          icon={<Users size={18} color="#1c1917" />}
          label="Invite Friends"
          sublabel="Share SalonBook"
          onPress={handleInvite}
        />
      </View>
    </View>
  );
}
