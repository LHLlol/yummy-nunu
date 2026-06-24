"use client";

import { useEffect, useRef, useState } from "react";

const MAX_PUPIL_OFFSET = 7;

export type MascotState = "idle" | "listening" | "received" | "error" | "unlocked";

interface PupilOffset {
  x: number;
  y: number;
}

interface AngryMascotProps {
  state?: MascotState;
}

const HERO_MASCOT_SRC = "images/hero-fire-character.png";

function getStateLabel(state: MascotState) {
  if (state === "listening") {
    return "偷听中";
  }

  if (state === "received") {
    return "已查收";
  }

  if (state === "error") {
    return "没听清";
  }

  if (state === "unlocked") {
    return "暗号正确";
  }

  return null;
}

export default function AngryMascot({ state = "idle" }: AngryMascotProps) {
  const mascotRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const [pupilOffset, setPupilOffset] = useState<PupilOffset>({ x: 0, y: 0 });

  useEffect(() => {
    const canTrackPointer =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (!canTrackPointer) {
      return undefined;
    }

    const updatePupils = (event: MouseEvent) => {
      if (!mascotRef.current) {
        return;
      }

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = requestAnimationFrame(() => {
        const rect = mascotRef.current?.getBoundingClientRect();

        if (!rect) {
          return;
        }

        const mascotCenterX = rect.left + rect.width / 2;
        const mascotCenterY = rect.top + rect.height * 0.42;
        const dx = event.clientX - mascotCenterX;
        const dy = event.clientY - mascotCenterY;
        const length = Math.hypot(dx, dy);

        if (length <= 0.01) {
          setPupilOffset({ x: 0, y: 0 });
          return;
        }

        setPupilOffset({
          x: (dx / length) * MAX_PUPIL_OFFSET,
          y: (dy / length) * MAX_PUPIL_OFFSET * 0.7,
        });
      });
    };

    const resetPupils = () => setPupilOffset({ x: 0, y: 0 });

    window.addEventListener("mousemove", updatePupils);
    document.addEventListener("mouseleave", resetPupils);
    window.addEventListener("blur", resetPupils);

    return () => {
      window.removeEventListener("mousemove", updatePupils);
      document.removeEventListener("mouseleave", resetPupils);
      window.removeEventListener("blur", resetPupils);

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const stateLabel = getStateLabel(state);
  const activePupilOffset = state === "unlocked" ? { x: 0, y: 0 } : pupilOffset;
  const pupilStyle = {
    transform: `translate(${activePupilOffset.x}px, ${activePupilOffset.y}px)`,
    transformBox: "fill-box",
    transformOrigin: "center",
    transition: "transform 160ms ease-out",
  } as const;

  return (
    <div
      ref={mascotRef}
      className={`mascot-stage mascot-state-${state} relative mx-auto h-[410px] w-[320px] sm:h-[500px] sm:w-[400px]`}
      aria-label="怒怒主视觉角色"
    >
      <div className="mascot-shadow" />

      {stateLabel && (
        <div className="mascot-state-badge" aria-live="polite">
          {stateLabel}
        </div>
      )}

      <img
        src={HERO_MASCOT_SRC}
        alt="红橙色火焰毛绒怒怒主视觉角色"
        className="pointer-events-none absolute left-1/2 top-0 z-10 h-[70%] w-auto max-w-none -translate-x-1/2 object-contain sm:h-[86%]"
        loading="eager"
        decoding="async"
        draggable={false}
      />

      <svg
        className="pointer-events-none absolute left-1/2 top-[32%] z-20 h-[12%] w-[48%] -translate-x-1/2 sm:top-[38%] sm:h-[12.5%] sm:w-[48%]"
        viewBox="0 0 184 74"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="left-mascot-eye">
            <ellipse cx="52" cy="38" rx="38" ry="24" transform="rotate(-11 52 38)" />
          </clipPath>
          <clipPath id="right-mascot-eye">
            <ellipse cx="132" cy="38" rx="38" ry="24" transform="rotate(11 132 38)" />
          </clipPath>
        </defs>

        <ellipse cx="52" cy="38" rx="38" ry="24" fill="#fffdf2" transform="rotate(-11 52 38)" />
        <g clipPath="url(#left-mascot-eye)">
          <circle cx="59" cy="40" r="14" fill="#14110e" style={pupilStyle} />
          <circle cx="64" cy="35" r="4" fill="#fffdf2" opacity="0.9" style={pupilStyle} />
        </g>

        <ellipse cx="132" cy="38" rx="38" ry="24" fill="#fffdf2" transform="rotate(11 132 38)" />
        <g clipPath="url(#right-mascot-eye)">
          <circle cx="125" cy="40" r="14" fill="#14110e" style={pupilStyle} />
          <circle cx="130" cy="35" r="4" fill="#fffdf2" opacity="0.9" style={pupilStyle} />
        </g>
      </svg>
    </div>
  );
}
