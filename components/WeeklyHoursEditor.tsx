import { Pressable, Text, TextInput, View } from 'react-native';
import { clsx } from 'clsx';
import type { SalonDayHours } from '@/lib/api';
import { WEEKDAYS } from '@/lib/salonHours';

interface WeeklyHoursEditorProps {
  hours: SalonDayHours[];
  defaultOpen: string;
  defaultClose: string;
  onChange: (hours: SalonDayHours[]) => void;
  onApplyDefault: () => void;
}

export function WeeklyHoursEditor({
  hours,
  defaultOpen,
  defaultClose,
  onChange,
  onApplyDefault,
}: WeeklyHoursEditorProps) {
  const updateDay = (dayOfWeek: number, patch: Partial<SalonDayHours>) => {
    onChange(
      hours.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, ...patch } : h)),
    );
  };

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-medium text-stone-700">Weekly hours</Text>
        <Pressable onPress={onApplyDefault} className="px-3 py-1.5 bg-stone-100 rounded-lg">
          <Text className="text-xs font-semibold text-stone-700">Apply default to open days</Text>
        </Pressable>
      </View>
      {WEEKDAYS.map(({ dayOfWeek, short }) => {
        const row = hours.find((h) => h.dayOfWeek === dayOfWeek) ?? {
          dayOfWeek,
          isOpen: true,
          startTime: defaultOpen,
          endTime: defaultClose,
        };
        return (
          <View key={dayOfWeek} className="flex-row items-center gap-2 mb-2">
            <Pressable
              onPress={() => updateDay(dayOfWeek, { isOpen: !row.isOpen })}
              className={clsx(
                'w-12 py-2 rounded-lg items-center border',
                row.isOpen ? 'bg-amber-50 border-amber-200' : 'bg-stone-100 border-stone-200',
              )}
            >
              <Text className="text-xs font-bold text-stone-800">{short}</Text>
            </Pressable>
            {row.isOpen ? (
              <View className="flex-1 flex-row gap-2">
                <TextInput
                  className="flex-1 px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-stone-900"
                  value={row.startTime}
                  onChangeText={(startTime) => updateDay(dayOfWeek, { startTime })}
                  placeholder="09:00"
                />
                <Text className="self-center text-stone-400">–</Text>
                <TextInput
                  className="flex-1 px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-stone-900"
                  value={row.endTime}
                  onChangeText={(endTime) => updateDay(dayOfWeek, { endTime })}
                  placeholder="18:00"
                />
              </View>
            ) : (
              <Text className="flex-1 text-stone-400 text-sm py-2">Closed</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}
