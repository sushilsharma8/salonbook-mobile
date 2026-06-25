import { clsx } from 'clsx';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export function Input({ label, error, containerClassName, className, ...props }: InputProps) {
  return (
    <View className={containerClassName}>
      {label ? (
        <Text className="text-sm font-medium text-stone-700 mb-2">{label}</Text>
      ) : null}
      <TextInput
        className={clsx(
          'w-full px-4 py-3.5 rounded-xl border border-stone-200 bg-stone-50/80 text-stone-900 text-base',
          error && 'border-red-300',
          className,
        )}
        placeholderTextColor="#a8a29e"
        {...props}
      />
      {error ? <Text className="text-red-600 text-sm mt-1">{error}</Text> : null}
    </View>
  );
}
