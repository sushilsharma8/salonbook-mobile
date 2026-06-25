import { format } from 'date-fns';
import { Modal, Pressable, Text, View } from 'react-native';
import type { Service } from '@/lib/api';
import { Button } from './Button';

interface BookingConfirmSheetProps {
  visible: boolean;
  services: Service[];
  selectedDate: Date;
  selectedTime: string;
  total: number;
  duration: number;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function BookingConfirmSheet({
  visible,
  services,
  selectedDate,
  selectedTime,
  total,
  duration,
  loading,
  onConfirm,
  onClose,
}: BookingConfirmSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <Pressable className="bg-white rounded-t-3xl p-6" onPress={(e) => e.stopPropagation()}>
          <View className="w-12 h-1 bg-stone-200 rounded-full self-center mb-6" />
          <Text className="text-2xl font-display font-bold text-stone-900 mb-2">Confirm booking</Text>
          <Text className="text-stone-500 mb-6">Pay at the shop after your visit.</Text>

          <View className="bg-stone-50 rounded-2xl p-4 mb-6 border border-stone-100 gap-3">
            <Text className="font-semibold text-stone-900">
              {services.map((s) => s.name).join(', ')}
            </Text>
            <Text className="text-stone-600">
              {format(selectedDate, 'EEE, MMM d, yyyy')} at {selectedTime}
            </Text>
            <Text className="text-stone-600">{duration} mins total</Text>
            <Text className="text-xl font-bold text-stone-900">₹{total}</Text>
          </View>

          <Button label="Confirm Booking" loading={loading} fullWidth onPress={onConfirm} />
          <Button label="Cancel" variant="ghost" fullWidth className="mt-2" onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
