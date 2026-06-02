import { useEffect, useRef } from "react";
import * as d3 from "d3";

type Props = {
  mean: number[];
  sigma?: number[];
  /** Optional ground-truth / reference trace (same length as mean). */
  referenceLine?: number[];
  width?: number;
  height?: number;
  color?: string;
};

export default function WaveformViewer({
  mean,
  sigma,
  referenceLine,
  width = 600,
  height = 140,
  color = "#06b6d4",
}: Props) {
  const ref = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const margin = { top: 8, right: 8, bottom: 16, left: 8 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const x0 = d3.scaleLinear().domain([0, mean.length - 1]).range([0, w]);

    const vals: number[] = [...mean];
    if (sigma && sigma.length === mean.length) {
      for (let i = 0; i < mean.length; i++) {
        vals.push(mean[i] + 2 * sigma[i], mean[i] - 2 * sigma[i]);
      }
    }
    if (referenceLine && referenceLine.length === mean.length) {
      vals.push(...referenceLine);
    }
    const yMin = (d3.min(vals) ?? 0) - 0.5;
    const yMax = (d3.max(vals) ?? 0) + 0.5;
    const y = d3.scaleLinear().domain([yMin, yMax]).range([h, 0]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const areaG = g.append("g");
    const lineG = g.append("g");
    const axisG = g.append("g").attr("transform", `translate(0,${h})`);

    const xAxis = d3
      .axisBottom(x0)
      .ticks(5)
      .tickFormat((d) => `${Math.round((d as number) * (1000 / mean.length))}ms`);
    axisG.call(xAxis as never);

    const areaGen = (xs: d3.ScaleLinear<number, number, never>) =>
      d3
        .area<number>()
        .x((_, i) => xs(i) as number)
        .y0((_, i) => y(mean[i] - 2 * (sigma ? sigma[i] : 0)))
        .y1((_, i) => y(mean[i] + 2 * (sigma ? sigma[i] : 0)));

    const lineGen = (xs: d3.ScaleLinear<number, number, never>) =>
      d3
        .line<number>()
        .x((_, i) => xs(i) as number)
        .y((d) => y(d));

    if (sigma && sigma.length === mean.length) {
      areaG
        .append("path")
        .datum(mean)
        .attr("class", "uncertainty-band")
        .attr("fill", color)
        .attr("opacity", 0.12)
        .attr("d", areaGen(x0) as unknown as string);
    }

    if (referenceLine && referenceLine.length === mean.length) {
      lineG
        .append("path")
        .datum(referenceLine)
        .attr("class", "ref-line")
        .attr("fill", "none")
        .attr("stroke", "#94a3b8")
        .attr("stroke-width", 2)
        .attr("d", lineGen(x0) as unknown as string);
    }

    lineG
      .append("path")
      .datum(mean)
      .attr("class", "mean-line")
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", referenceLine && referenceLine.length === mean.length ? "6 4" : "0")
      .attr("d", lineGen(x0) as unknown as string);

    const crosshair = g.append("g").style("display", "none");
    crosshair
      .append("line")
      .attr("class", "crosshair-line")
      .attr("stroke", "#999")
      .attr("stroke-width", 1)
      .attr("y1", 0)
      .attr("y2", h);

    g.append("rect")
      .attr("class", "overlay")
      .attr("width", w)
      .attr("height", h)
      .attr("fill", "transparent")
      .on("mouseover", () => {
        if (tooltipRef.current) tooltipRef.current.style.display = "block";
        crosshair.style("display", null);
      })
      .on("mouseout", () => {
        if (tooltipRef.current) tooltipRef.current.style.display = "none";
        crosshair.style("display", "none");
      })
      .on("mousemove", (event: MouseEvent) => {
        const [mx] = d3.pointer(event);
        const ix = Math.round(x0.invert(mx));
        const index = Math.max(0, Math.min(mean.length - 1, ix));
        const px = x0(index);
        crosshair.select(".crosshair-line").attr("x1", px).attr("x2", px);
        if (tooltipRef.current) {
          const tooltip = tooltipRef.current;
          const amp = mean[index];
          const unc = sigma ? sigma[index] : null;
          const refv = referenceLine ? referenceLine[index] : null;
          tooltip.innerHTML = `<div class="text-xs">t: ${index}</div><div class="text-sm">pred: ${amp.toFixed(3)}</div>${
            refv != null ? `<div class="text-xs text-slate-300">ref: ${refv.toFixed(3)}</div>` : ""
          }${unc != null ? `<div class="text-xs">σ: ${unc.toFixed(3)}</div>` : ""}`;
          const matrix = (ref.current as SVGSVGElement).getScreenCTM();
          if (matrix) {
            const point = ref.current!.createSVGPoint();
            point.x = px + margin.left;
            point.y = margin.top;
            const c = point.matrixTransform(matrix);
            tooltip.style.left = `${c.x + 10}px`;
            tooltip.style.top = `${c.y}px`;
          }
        }
      });

    const zoomed = (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
      const t = event.transform;
      const newX = t.rescaleX(x0);
      if (sigma && sigma.length === mean.length) {
        areaG.selectAll("path").attr("d", areaGen(newX) as unknown as string);
      }
      lineG.selectAll<SVGPathElement, number[]>("path.mean-line").attr("d", lineGen(newX) as unknown as string);
      if (referenceLine && referenceLine.length === mean.length) {
        lineG.selectAll<SVGPathElement, number[]>("path.ref-line").attr("d", lineGen(newX) as unknown as string);
      }
      axisG.call(
        d3
          .axisBottom(newX)
          .ticks(5)
          .tickFormat((d) => `${Math.round((d as number) * (1000 / mean.length))}ms`) as never,
      );
    };

    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([1, 20]).on("zoom", zoomed);
    svg.call(zoom);

    return () => {
      svg.on(".zoom", null);
    };
  }, [mean, sigma, referenceLine, width, height, color]);

  return (
    <div style={{ position: "relative" }}>
      <svg ref={ref} width={width} height={height} className="waveform-svg" />
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          display: "none",
          pointerEvents: "none",
          background: "rgba(0,0,0,0.75)",
          color: "#fff",
          padding: "6px",
          borderRadius: 6,
          fontSize: 12,
        }}
      />
    </div>
  );
}
