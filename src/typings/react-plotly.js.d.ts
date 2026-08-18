declare module "react-plotly.js" {
  import * as React from "react";
  import { Data, Layout, Config } from "plotly.js";

  interface PlotProps {
    data: Partial<Data>[];
    layout?: Partial<Layout>;
    config?: Partial<Config>;
    style?: React.CSSProperties;
    className?: string;
    useResizeHandler?: boolean;
    onInitialized?: (figure: any, graphDiv: HTMLElement) => void;
    onUpdate?: (figure: any, graphDiv: HTMLElement) => void;
    [key: string]: any;
  }

  const Plot: React.ComponentType<PlotProps>;
  export default Plot;
}
