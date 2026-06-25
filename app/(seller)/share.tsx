import { useQuery } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { Alert, Share, Text, View } from 'react-native';
import { Link2, QrCode, Share2 } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { buildSalonShareUrl } from '@/lib/routing';
import { getDefaultApiUrl } from '@/lib/theme';

export default function SellerShareScreen() {
  const token = useAuthStore((s) => s.token)!;

  const { data: salon, isLoading } = useQuery({
    queryKey: ['seller-salon', token],
    queryFn: () => api.getSellerSalon(token),
  });

  if (isLoading) return <Screen loading />;

  if (!salon) {
    return (
      <Screen contentClassName="py-4">
        <Text className="text-stone-500 text-center py-20">
          Set up your salon first to get a shareable booking link.
        </Text>
      </Screen>
    );
  }

  const salonUrl = buildSalonShareUrl(salon.id, getDefaultApiUrl());
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(salonUrl)}`;

  const copyLink = async () => {
    await Clipboard.setStringAsync(salonUrl);
    Alert.alert('Copied', 'Salon booking link copied to clipboard');
  };

  const shareLink = async () => {
    await Share.share({
      message: `Book an appointment at ${salon.name} on SalonBook!\n${salonUrl}`,
      url: salonUrl,
      title: salon.name,
    });
  };

  return (
    <Screen contentClassName="py-4">
      <Text className="text-3xl font-display font-bold text-stone-900 mb-1">Share & grow</Text>
      <Text className="text-stone-500 mb-6">Get more bookings from your shop and social media</Text>

      <View className="bg-white rounded-3xl p-6 border border-stone-200/60 mb-6 items-center">
        <QrCode size={24} color="#1c1917" />
        <Text className="text-lg font-display font-bold text-stone-900 mt-3 mb-1">{salon.name}</Text>
        <Text className="text-stone-500 text-sm text-center mb-4">
          Customers scan to book — pay at the shop
        </Text>
        <Image source={{ uri: qrUrl }} style={{ width: 200, height: 200, borderRadius: 16 }} />
        <Text className="text-xs text-stone-400 mt-4 text-center px-4" numberOfLines={2}>
          {salonUrl}
        </Text>
      </View>

      <View className="gap-3 mb-6">
        <Button label="Share link" fullWidth onPress={shareLink} />
        <Button label="Copy link" variant="outline" fullWidth onPress={copyLink} />
      </View>

      <View className="bg-stone-50 rounded-2xl p-5 border border-stone-200/60">
        <View className="flex-row items-center gap-2 mb-2">
          <Share2 size={18} color="#57534e" />
          <Text className="font-semibold text-stone-900">Marketing tips</Text>
        </View>
        <Text className="text-sm text-stone-600 mb-3">
          Print the QR code and place it at reception. Add your booking link to Instagram bio and WhatsApp status.
        </Text>
        <View className="flex-row items-start gap-2">
          <Link2 size={16} color="#a8a29e" />
          <Text className="text-xs text-stone-500 flex-1">
            &ldquo;Book your next appointment on SalonBook — pay at the shop!&rdquo;
          </Text>
        </View>
      </View>
    </Screen>
  );
}
