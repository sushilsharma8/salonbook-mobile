import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { api, ApiError } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { getHomeRoute } from '@/lib/routing';
import { Link, useRouter } from 'expo-router';
import { Scissors, ShieldCheck, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.login(email.trim(), password);
      await login(data.user, data.token);
      router.replace(getHomeRoute(data.user.role));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentClassName="py-6">
      <View className="bg-stone-900 rounded-3xl p-6 mb-6">
        <View className="w-12 h-12 rounded-2xl bg-white/10 items-center justify-center mb-4">
          <ShieldCheck size={24} color="#fff" />
        </View>
        <Text className="text-2xl font-display font-bold text-white mb-2">Welcome Back</Text>
        <Text className="text-stone-300 text-sm mb-6">
          Sign in to manage bookings, your salon, or the platform.
        </Text>
        <View className="gap-2">
          <View className="bg-white/10 rounded-xl px-4 py-3 flex-row items-center gap-2">
            <Sparkles size={16} color="#fff" />
            <Text className="text-white text-sm">Personalized booking flow</Text>
          </View>
          <View className="bg-white/10 rounded-xl px-4 py-3 flex-row items-center gap-2">
            <Scissors size={16} color="#fff" />
            <Text className="text-white text-sm">Track upcoming appointments</Text>
          </View>
        </View>
      </View>

      <View className="bg-white rounded-3xl p-6 border border-stone-200/60">
        <Text className="text-3xl font-display font-bold text-stone-900 mb-1">Sign In</Text>
        <Text className="text-stone-500 mb-6">Continue where you left off.</Text>

        {error ? (
          <View className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
            <Text className="text-red-600 text-sm text-center">{error}</Text>
          </View>
        ) : null}

        <Input
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          containerClassName="mb-4"
        />
        <Input
          label="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          containerClassName="mb-6"
        />

        <Button label={loading ? 'Signing in…' : 'Sign In'} loading={loading} fullWidth onPress={handleSubmit} />

        <Text className="text-center text-stone-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-stone-900 font-semibold">
            Sign up
          </Link>
        </Text>
      </View>
    </Screen>
  );
}
