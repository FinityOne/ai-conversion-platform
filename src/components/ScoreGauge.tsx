"use client";

import { useEffect, useRef } from "react";
import { scoreColor } from "@/lib/scoring";

interface Props {
  score: number;
  size?: number;
  label?: string;
}

export default function ScoreGauge({ score, size = 200, label = "Engagement Score" }: Props) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    (async () => {
      const d3 = await import("d3");
      if (!ref.current) return;

      const svg = d3.select(ref.current);
      svg.selectAll("*").remove();

      const W = size;
      const H = Math.round(size * 0.62);
      const cx = W / 2;
      const cy = H - 4;
      const outerR = W / 2 - 8;
      const innerR = outerR - Math.round(size * 0.13);
      const color  = scoreColor(score);

      svg.attr("viewBox", `0 0 ${W} ${H}`);

      // Background track
      const bgPath = d3.arc()({
        innerRadius: innerR,
        outerRadius: outerR,
        startAngle: -Math.PI / 2,
        endAngle:   Math.PI / 2,
      } as d3.DefaultArcObject);

      svg.append("path")
        .attr("d", bgPath!)
        .attr("transform", `translate(${cx},${cy})`)
        .attr("fill", "#ede9e4");

      // Score fill — animate from 0
      const targetAngle = -Math.PI / 2 + (score / 100) * Math.PI;

      const fillArcFn = d3.arc()
        .innerRadius(innerR)
        .outerRadius(outerR);

      const path = svg.append("path")
        .attr("transform", `translate(${cx},${cy})`)
        .attr("fill", color);

      path.transition()
        .duration(900)
        .ease(d3.easeCubicOut)
        .attrTween("d", () => {
          const interp = d3.interpolate(-Math.PI / 2, targetAngle);
          return (t: number) => {
            const ang = interp(t);
            return fillArcFn({
              innerRadius: innerR,
              outerRadius: outerR,
              startAngle: -Math.PI / 2,
              endAngle: ang,
            } as d3.DefaultArcObject)!;
          };
        });

      // Score number
      svg.append("text")
        .attr("x", cx)
        .attr("y", cy - Math.round(size * 0.1))
        .attr("text-anchor", "middle")
        .attr("fill", color)
        .attr("font-size", `${Math.round(size * 0.18)}px`)
        .attr("font-weight", "900")
        .attr("font-family", "system-ui,-apple-system,sans-serif")
        .text(score);

      // "/100" label
      svg.append("text")
        .attr("x", cx)
        .attr("y", cy + Math.round(size * 0.04))
        .attr("text-anchor", "middle")
        .attr("fill", "#a8a29e")
        .attr("font-size", `${Math.round(size * 0.065)}px`)
        .attr("font-weight", "600")
        .attr("font-family", "system-ui,-apple-system,sans-serif")
        .text("/ 100");

      // Min label
      svg.append("text")
        .attr("x", cx - outerR + 2)
        .attr("y", cy + Math.round(size * 0.1))
        .attr("fill", "#c4bfb8")
        .attr("font-size", `${Math.round(size * 0.058)}px`)
        .attr("font-family", "system-ui,-apple-system,sans-serif")
        .text("0");

      // Max label
      svg.append("text")
        .attr("x", cx + outerR - 2)
        .attr("y", cy + Math.round(size * 0.1))
        .attr("text-anchor", "end")
        .attr("fill", "#c4bfb8")
        .attr("font-size", `${Math.round(size * 0.058)}px`)
        .attr("font-family", "system-ui,-apple-system,sans-serif")
        .text("100");
    })();
  }, [score, size]);

  return (
    <div style={{ textAlign: "center" }}>
      <svg
        ref={ref}
        style={{ width: "100%", maxWidth: size, height: "auto", display: "block", margin: "0 auto" }}
      />
      <p style={{ margin: "6px 0 0", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#a8a29e" }}>
        {label}
      </p>
    </div>
  );
}
