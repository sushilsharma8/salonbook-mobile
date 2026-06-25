import { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { Button } from './Button';

interface ReviewModalProps {
  visible: boolean;
  salonName: string;
  loading: boolean;
  onSubmit: (rating: number, comment: string) => void;
  onClose: () => void;
}

export function ReviewModal({ visible, salonName, loading, onSubmit, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmit(rating, comment);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 items-center justify-center px-4">
        <View className="bg-white rounded-3xl p-6 w-full max-w-md">
          <Text className="text-2xl font-display font-bold text-stone-900 mb-1">Leave a review</Text>
          <Text className="text-stone-500 mb-6">{salonName}</Text>

          <View className="flex-row justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable key={value} onPress={() => setRating(value)}>
                <Star
                  size={32}
                  color="#f59e0b"
                  fill={value <= rating ? '#fbbf24' : 'transparent'}
                />
              </Pressable>
            ))}
          </View>

          <TextInput
            className="w-full min-h-[100px] px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 mb-6"
            placeholder="Share your experience..."
            placeholderTextColor="#a8a29e"
            multiline
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
          />

          <Button label="Submit Review" loading={loading} fullWidth onPress={handleSubmit} />
          <Button label="Cancel" variant="ghost" fullWidth className="mt-2" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
