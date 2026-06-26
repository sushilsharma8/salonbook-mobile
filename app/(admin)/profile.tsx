import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'expo-router';
import { Shield } from 'lucide-react-native';
import { Text, View } from 'react-native';

export default function AdminProfileScreen() {
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
          <View className="w-14 h-14 bg-stone-900 rounded-full items-center justify-center">
            <Shield size={28} color="#fff" />
          </View>
          <View>
            <Text className="text-xl font-display font-bold text-stone-900">{user.name}</Text>
            <Text className="text-stone-500 text-sm">{user.email}</Text>
            <Text className="text-xs font-bold text-stone-700 uppercase mt-1">Administrator</Text>
          </View>
        </View>
      </View>
      <Button label="Log out" variant="outline" fullWidth className="mt-6" onPress={handleLogout} />
    </Screen>
  );
}
