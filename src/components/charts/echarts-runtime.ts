import { BarChart, LineChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent,
  TooltipComponent
} from "echarts/components";
import { init, use as registerEchartsModules } from "echarts/core";
import type { EChartsInitOpts } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

let isRegistered = false;

export function initChart(
  container: HTMLDivElement,
  options: EChartsInitOpts
) {
  if (!isRegistered) {
    registerEchartsModules([
      BarChart,
      LineChart,
      GridComponent,
      LegendComponent,
      MarkLineComponent,
      MarkPointComponent,
      TooltipComponent,
      CanvasRenderer
    ]);
    isRegistered = true;
  }

  return init(container, null, options);
}
