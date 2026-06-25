import { Alert, Text, View } from 'react-native';
import { Calendar, Clock, User } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import type { BookingStatus, SellerBooking } from '@/lib/api';
import { formatBookingTime, isPendingBookingActionable } from '@/lib/bookingTime';

interface ManageBookingCardProps {
  booking: SellerBooking;
  onStatusChange: (id: string, status: BookingStatus) => Promise<void>;
  loading?: boolean;
}

export function ManageBookingCard({ booking, onStatusChange, loading }: ManageBookingCardProps) {
  const services = booking.services
    .map((s) => s.serviceNameAtBooking || s.service?.name)
    .filter(Boolean)
    .join(', ');
  const canRespond = isPendingBookingActionable(booking);
  const isActive =
    booking.status !== 'CANCELLED' &&
    booking.status !== 'COMPLETED' &&
    booking.status !== 'NO_SHOW';

  const confirmAction = (label: string, status: BookingStatus) => {
    Alert.alert(label, `Are you sure you want to mark this booking as ${status.toLowerCase().replace('_', ' ')}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => onStatusChange(booking.id, status),
      },
    ]);
  };

  return (
    <View className="bg-white rounded-2xl p-5 border border-stone-200/60 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <StatusBadge status={booking.status} />
        <Text className="text-lg font-display font-bold text-stone-900">₹{booking.totalAmount}</Text>
      </View>

      <View className="gap-2 mb-4">
        <View className="flex-row items-center gap-2">
          <User size={16} color="#a8a29e" />
          <Text className="text-stone-900 font-medium">{booking.user?.name || 'Customer'}</Text>
          {booking.user?.phone ? (
            <Text className="text-stone-500 text-sm">+91 {booking.user.phone}</Text>
          ) : null}
        </View>
        <View className="flex-row items-center gap-2">
          <Calendar size={16} color="#a8a29e" />
          <Text className="text-stone-700">{formatBookingTime(booking.startTime, 'EEE, MMM d, yyyy')}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Clock size={16} color="#a8a29e" />
          <Text className="text-stone-700">
            {formatBookingTime(booking.startTime, 'h:mm a')}
            {booking.staff?.name ? ` · ${booking.staff.name}` : ''}
          </Text>
        </View>
        {services ? <Text className="text-stone-600 text-sm mt-1">{services}</Text> : null}
      </View>

      {canRespond ? (
        <View className="flex-row gap-2">
          <Button
            label="Accept"
            className="flex-1"
            loading={loading}
            onPress={() => confirmAction('Accept booking', 'CONFIRMED')}
          />
          <Button
            label="Reject"
            variant="danger"
            className="flex-1"
            loading={loading}
            onPress={() => confirmAction('Reject booking', 'CANCELLED')}
          />
        </View>
      ) : null}

      {booking.status === 'CONFIRMED' && isActive ? (
        <View className="flex-row gap-2 mt-2">
          <Button
            label="Complete"
            variant="secondary"
            className="flex-1"
            loading={loading}
            onPress={() => confirmAction('Complete booking', 'COMPLETED')}
          />
          <Button
            label="No show"
            variant="outline"
            className="flex-1"
            loading={loading}
            onPress={() => confirmAction('Mark no-show', 'NO_SHOW')}
          />
        </View>
      ) : null}

      {booking.status === 'PENDING' && !canRespond ? (
        <Text className="text-stone-500 text-sm text-center py-2">
          This booking expired because the appointment time has passed.
        </Text>
      ) : null}
    </View>
  );
}
