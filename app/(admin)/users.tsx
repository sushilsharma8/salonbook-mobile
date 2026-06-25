import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { RotateCcw, Trash2 } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { api, ApiError, type AdminUser } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

export default function AdminUsersScreen() {
  const token = useAuthStore((s) => s.token)!;
  const queryClient = useQueryClient();
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');

  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users', token],
    queryFn: () => api.getAdminUsers(token),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteAdminUser(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => api.reactivateAdminUser(token, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const resetMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      api.resetAdminUserPassword(token, id, password),
    onSuccess: () => {
      setResetUser(null);
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password reset');
    },
    onError: (err) => {
      setResetError(err instanceof ApiError ? err.message : 'Failed to reset password');
    },
  });

  const handleDelete = (user: AdminUser) => {
    if (user.role === 'ADMIN') return;
    Alert.alert('Delete user', `Delete ${user.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(user.id),
      },
    ]);
  };

  const handleReset = () => {
    if (!resetUser) return;
    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }
    setResetError('');
    resetMutation.mutate({ id: resetUser.id, password: newPassword });
  };

  if (isLoading) return <Screen loading />;

  if (error) {
    return (
      <Screen>
        <Text className="text-center text-stone-500 py-20">{(error as Error).message}</Text>
        <Button label="Retry" onPress={() => refetch()} />
      </Screen>
    );
  }

  return (
    <Screen contentClassName="py-4">
      <Text className="text-3xl font-display font-bold text-stone-900 mb-1">Users</Text>
      <Text className="text-stone-500 mb-6">{users.length} registered users</Text>

      {resetUser ? (
        <View className="bg-white rounded-2xl p-5 border border-stone-200/60 mb-6">
          <Text className="font-display font-bold text-stone-900 mb-3">
            Reset password for {resetUser.name}
          </Text>
          <Input
            label="New password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            containerClassName="mb-3"
          />
          <Input
            label="Confirm password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            containerClassName="mb-3"
          />
          {resetError ? <Text className="text-red-600 text-sm mb-2">{resetError}</Text> : null}
          <View className="flex-row gap-2">
            <Button
              label="Reset"
              className="flex-1"
              loading={resetMutation.isPending}
              onPress={handleReset}
            />
            <Button
              label="Cancel"
              variant="outline"
              className="flex-1"
              onPress={() => {
                setResetUser(null);
                setResetError('');
              }}
            />
          </View>
        </View>
      ) : null}

      {users.map((user) => (
        <View
          key={user.id}
          className="bg-white rounded-2xl p-4 border border-stone-200/60 mb-3"
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="font-semibold text-stone-900">{user.name}</Text>
              <Text className="text-stone-500 text-sm">{user.email}</Text>
              <View className="flex-row items-center gap-2 mt-2">
                <Text className="text-xs font-bold uppercase text-stone-600">{user.role}</Text>
                {!user.isActive ? (
                  <Text className="text-xs font-bold uppercase text-red-600">Inactive</Text>
                ) : null}
                {user.noShowCount > 0 ? (
                  <Text className="text-xs text-stone-400">{user.noShowCount} no-shows</Text>
                ) : null}
              </View>
            </View>
            {user.role !== 'ADMIN' ? (
              <View className="flex-row gap-2">
                {!user.isActive ? (
                  <Pressable
                    onPress={() => reactivateMutation.mutate(user.id)}
                    className="p-2 bg-emerald-50 rounded-lg"
                  >
                    <RotateCcw size={18} color="#059669" />
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={() => {
                    setResetUser(user);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="px-3 py-2 bg-stone-100 rounded-lg"
                >
                  <Text className="text-xs font-bold text-stone-700">Reset pwd</Text>
                </Pressable>
                <Pressable onPress={() => handleDelete(user)} className="p-2 bg-red-50 rounded-lg">
                  <Trash2 size={18} color="#dc2626" />
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
      ))}
    </Screen>
  );
}
