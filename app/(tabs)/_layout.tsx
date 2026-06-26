import { useAuthStore } from '@/lib/auth-store';
import { Tabs, useRouter } from 'expo-router';
import { Calendar, Search, User } from 'lucide-react-native';

export default function TabLayout() {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();
  const authed = hydrated && !!user;

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
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        listeners={{
          tabPress: (e) => {
            if (!authed) {
              e.preventDefault();
              router.push('/login');
            }
          },
        }}
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        listeners={{
          tabPress: (e) => {
            if (!authed) {
              e.preventDefault();
              router.push('/login');
            }
          },
        }}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
