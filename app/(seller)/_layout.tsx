import { Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { Calendar, LayoutDashboard, Share2, Store, User } from 'lucide-react-native';
import { useAuthStore } from '@/lib/auth-store';

function SellerGateFallback() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafaf9' }}>
      <ActivityIndicator size="large" color="#1c1917" />
    </View>
  );
}

export default function SellerTabLayout() {
  const { user, hydrated } = useAuthStore();

  if (!hydrated || !user || user.role !== 'SELLER') {
    return <SellerGateFallback />;
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
        name="salon"
        options={{
          title: 'Salon',
          tabBarIcon: ({ color, size }) => <Store color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="share"
        options={{
          title: 'Share',
          tabBarIcon: ({ color, size }) => <Share2 color={color} size={size} />,
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
