import { Text, View } from 'react-native';
import { CheckCircle, XCircle, Star, Calendar } from 'lucide-react-native';

interface StatsCardProps {
  totalBookings: number;
  completed: number;
  cancelled: number;
  reviews: number;
}

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  accent?: string;
}

function StatItem({ icon, value, label, accent }: StatItemProps) {
  return (
    <View className={`flex-1 items-center py-4 px-2 rounded-2xl border ${accent || 'bg-stone-50 border-stone-100'}`}>
      <View className="mb-2">{icon}</View>
      <Text className="text-2xl font-display font-bold text-stone-900">{value}</Text>
      <Text className="text-[10px] font-bold text-stone-500 uppercase tracking-wide mt-1 text-center">
        {label}
      </Text>
    </View>
  );
}

export function StatsCard({ totalBookings, completed, cancelled, reviews }: StatsCardProps) {
  return (
    <View className="mb-4">
      <Text className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 ml-1">
        Your SalonBook Journey
      </Text>
      <View className="flex-row gap-2">
        <StatItem
          icon={<Calendar size={18} color="#78716c" />}
          value={totalBookings}
          label="Total"
        />
        <StatItem
          icon={<CheckCircle size={18} color="#059669" />}
          value={completed}
          label="Visited"
          accent="bg-emerald-50 border-emerald-100"
        />
        <StatItem
          icon={<XCircle size={18} color="#dc2626" />}
          value={cancelled}
          label="Cancelled"
          accent="bg-red-50 border-red-100"
        />
        <StatItem
          icon={<Star size={18} color="#d97706" />}
          value={reviews}
          label="Reviews"
          accent="bg-amber-50 border-amber-100"
        />
      </View>
    </View>
  );
}
