import Svg, { Path, Rect } from 'react-native-svg';

export function IconBarChart({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="12"
        width="4"
        height="9"
        rx="1"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Rect
        x="10"
        y="7"
        width="4"
        height="14"
        rx="1"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Rect
        x="17"
        y="3"
        width="4"
        height="18"
        rx="1"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path d="M3 21h18" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
