import Svg, { Circle, Line } from 'react-native-svg';

export function IconSun({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={2} />
      <Line x1="12" y1="2" x2="12" y2="4.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line
        x1="12"
        y1="19.5"
        x2="12"
        y2="22"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Line x1="2" y1="12" x2="4.5" y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line
        x1="19.5"
        y1="12"
        x2="22"
        y2="12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Line
        x1="4.9"
        y1="4.9"
        x2="6.6"
        y2="6.6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Line
        x1="17.4"
        y1="17.4"
        x2="19.1"
        y2="19.1"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Line
        x1="4.9"
        y1="19.1"
        x2="6.6"
        y2="17.4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Line
        x1="17.4"
        y1="6.6"
        x2="19.1"
        y2="4.9"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
