"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

/**
 * Continuously-rotating dotted globe, drawn on a 2D canvas.
 *
 * Why canvas rather than Three.js / a GLB: the Figma globe is ~9,875 static
 * vector dots (node 1:3502) — not a reusable or rotatable asset — and the
 * project ships no 3D stack. A hand-rolled canvas sphere reproduces the exact
 * dotted-grey treatment, rotates seamlessly (the angle just accumulates, so
 * there is no loop seam), and adds zero dependencies.
 *
 * Points are a Fibonacci sphere (even coverage, no lattice banding). Each frame
 * every point is spun about the vertical axis, given a fixed forward tilt, then
 * projected orthographically; dot size and opacity fall off with depth so the
 * front hemisphere reads as closer. Motion is linear and slow — a world turning
 * in space, not an entrance that replays.
 *
 * Performance: one rAF loop, gated by an IntersectionObserver so it never runs
 * off-screen, and a ResizeObserver keeps it crisp at the container's size and
 * devicePixelRatio. Under `prefers-reduced-motion` it paints a single static
 * frame and starts no loop.
 */

const POINT_COUNT = 2600;
/** radians/second — one revolution ≈ 42s, deliberately unhurried. */
const ROTATION_SPEED = 0.15;
/** forward tilt of the pole toward the viewer, in radians (~18°). */
const TILT = -0.32;
/** grey the dots are drawn in; depth drives the alpha on top of this. */
const DOT_RGB = "150, 155, 168";

interface SpherePoint {
  x: number;
  y: number;
  z: number;
}

/** Evenly-distributed points on a unit sphere (Fibonacci spiral). */
function fibonacciSphere(count: number): SpherePoint[] {
  const points: SpherePoint[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2; // 1 → -1
    const radius = Math.sqrt(1 - y * y);
    const theta = golden * i;
    points.push({ x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius });
  }
  return points;
}

interface DotGlobeProps {
  className?: string;
}

export default function DotGlobe({ className }: DotGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const points = fibonacciSphere(POINT_COUNT);
    const cosTilt = Math.cos(TILT);
    const sinTilt = Math.sin(TILT);

    let width = 0;
    let height = 0;
    let dpr = 1;

    const fit = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };

    const render = (angle: number) => {
      if (!width || !height) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) / 2 - 2;
      const baseDot = Math.max(0.6, radius / 230);
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Painter's order: sort back-to-front so nearer dots sit on top.
      const projected = points
        .map((p) => {
          // spin about the vertical (y) axis
          const rx = p.x * cosA + p.z * sinA;
          const rz = -p.x * sinA + p.z * cosA;
          // fixed forward tilt about the x axis
          const ry = p.y * cosTilt - rz * sinTilt;
          const rzz = p.y * sinTilt + rz * cosTilt;
          return { sx: cx + rx * radius, sy: cy - ry * radius, depth: rzz };
        })
        .sort((a, b) => a.depth - b.depth);

      for (const dot of projected) {
        const t = (dot.depth + 1) / 2; // 0 (back) → 1 (front)
        const alpha = 0.12 + t * 0.7;
        const size = baseDot * (0.55 + t * 0.75);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${DOT_RGB}, ${alpha})`;
        ctx.arc(dot.sx, dot.sy, size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    fit();

    if (reducedMotion) {
      render(0);
      const ro = new ResizeObserver(() => {
        fit();
        render(0);
      });
      ro.observe(canvas);
      return () => ro.disconnect();
    }

    let raf = 0;
    let last = 0;
    let angle = 0;
    let visible = true;

    const loop = (now: number) => {
      if (last) angle += ((now - last) / 1000) * ROTATION_SPEED;
      last = now;
      render(angle);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    const ro = new ResizeObserver(() => {
      fit();
      if (!visible) render(angle);
    });
    ro.observe(canvas);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("block h-full w-full", className)}
    />
  );
}
