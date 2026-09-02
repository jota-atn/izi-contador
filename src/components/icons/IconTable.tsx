import Svg, { Rect, Line } from 'react-native-svg';

export function IconTable({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="16" rx="2" stroke={color} strokeWidth={2} />
      <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth={2} />
      <Line x1="9" y1="10" x2="9" y2="20" stroke={color} strokeWidth={2} />
      <Line x1="15" y1="10" x2="15" y2="20" stroke={color} strokeWidth={2} />
    </Svg>
  );
}
