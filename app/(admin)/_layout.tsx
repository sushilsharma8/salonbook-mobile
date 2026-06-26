import { useAuthStore } from '@/lib/auth-store';
import { Tabs } from 'expo-router';
import { LayoutDashboard, Scissors, User, Users } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

function AdminGateFallback() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafaf9' }}>
      <ActivityIndicator size="large" color="#1c1917" />
    </View>
  );
}

export default function AdminTabLayout() {
  const { user, hydrated } = useAuthStore();

  if (!hydrated || !user || user.role !== 'ADMIN') {
    return <AdminGateFallback />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1c1917',
        tabBarInactiveTintColor: '#a8a29e',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: 'rgba(231, 229, 228, 0.8)',
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="salons"
        options={{
          title: 'Salons',
          tabBarIcon: ({ color, size }) => <Scissors color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
