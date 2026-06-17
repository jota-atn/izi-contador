import Svg, { Path, Rect } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export function IconQR({ size = 24, color = '#fff' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* top-left corner square */}
      <Rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="1.5" />
      <Rect x="5" y="5" width="3" height="3" fill={color} />
      {/* top-right corner square */}
      <Rect x="14" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="1.5" />
      <Rect x="16" y="5" width="3" height="3" fill={color} />
      {/* bottom-left corner square */}
      <Rect x="3" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="1.5" />
      <Rect x="5" y="16" width="3" height="3" fill={color} />
      {/* data dots bottom-right area */}
      <Path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 17h2v2h-2zM17 14h2v2h-2z" fill={color} />
    </Svg>
  );
}
