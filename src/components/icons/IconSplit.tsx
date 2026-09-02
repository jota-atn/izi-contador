import Svg, { Path } from 'react-native-svg';

export function IconSplit({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 6h5l7 12h6M3 18h5l3-5.2M16 6h6M16 6l3-3M16 6l3 3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
