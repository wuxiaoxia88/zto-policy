import { useEffect, useRef } from "react";
import type { EChartsCoreOption, EChartsType } from "echarts/core";

type EChartsRuntime = typeof import("./echarts-runtime");

let echartsLoader: Promise<EChartsRuntime> | null = null;

interface EChartProps {
  option: EChartsCoreOption;
  height?: number;
  ariaLabel: string;
}

export function EChart({ option, height = 260, ariaLabel }: EChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<EChartsType | null>(null);
  const optionRef = useRef(option);

  useEffect(() => {
    let isDisposed = false;

    void loadEcharts().then((runtime) => {
      if (isDisposed || !containerRef.current) {
        return;
      }

      const chart = runtime.initChart(containerRef.current, {
        renderer: "canvas"
      });
      chartRef.current = chart;
      chart.setOption(optionRef.current);
    });

    const handleResize = () => {
      chartRef.current?.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      isDisposed = true;
      window.removeEventListener("resize", handleResize);
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    optionRef.current = option;
    chartRef.current?.setOption(option, true);
  }, [option]);

  return (
    <div
      ref={containerRef}
      className="echart"
      role="img"
      aria-label={ariaLabel}
      style={{ height }}
    />
  );
}

function loadEcharts(): Promise<EChartsRuntime> {
  echartsLoader ??= import("./echarts-runtime");
  return echartsLoader;
}
