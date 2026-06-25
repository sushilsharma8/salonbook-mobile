import { format, isSameDay } from 'date-fns';
import { clsx } from 'clsx';
import { Pressable, ScrollView, Text } from 'react-native';
import { isSalonOpenOnDate, type SalonDayHours } from '@/lib/salonHours';

interface DatePickerProps {
  dates: Date[];
  selectedDate: Date;
  weeklyHours: SalonDayHours[] | null;
  onSelect: (date: Date) => void;
}

export function DatePicker({ dates, selectedDate, weeklyHours, onSelect }: DatePickerProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
      {dates.map((date, i) => {
        const isClosed = weeklyHours ? !isSalonOpenOnDate(weeklyHours, date) : false;
        const isSelected = isSameDay(selectedDate, date);
        return (
          <Pressable
            key={i}
            disabled={isClosed}
            onPress={() => onSelect(date)}
            className={clsx(
              'w-16 py-3 mr-2 rounded-2xl border-2 items-center',
              isClosed && 'bg-stone-100 border-stone-200 opacity-60',
              !isClosed && isSelected && 'bg-stone-900 border-stone-900',
              !isClosed && !isSelected && 'bg-white border-stone-200',
            )}
          >
            <Text
              className={clsx(
                'text-[10px] uppercase font-semibold mb-1',
                isSelected && !isClosed ? 'text-stone-300' : 'text-stone-500',
              )}
            >
              {format(date, 'EEE')}
            </Text>
            <Text
              className={clsx(
                'text-lg font-bold',
                isSelected && !isClosed ? 'text-white' : 'text-stone-700',
              )}
            >
              {format(date, 'd')}
            </Text>
            {isClosed ? (
              <Text className="text-[9px] font-semibold uppercase text-stone-400 mt-0.5">Closed</Text>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
