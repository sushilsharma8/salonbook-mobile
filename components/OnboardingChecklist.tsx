import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { CheckCircle2, Circle } from 'lucide-react-native';
import { clsx } from 'clsx';
import type { SellerSalon } from '@/lib/api';
import { parseSalonImages } from '@/lib/api';
import { getDefaultApiUrl } from '@/lib/theme';

const DEFAULT_STAFF_SKILLS = 'SALON_DEFAULT_STAFF';

function countRealStaff(staff: SellerSalon['staff']): number {
  return (staff || []).filter((s) => s.skills !== DEFAULT_STAFF_SKILLS).length;
}

export function OnboardingChecklist({ salon }: { salon: SellerSalon | null }) {
  const steps = useMemo(() => {
    if (!salon) return [];
    const photoCount = parseSalonImages(salon.images, getDefaultApiUrl()).length;
    const serviceCount = salon.services?.length ?? 0;
    const staffCount = countRealStaff(salon.staff);
    const hasHours = (salon.hours?.length ?? 0) >= 7;

    return [
      { label: 'Add at least 3 salon photos', done: photoCount >= 3, detail: `${photoCount}/3 photos` },
      { label: 'Set weekly opening hours', done: hasHours, detail: hasHours ? 'Complete' : 'Incomplete' },
      { label: 'List at least 8 services with prices', done: serviceCount >= 8, detail: `${serviceCount}/8 services` },
      { label: 'Add staff members', done: staffCount >= 1, detail: `${staffCount} staff` },
    ];
  }, [salon]);

  if (!salon) return null;

  const completed = steps.filter((s) => s.done).length;
  const allDone = completed === steps.length;

  return (
    <View className="bg-white p-6 rounded-3xl border border-stone-200/60 mb-6">
      <View className="flex-row items-start justify-between gap-4 mb-4">
        <View className="flex-1">
          <Text className="text-xl font-display font-bold text-stone-900">Launch checklist</Text>
          <Text className="text-sm text-stone-500 mt-1">
            Complete these steps so customers can find and book you.
          </Text>
        </View>
        <View
          className={clsx(
            'px-3 py-1.5 rounded-full',
            allDone ? 'bg-emerald-100' : 'bg-amber-100',
          )}
        >
          <Text
            className={clsx(
              'text-xs font-bold uppercase',
              allDone ? 'text-emerald-800' : 'text-amber-800',
            )}
          >
            {completed}/{steps.length}
          </Text>
        </View>
      </View>
      {steps.map((step) => (
        <View key={step.label} className="flex-row items-center gap-3 py-2">
          {step.done ? (
            <CheckCircle2 size={20} color="#059669" />
          ) : (
            <Circle size={20} color="#d6d3d1" />
          )}
          <Text
            className={clsx('flex-1 text-sm', step.done ? 'text-stone-600' : 'text-stone-900 font-medium')}
          >
            {step.label}
          </Text>
          <Text className="text-stone-400 text-xs">{step.detail}</Text>
        </View>
      ))}
      {allDone ? (
        <Text className="mt-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
          Profile ready — share your salon link from the Share tab.
        </Text>
      ) : null}
    </View>
  );
}
