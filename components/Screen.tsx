import { clsx } from 'clsx';
import { ActivityIndicator, ScrollView, Text, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps extends ScrollViewProps {
  children?: React.ReactNode;
  scroll?: boolean;
  loading?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
  contentClassName?: string;
}

export function Screen({
  children,
  scroll = true,
  loading = false,
  title,
  subtitle,
  className,
  contentClassName,
  ...scrollProps
}: ScreenProps) {
  const header = (title || subtitle) && (
    <View className="mb-6">
      {title ? (
        <Text className="text-3xl font-display font-bold text-stone-900 tracking-tight">{title}</Text>
      ) : null}
      {subtitle ? <Text className="text-stone-500 mt-1 text-base">{subtitle}</Text> : null}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className={clsx('flex-1 bg-page items-center justify-center', className)}>
        <ActivityIndicator size="large" color="#1c1917" />
      </SafeAreaView>
    );
  }

  if (!scroll) {
    return (
      <SafeAreaView className={clsx('flex-1 bg-page', className)} edges={['top', 'left', 'right']}>
        <View className={clsx('flex-1 px-4', contentClassName)}>
          {header}
          {children}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={clsx('flex-1 bg-page', className)} edges={['top', 'left', 'right']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        {...scrollProps}
      >
        {header}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
