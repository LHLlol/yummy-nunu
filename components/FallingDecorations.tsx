"use client";

import type { CSSProperties } from "react";

type FallingShape = "spark" | "paper" | "dot" | "seed" | "arc";

interface FallingDecoration {
  delay: string;
  drift: string;
  duration: string;
  opacity: string;
  rotate: string;
  scale: string;
  shape: FallingShape;
  size: string;
  x: string;
}

const DECORATIONS: FallingDecoration[] = [
  { x: "7%", size: "12px", duration: "24s", delay: "-4s", drift: "28px", rotate: "118deg", opacity: "0.46", scale: "0.88", shape: "spark" },
  { x: "14%", size: "18px", duration: "31s", delay: "-18s", drift: "-42px", rotate: "-75deg", opacity: "0.38", scale: "1.05", shape: "paper" },
  { x: "21%", size: "9px", duration: "20s", delay: "-9s", drift: "34px", rotate: "220deg", opacity: "0.58", scale: "0.72", shape: "dot" },
  { x: "29%", size: "15px", duration: "28s", delay: "-22s", drift: "-30px", rotate: "140deg", opacity: "0.42", scale: "0.96", shape: "seed" },
  { x: "36%", size: "11px", duration: "18s", delay: "-2s", drift: "52px", rotate: "-160deg", opacity: "0.52", scale: "0.82", shape: "spark" },
  { x: "43%", size: "21px", duration: "34s", delay: "-27s", drift: "-36px", rotate: "86deg", opacity: "0.34", scale: "1", shape: "arc" },
  { x: "51%", size: "13px", duration: "22s", delay: "-13s", drift: "46px", rotate: "-120deg", opacity: "0.48", scale: "0.84", shape: "paper" },
  { x: "58%", size: "8px", duration: "19s", delay: "-7s", drift: "-24px", rotate: "175deg", opacity: "0.62", scale: "0.78", shape: "dot" },
  { x: "64%", size: "16px", duration: "29s", delay: "-25s", drift: "38px", rotate: "-95deg", opacity: "0.4", scale: "0.94", shape: "seed" },
  { x: "71%", size: "10px", duration: "17s", delay: "-5s", drift: "-48px", rotate: "205deg", opacity: "0.55", scale: "0.8", shape: "spark" },
  { x: "78%", size: "20px", duration: "32s", delay: "-16s", drift: "30px", rotate: "70deg", opacity: "0.36", scale: "1.08", shape: "paper" },
  { x: "84%", size: "12px", duration: "23s", delay: "-11s", drift: "-40px", rotate: "-210deg", opacity: "0.5", scale: "0.86", shape: "arc" },
  { x: "91%", size: "9px", duration: "21s", delay: "-20s", drift: "26px", rotate: "125deg", opacity: "0.57", scale: "0.76", shape: "dot" },
  { x: "3%", size: "17px", duration: "30s", delay: "-29s", drift: "44px", rotate: "-55deg", opacity: "0.33", scale: "0.98", shape: "seed" },
  { x: "47%", size: "7px", duration: "16s", delay: "-14s", drift: "-20px", rotate: "255deg", opacity: "0.64", scale: "0.68", shape: "dot" },
  { x: "88%", size: "14px", duration: "26s", delay: "-6s", drift: "-32px", rotate: "160deg", opacity: "0.44", scale: "0.9", shape: "spark" },
];

function toStyle(decoration: FallingDecoration) {
  return {
    "--fall-delay": decoration.delay,
    "--fall-drift": decoration.drift,
    "--fall-duration": decoration.duration,
    "--fall-opacity": decoration.opacity,
    "--fall-rotate": decoration.rotate,
    "--fall-scale": decoration.scale,
    "--fall-size": decoration.size,
    "--fall-x": decoration.x,
  } as CSSProperties;
}

export default function FallingDecorations() {
  return (
    <div className="falling-decorations" aria-hidden="true">
      {DECORATIONS.map((decoration, index) => (
        <span
          className={`falling-decoration falling-decoration-${decoration.shape}`}
          key={`${decoration.shape}-${index}`}
          style={toStyle(decoration)}
        />
      ))}
    </div>
  );
}
