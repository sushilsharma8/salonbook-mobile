import { clsx } from 'clsx';
import { Pressable, Text, View } from 'react-native';
import type { TimeSlot } from '@/lib/api';

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedTime: string;
  selectedDate: Date;
  onSelect: (time: string) => void;
}

function isSlotInPast(date: Date, time: string): boolean {
  const [hours, minutes] = time.split(':').map(Number);
  const slotTime = new Date(date);
  slotTime.setHours(hours, minutes, 0, 0);
  return slotTime <= new Date();
}

export function TimeSlotGrid({ slots, selectedTime, selectedDate, onSelect }: TimeSlotGridProps) {
  const visible = slots.filter((slot) => !isSlotInPast(selectedDate, slot.time));

  if (!visible.length) {
    return (
      <View className="py-8 items-center bg-stone-50 rounded-2xl border border-dashed border-stone-200">
        <Text className="text-stone-500 text-sm">No available slots for this date</Text>
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap gap-2">
      {visible.map((slot) => {
        const isSelected = selectedTime === slot.time;
        const disabled = !slot.available;
        return (
          <Pressable
            key={slot.time}
            disabled={disabled}
            onPress={() => onSelect(slot.time)}
            className={clsx(
              'w-[30%] py-2.5 rounded-xl border-2 items-center',
              disabled && 'bg-stone-100 border-stone-200 opacity-60',
              !disabled && isSelected && 'bg-stone-900 border-stone-900',
              !disabled && !isSelected && 'bg-white border-stone-200',
            )}
          >
            <Text
              className={clsx(
                'text-sm font-bold',
                disabled && 'text-stone-400',
                !disabled && isSelected && 'text-white',
                !disabled && !isSelected && 'text-stone-700',
              )}
            >
              {slot.time}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
