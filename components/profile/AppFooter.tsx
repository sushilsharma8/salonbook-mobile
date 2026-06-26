import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { Pressable, Text, View } from 'react-native';
import { ExternalLink, HeartHandshake, Lock, FileText } from 'lucide-react-native';
import { getDefaultApiUrl } from '@/lib/theme';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
const WEB_BASE = getDefaultApiUrl();
const SUPPORT_WHATSAPP =
  'https://wa.me/918283992627?text=' +
  encodeURIComponent('Hi SalonBook team, I need help with...');

interface FooterLinkProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}

function FooterLink({ icon, label, onPress }: FooterLinkProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between px-5 py-4 active:bg-stone-50"
    >
      <View className="flex-row items-center gap-3">
        <View className="w-8 h-8 bg-stone-100 rounded-lg items-center justify-center">
          {icon}
        </View>
        <Text className="text-base font-medium text-stone-800">{label}</Text>
      </View>
      <ExternalLink size={15} color="#a8a29e" />
    </Pressable>
  );
}

export function AppFooter() {
  return (
    <View className="mb-6">
      <Text className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 ml-1">
        Info & Legal
      </Text>
      <View className="bg-white rounded-3xl border border-stone-200/60 overflow-hidden">
        <FooterLink
          icon={<FileText size={16} color="#57534e" />}
          label="Terms of Service"
          onPress={() => Linking.openURL(`${WEB_BASE}/terms`)}
        />
        <View className="h-px bg-stone-100 mx-5" />
        <FooterLink
          icon={<Lock size={16} color="#57534e" />}
          label="Privacy Policy"
          onPress={() => Linking.openURL(`${WEB_BASE}/privacy`)}
        />
        <View className="h-px bg-stone-100 mx-5" />
        <FooterLink
          icon={<HeartHandshake size={16} color="#57534e" />}
          label="Contact Support"
          onPress={() => Linking.openURL(SUPPORT_WHATSAPP)}
        />
      </View>

      <Text className="text-center text-stone-400 text-xs mt-4">
        SalonBook v{APP_VERSION} · Made with ♥ in India
      </Text>
    </View>
  );
}
