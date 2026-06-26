import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Scissors } from 'lucide-react-native';
import { colors } from '@/lib/theme';

interface AppSplashProps {
  visible: boolean;
  onFinish?: () => void;
}

export function AppSplash({ visible, onFinish }: AppSplashProps) {
  const containerOpacity = useSharedValue(1);
  const logoScale = useSharedValue(0.92);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 400 });
    logoScale.value = withTiming(1, { duration: 400 });
    textOpacity.value = withDelay(150, withTiming(1, { duration: 400 }));
  }, [logoOpacity, logoScale, textOpacity]);

  useEffect(() => {
    if (!visible) {
      containerOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished && onFinish) {
          runOnJS(onFinish)();
        }
      });
    }
  }, [visible, onFinish, containerOpacity]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <Animated.View
      style={[styles.container, containerStyle]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <View className="h-24 bg-amber-50 border-b border-amber-100" />

      <View className="flex-1 items-center justify-center px-8 -mt-24">
        <Animated.View style={logoStyle} className="items-center">
          <View className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-100 items-center justify-center mb-6">
            <Scissors size={36} color={colors.amber} strokeWidth={2} />
          </View>
        </Animated.View>

        <Animated.View style={textStyle} className="items-center">
          <Text className="text-4xl font-display font-bold text-stone-900 mb-2">SalonBook</Text>
          <Text className="text-base text-stone-500">Book your glow-up</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.page,
    zIndex: 50,
  },
});
