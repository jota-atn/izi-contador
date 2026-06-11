import Svg, { Rect, Line } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export function IconCard({ size = 32, color = '#ffffff' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="1" y="4" width="22" height="16" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="1" y1="10" x2="23" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}
