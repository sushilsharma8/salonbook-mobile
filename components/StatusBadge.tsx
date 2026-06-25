import { clsx } from 'clsx';
import { Text, View } from 'react-native';
import type { BookingStatus } from '@/lib/api';

const styles: Record<BookingStatus, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pending' },
  CONFIRMED: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Confirmed' },
  COMPLETED: { bg: 'bg-stone-100', text: 'text-stone-700', label: 'Completed' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
  NO_SHOW: { bg: 'bg-red-100', text: 'text-red-700', label: 'No show' },
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const style = styles[status] || styles.PENDING;
  return (
    <View className={clsx('px-3 py-1 rounded-full', style.bg)}>
      <Text className={clsx('text-xs font-bold uppercase tracking-wide', style.text)}>
        {style.label}
      </Text>
    </View>
  );
}
