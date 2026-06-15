import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  up?: boolean;
}

export function IconChevron({ size = 16, color = '#fff', up = false }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={up ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
