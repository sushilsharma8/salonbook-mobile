import { Switch, Text, View } from 'react-native';

interface Preference {
  key: string;
  label: string;
  sublabel: string;
}

const PREFS: Preference[] = [
  {
    key: 'whatsappUpdates',
    label: 'WhatsApp Booking Updates',
    sublabel: 'Get booking confirmations via WhatsApp',
  },
  {
    key: 'showPrices',
    label: 'Show Prices in Listing',
    sublabel: 'Display service prices on salon cards',
  },
];

interface PreferencesSectionProps {
  prefs: Record<string, boolean>;
  onToggle: (key: string, value: boolean) => void;
}

export function PreferencesSection({ prefs, onToggle }: PreferencesSectionProps) {
  return (
    <View className="mb-4">
      <Text className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 ml-1">
        Preferences
      </Text>
      <View className="bg-white rounded-3xl border border-stone-200/60 overflow-hidden">
        {PREFS.map((pref, i) => (
          <View
            key={pref.key}
            className={`flex-row items-center justify-between px-5 py-4 ${
              i < PREFS.length - 1 ? 'border-b border-stone-100' : ''
            }`}
          >
            <View className="flex-1 pr-4">
              <Text className="text-base font-semibold text-stone-900">{pref.label}</Text>
              <Text className="text-xs text-stone-400 mt-0.5">{pref.sublabel}</Text>
            </View>
            <Switch
              value={!!prefs[pref.key]}
              onValueChange={(val) => onToggle(pref.key, val)}
              trackColor={{ false: '#e7e5e4', true: '#f59e0b' }}
              thumbColor="#fff"
            />
          </View>
        ))}
      </View>
    </View>
  );
}
