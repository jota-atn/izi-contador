declare module 'react-native-svg' {
  import { ComponentType } from 'react';
  import { ViewProps } from 'react-native';

  interface CommonProps {
    fill?: string;
    stroke?: string;
    strokeWidth?: number | string;
    strokeLinecap?: 'butt' | 'round' | 'square';
    strokeLinejoin?: 'miter' | 'round' | 'bevel';
    opacity?: number | string;
  }

  interface SvgProps extends ViewProps, CommonProps {
    width?: number | string;
    height?: number | string;
    viewBox?: string;
  }

  interface PathProps extends CommonProps {
    d?: string;
  }

  interface RectProps extends CommonProps {
    x?: number | string;
    y?: number | string;
    width?: number | string;
    height?: number | string;
    rx?: number | string;
    ry?: number | string;
  }

  interface LineProps extends CommonProps {
    x1?: number | string;
    y1?: number | string;
    x2?: number | string;
    y2?: number | string;
  }

  interface CircleProps extends CommonProps {
    cx?: number | string;
    cy?: number | string;
    r?: number | string;
  }

  export const Svg: ComponentType<SvgProps>;
  export default Svg;
  export const Path: ComponentType<PathProps>;
  export const Rect: ComponentType<RectProps>;
  export const Line: ComponentType<LineProps>;
  export const Circle: ComponentType<CircleProps>;
  export const G: ComponentType<CommonProps & { transform?: string }>;
}
