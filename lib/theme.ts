import { Platform } from 'react-native';

export const colors = {
  page: '#fafaf9',
  text: '#1c1917',
  textMuted: '#78716c',
  surface: '#ffffff',
  border: 'rgba(231, 229, 228, 0.6)',
  cta: '#1c1917',
  amber: '#f59e0b',
  success: '#34d399',
  error: '#dc2626',
};

export const radii = {
  card: 24,
  hero: 32,
  button: 12,
};

export function getDefaultApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
}
