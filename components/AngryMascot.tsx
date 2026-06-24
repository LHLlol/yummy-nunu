"use client";

import { useEffect, useRef } from "react";

const EYE_OFFSET_X = 4;
const EYE_OFFSET_Y = 2.5;
const EYE_SMOOTHING = 0.14;

export type MascotState = "idle" | "listening" | "received" | "error" | "unlocked";

interface EyeOffset {
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

function lerp(current: number, target: number, factor: number) {
  return current + (target - current) * factor;
}

export default function AngryMascot({ state = "idle" }: AngryMascotProps) {
  const mascotRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const currentOffsetRef = useRef<EyeOffset>({ x: 0, y: 0 });
  const targetOffsetRef = useRef<EyeOffset>({ x: 0, y: 0 });
  const mascotCenterRef = useRef<EyeOffset>({ x: 0, y: 0 });
  const stateRef = useRef<MascotState>(state);

  useEffect(() => {
    stateRef.current = state;

    if (state === "unlocked" || state === "received") {
      targetOffsetRef.current = { x: 0, y: 0 };
    }
  }, [state]);

  useEffect(() => {
    const canTrackPointer =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (!canTrackPointer) {
      return undefined;
    }

    const updateMascotCenter = () => {
      const rect = mascotRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      mascotCenterRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height * 0.46,
      };
    };

    const animate = () => {
      const current = currentOffsetRef.current;
      const target = targetOffsetRef.current;

      current.x = lerp(current.x, target.x, EYE_SMOOTHING);
      current.y = lerp(current.y, target.y, EYE_SMOOTHING);

      mascotRef.current?.style.setProperty("--eye-x", `${current.x.toFixed(3)}px`);
      mascotRef.current?.style.setProperty("--eye-y", `${current.y.toFixed(3)}px`);

      rafRef.current = requestAnimationFrame(animate);
    };

    const updateTarget = (event: MouseEvent) => {
      const center = mascotCenterRef.current;
      const dx = event.clientX - center.x;
      const dy = event.clientY - center.y;
      const length = Math.hypot(dx, dy);

      if (length <= 0.01 || stateRef.current === "unlocked" || stateRef.current === "received") {
        targetOffsetRef.current = { x: 0, y: 0 };
        return;
      }

      const focusScale = stateRef.current === "listening" ? 0.75 : 1;
      targetOffsetRef.current = {
        x: (dx / length) * EYE_OFFSET_X * focusScale,
        y: (dy / length) * EYE_OFFSET_Y * focusScale,
      };
    };

    const resetTarget = () => {
      targetOffsetRef.current = { x: 0, y: 0 };
    };

    updateMascotCenter();
    animate();

    window.addEventListener("mousemove", updateTarget, { passive: true });
    window.addEventListener("resize", updateMascotCenter);
    document.addEventListener("mouseleave", resetTarget);
    window.addEventListener("blur", resetTarget);

    return () => {
      window.removeEventListener("mousemove", updateTarget);
      window.removeEventListener("resize", updateMascotCenter);
      document.removeEventListener("mouseleave", resetTarget);
      window.removeEventListener("blur", resetTarget);

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const stateLabel = getStateLabel(state);

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
        className="mascot-eye-rig pointer-events-none absolute left-1/2 top-[32%] z-20 h-[12%] w-[48%] -translate-x-1/2 sm:top-[38%] sm:h-[12.5%] sm:w-[48%]"
        viewBox="0 0 184 74"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="left-mascot-eye">
            <path d="M13 39C24 18 63 12 92 31C82 54 39 62 13 39Z" />
          </clipPath>
          <clipPath id="right-mascot-eye">
            <path d="M92 31C121 12 160 18 171 39C145 62 102 54 92 31Z" />
          </clipPath>
          <radialGradient id="mascot-eye-white" cx="48%" cy="34%" r="72%">
            <stop offset="0%" stopColor="#fffdf5" />
            <stop offset="64%" stopColor="#fff3df" />
            <stop offset="100%" stopColor="#ead6bc" />
          </radialGradient>
          <radialGradient id="mascot-pupil-core" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#2a211b" />
            <stop offset="58%" stopColor="#120d0a" />
            <stop offset="100%" stopColor="#050403" />
          </radialGradient>
          <filter id="mascot-eye-inset" x="-20%" y="-30%" width="140%" height="160%">
            <feDropShadow dx="0" dy="1.4" stdDeviation="1.1" floodColor="#5a160e" floodOpacity="0.35" />
            <feDropShadow dx="0" dy="-1" stdDeviation="0.7" floodColor="#fff8e7" floodOpacity="0.4" />
          </filter>
          <filter id="mascot-pupil-soft" x="-35%" y="-35%" width="170%" height="170%">
            <feDropShadow dx="0" dy="1.2" stdDeviation="0.9" floodColor="#2d0905" floodOpacity="0.42" />
          </filter>
        </defs>

        <path
          className="mascot-eye-white"
          d="M13 39C24 18 63 12 92 31C82 54 39 62 13 39Z"
          fill="url(#mascot-eye-white)"
        />
        <path
          className="mascot-eye-shade"
          d="M15 39C28 49 66 47 88 31C82 54 39 62 13 39Z"
        />
        <g clipPath="url(#left-mascot-eye)">
          <g className="mascot-eye-pupil">
            <ellipse className="mascot-eye-pupil-shadow" cx="56" cy="43" rx="15" ry="11" />
            <ellipse className="mascot-eye-pupil-core" cx="55" cy="38" rx="11.5" ry="14" fill="url(#mascot-pupil-core)" />
            <circle className="mascot-eye-pupil-highlight" cx="59" cy="33" r="3" />
          </g>
        </g>

        <path
          className="mascot-eye-white"
          d="M92 31C121 12 160 18 171 39C145 62 102 54 92 31Z"
          fill="url(#mascot-eye-white)"
        />
        <path
          className="mascot-eye-shade"
          d="M96 32C118 48 156 49 169 39C145 62 102 54 92 31Z"
        />
        <g clipPath="url(#right-mascot-eye)">
          <g className="mascot-eye-pupil">
            <ellipse className="mascot-eye-pupil-shadow" cx="128" cy="43" rx="15" ry="11" />
            <ellipse className="mascot-eye-pupil-core" cx="129" cy="38" rx="11.5" ry="14" fill="url(#mascot-pupil-core)" />
            <circle className="mascot-eye-pupil-highlight" cx="133" cy="33" r="3" />
          </g>
        </g>
      </svg>
    </div>
  );
}
