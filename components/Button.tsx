import { clsx } from 'clsx';
import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

type Variant = 'primary' | 'secondary' | 'amber' | 'danger' | 'ghost' | 'outline';

interface ButtonProps extends PressableProps {
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
  label: string;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-stone-900 active:bg-stone-800',
  secondary: 'bg-stone-100 border border-stone-200 active:bg-stone-200',
  amber: 'bg-amber-500 active:bg-amber-400',
  danger: 'bg-red-50 border border-red-200 active:bg-red-100',
  ghost: 'bg-transparent active:bg-stone-100',
  outline: 'bg-white border border-stone-200 active:bg-stone-50',
};

const textClasses: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-stone-900',
  amber: 'text-stone-900',
  danger: 'text-red-600',
  ghost: 'text-stone-700',
  outline: 'text-stone-900',
};

export function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  label,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      className={clsx(
        'flex-row items-center justify-center rounded-xl px-5 py-3.5',
        variantClasses[variant],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50',
        className,
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#1c1917'} />
      ) : (
        <Text className={clsx('font-semibold text-base', textClasses[variant])}>{label}</Text>
      )}
    </Pressable>
  );
}
