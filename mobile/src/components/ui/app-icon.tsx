import { Image } from 'expo-image';

const icons = {
  search: require('@/assets/icons/search.svg'),
  scan: require('@/assets/icons/scan.svg'),
  arrow: require('@/assets/icons/arrow.svg'),
  sigma: require('@/assets/icons/sigma.svg'),
  chevron: require('@/assets/icons/chevron.svg'),
  sprout: require('@/assets/icons/sprout.svg'),
  feather: require('@/assets/icons/feather.svg'),
  brain: require('@/assets/icons/brain.svg'),
  plus: require('@/assets/icons/plus.svg'),
  home: require('@/assets/icons/home.svg'),
  calendar: require('@/assets/icons/calendar.svg'),
  courses: require('@/assets/icons/courses.svg'),
  materials: require('@/assets/icons/materials.svg'),
  settings: require('@/assets/icons/settings.svg'),
};
export type AppIconName = keyof typeof icons;

export function AppIcon({
  name,
  size = 23,
  tintColor,
}: {
  name: AppIconName;
  size?: number;
  tintColor?: string;
}) {
  return (
    <Image
      source={icons[name]}
      style={{ width: size, height: size }}
      contentFit="contain"
      tintColor={tintColor}
      accessible={false}
    />
  );
}
