import type { Href } from 'expo-router';
import type { UserRole } from './api';

export function getHomeRoute(role: UserRole | undefined): Href {
  switch (role) {
    case 'SELLER':
      return '/(seller)';
    case 'ADMIN':
      return '/(admin)';
    default:
      return '/(tabs)/explore';
  }
}

export function buildSalonShareUrl(salonId: string, baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, '');
  return `${base}/salon/${salonId}?utm_source=share&utm_medium=mobile`;
}
