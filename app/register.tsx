import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Sparkles, Store, UserRound } from 'lucide-react-native';
import { clsx } from 'clsx';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { api, ApiError, type UserGender } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { getHomeRoute } from '@/lib/routing';

const GENDERS: { value: UserGender; label: string }[] = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

type AccountType = 'CUSTOMER' | 'SELLER';

export default function RegisterScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [accountType, setAccountType] = useState<AccountType>('CUSTOMER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<UserGender | ''>('');
  const [phoneError, setPhoneError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) {
      setPhoneError('Phone number is required');
      return false;
    }
    if (digits.length !== 10) {
      setPhoneError('Enter a valid 10-digit mobile number');
      return false;
    }
    if (!/^[6-9]/.test(digits)) {
      setPhoneError('Indian mobile numbers start with 6-9');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
    if (digits.length > 0) validatePhone(digits);
    else setPhoneError('');
  };

  const handleSubmit = async () => {
    setError('');
    if (!name.trim() || name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (!validatePhone(phone)) return;
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (accountType === 'CUSTOMER' && !gender) {
      setError('Please select gender to continue');
      return;
    }

    setLoading(true);
    try {
      const data = await api.register({
        name: name.trim(),
        email: email.trim(),
        phone,
        password,
        role: accountType,
        ...(gender ? { gender } : {}),
      });
      await login(data.user, data.token);
      router.replace(getHomeRoute(data.user.role));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentClassName="py-6">
      <View
        className={clsx(
          'rounded-3xl p-6 mb-6 border',
          accountType === 'CUSTOMER'
            ? 'bg-amber-50 border-amber-200'
            : 'bg-stone-900 border-stone-800',
        )}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View
            className={clsx(
              'w-12 h-12 rounded-2xl items-center justify-center border',
              accountType === 'CUSTOMER'
                ? 'bg-white border-amber-200'
                : 'bg-white/10 border-white/20',
            )}
          >
            {accountType === 'CUSTOMER' ? (
              <UserRound size={24} color="#1c1917" />
            ) : (
              <Store size={24} color="#fff" />
            )}
          </View>
          <View className="flex-row items-center gap-1">
            <Sparkles size={14} color={accountType === 'CUSTOMER' ? '#1c1917' : '#fff'} />
            <Text
              className={clsx(
                'text-xs font-bold uppercase tracking-wider',
                accountType === 'CUSTOMER' ? 'text-stone-700' : 'text-stone-200',
              )}
            >
              {accountType === 'CUSTOMER' ? 'Customer' : 'Seller'}
            </Text>
          </View>
        </View>
        <Text
          className={clsx(
            'text-2xl font-display font-bold mb-2',
            accountType === 'CUSTOMER' ? 'text-stone-900' : 'text-white',
          )}
        >
          {accountType === 'CUSTOMER' ? 'Start booking your glow-ups' : 'List your salon on SalonBook'}
        </Text>
        <Text className={clsx('text-sm', accountType === 'CUSTOMER' ? 'text-stone-600' : 'text-stone-300')}>
          {accountType === 'CUSTOMER'
            ? 'Create your account to discover salons and book instantly.'
            : 'Create a seller account to manage your salon and bookings.'}
        </Text>
      </View>

      <View className="bg-white rounded-3xl p-6 border border-stone-200/60">
        <Text className="text-3xl font-display font-bold text-stone-900 mb-1">Create Account</Text>
        <Text className="text-stone-500 mb-4">Choose account type and fill in your details.</Text>

        <Text className="text-sm font-medium text-stone-700 mb-2">Account type</Text>
        <View className="flex-row gap-2 mb-6">
          {(['CUSTOMER', 'SELLER'] as AccountType[]).map((type) => (
            <Pressable
              key={type}
              onPress={() => setAccountType(type)}
              className={clsx(
                'flex-1 py-3 rounded-xl border items-center',
                accountType === type ? 'bg-amber-50 border-amber-300' : 'bg-white border-stone-200',
              )}
            >
              <Text className="font-bold text-sm text-stone-900 capitalize">{type.toLowerCase()}</Text>
            </Pressable>
          ))}
        </View>

        {error ? (
          <View className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
            <Text className="text-red-600 text-sm text-center">{error}</Text>
          </View>
        ) : null}

        <View className="mb-4">
          <Text className="text-sm font-medium text-stone-700 mb-2">WhatsApp Number *</Text>
          <View className="flex-row items-center">
            <View className="px-4 py-3.5 rounded-l-xl border border-r-0 border-stone-200 bg-stone-100 justify-center h-[52px]">
              <Text className="font-bold text-stone-600">+91</Text>
            </View>
            <TextInput
              className="flex-1 px-4 py-3.5 rounded-r-xl border border-stone-200 bg-stone-50/80 text-stone-900 text-base h-[52px]"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={handlePhoneChange}
              placeholder="9876543210"
              placeholderTextColor="#a8a29e"
            />
          </View>
          {phoneError ? <Text className="text-red-600 text-sm mt-1">{phoneError}</Text> : null}
        </View>

        <Input label="Full Name" value={name} onChangeText={setName} containerClassName="mb-4" />
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
          containerClassName="mb-4"
        />

        {accountType === 'CUSTOMER' ? (
          <>
            <Text className="text-sm font-medium text-stone-700 mb-2">Gender *</Text>
            <View className="flex-row gap-2 mb-6">
              {GENDERS.map((g) => (
                <Pressable
                  key={g.value}
                  onPress={() => setGender(g.value)}
                  className={clsx(
                    'flex-1 py-3 rounded-xl border items-center',
                    gender === g.value ? 'bg-amber-50 border-amber-300' : 'bg-white border-stone-200',
                  )}
                >
                  <Text className="font-bold text-sm text-stone-900">{g.label}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <View className="mb-6" />
        )}

        <Button
          label={loading ? 'Creating account…' : 'Create Account'}
          variant="amber"
          loading={loading}
          fullWidth
          onPress={handleSubmit}
        />

        <Text className="text-center text-stone-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-stone-900 font-semibold">
            Sign in
          </Link>
        </Text>
      </View>
    </Screen>
  );
}
