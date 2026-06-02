export type Platform = 'ios' | 'android';

export interface DeviceSize {
  id: string;
  label: string;
  platform: Platform;
  width: number;
  height: number;
  required: boolean;
  group: 'iphone' | 'ipad' | 'phone' | 'tablet' | 'feature' | 'tv';
}

export const DEVICE_SIZES: DeviceSize[] = [
  { id: 'iphone-69', label: 'iPhone 6.9"', platform: 'ios', width: 1320, height: 2868, required: true, group: 'iphone' },
  { id: 'iphone-67', label: 'iPhone 6.7"', platform: 'ios', width: 1290, height: 2796, required: false, group: 'iphone' },
  { id: 'iphone-65', label: 'iPhone 6.5"', platform: 'ios', width: 1242, height: 2688, required: false, group: 'iphone' },
  { id: 'iphone-55', label: 'iPhone 5.5"', platform: 'ios', width: 1242, height: 2208, required: false, group: 'iphone' },
  { id: 'ipad-13', label: 'iPad 13" Display', platform: 'ios', width: 2064, height: 2752, required: true, group: 'ipad' },
  { id: 'ipad-129', label: 'iPad Pro 12.9"', platform: 'ios', width: 2048, height: 2732, required: false, group: 'ipad' },
  { id: 'ipad-11', label: 'iPad Pro 11"', platform: 'ios', width: 1668, height: 2388, required: false, group: 'ipad' },
  { id: 'ipad-105', label: 'iPad 10.5"', platform: 'ios', width: 1668, height: 2224, required: false, group: 'ipad' },
  { id: 'android-phone', label: 'Android Phone', platform: 'android', width: 1080, height: 1920, required: true, group: 'phone' },
  { id: 'android-7tab', label: 'Android 7" Tablet', platform: 'android', width: 1200, height: 1920, required: false, group: 'tablet' },
  { id: 'android-10tab', label: 'Android 10" Tablet', platform: 'android', width: 1920, height: 1200, required: false, group: 'tablet' },
  { id: 'feature-graphic', label: 'Feature Graphic', platform: 'android', width: 1024, height: 500, required: true, group: 'feature' },
  { id: 'tv-banner', label: 'TV Banner', platform: 'android', width: 1280, height: 720, required: false, group: 'tv' },
];

export function getDevice(id: string): DeviceSize | undefined {
  return DEVICE_SIZES.find((d) => d.id === id);
}

export function devicesByPlatform(p: Platform): DeviceSize[] {
  return DEVICE_SIZES.filter((d) => d.platform === p);
}
