import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { User } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useAuthStore } from '@/lib/auth-store';

export default function SellerProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.replace('/(tabs)/explore');
  };

  return (
    <Screen contentClassName="py-4">
      <View className="bg-white rounded-3xl p-6 border border-stone-200/60">
        <View className="flex-row items-center gap-4 mb-6">
          <View className="w-14 h-14 bg-amber-50 rounded-full items-center justify-center border border-amber-200">
            <User size={28} color="#1c1917" />
          </View>
          <View>
            <Text className="text-xl font-display font-bold text-stone-900">{user.name}</Text>
            <Text className="text-stone-500 text-sm">{user.email}</Text>
            <Text className="text-xs font-bold text-amber-700 uppercase mt-1">Seller</Text>
          </View>
        </View>
        {user.phone ? (
          <View className="bg-stone-50 px-4 py-3 rounded-xl mb-4">
            <Text className="text-stone-500 text-xs uppercase font-bold mb-1">Phone</Text>
            <Text className="text-stone-900">+91 {user.phone}</Text>
          </View>
        ) : null}
      </View>
      <Button label="Log out" variant="outline" fullWidth className="mt-6" onPress={handleLogout} />
    </Screen>
  );
}
