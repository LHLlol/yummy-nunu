"use client";

import { useEffect, useRef, useState } from "react";

const MAX_PUPIL_OFFSET = 8;

export type MascotState = "idle" | "listening" | "received" | "error" | "unlocked";

interface PupilOffset {
  x: number;
  y: number;
}

interface AngryMascotProps {
  state?: MascotState;
}

function clampVector(x: number, y: number, max: number): PupilOffset {
  const length = Math.hypot(x, y);

  if (length <= max) {
    return { x, y };
  }

  const scale = max / length;
  return { x: x * scale, y: y * scale };
}

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
    const updateEyes = (clientX: number, clientY: number) => {
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

        if (state === "unlocked") {
          setPupilOffset({ x: 0, y: 0 });
          return;
        }

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height * 0.45;
        const rawX = ((clientX - centerX) / rect.width) * MAX_PUPIL_OFFSET * 2.7;
        const rawY = ((clientY - centerY) / rect.height) * MAX_PUPIL_OFFSET * 3.2;

        setPupilOffset(clampVector(rawX, rawY, MAX_PUPIL_OFFSET));
      });
    };

    const handleMouseMove = (event: MouseEvent) => updateEyes(event.clientX, event.clientY);
    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) {
        updateEyes(touch.clientX, touch.clientY);
      }
    };
    const resetEyes = () => setPupilOffset({ x: 0, y: 0 });

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("mouseleave", resetEyes);
    window.addEventListener("blur", resetEyes);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseleave", resetEyes);
      window.removeEventListener("blur", resetEyes);

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [state]);

  const pupilStyle = {
    transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
  };
  const stateLabel = getStateLabel(state);

  return (
    <div
      ref={mascotRef}
      className={`mascot-stage mascot-state-${state} relative mx-auto h-[410px] w-[320px] sm:h-[500px] sm:w-[400px]`}
      aria-label="怒怒主视觉角色，眼睛会跟随鼠标移动"
    >
      <div className="mascot-shadow" />

      {stateLabel && (
        <div className="mascot-state-badge" aria-live="polite">
          {stateLabel}
        </div>
      )}

      <div className="flame-plume" aria-hidden="true">
        <span className="flame-glow" />
        <span className="flame-tongue flame-tongue-1" />
        <span className="flame-tongue flame-tongue-2" />
        <span className="flame-tongue flame-tongue-3" />
        <span className="flame-tongue flame-tongue-4" />
        <span className="flame-tongue flame-tongue-5" />
        <span className="flame-tongue flame-tongue-6" />
      </div>

      <div className="mascot-head-body">
        <div className="body-grain" />
        <div className="mascot-brow brow-left" />
        <div className="mascot-brow brow-right" />
        <div className="lower-eye-fold fold-left" />
        <div className="lower-eye-fold fold-right" />

        <div className="mascot-eye eye-left">
          <div className="mascot-pupil" style={pupilStyle}>
            <span />
          </div>
        </div>
        <div className="mascot-eye eye-right">
          <div className="mascot-pupil" style={pupilStyle}>
            <span />
          </div>
        </div>

        <div className="mascot-mouth">
          <div className="teeth-row">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="mascot-cheek cheek-left" />
        <div className="mascot-cheek cheek-right" />
        <div className="mascot-shirt">
          <span className="shirt-pocket" />
          <span className="shirt-button button-1" />
          <span className="shirt-button button-2" />
        </div>
        <div className="shirt-collar collar-left" />
        <div className="shirt-collar collar-right" />
        <div className="mascot-tie">
          <span className="tie-knot" />
          <span className="tie-blade" />
        </div>
        <div className="mascot-belt">
          <span />
        </div>
      </div>

      <div className="mascot-arm arm-left">
        <span className="shirt-sleeve" />
        <span className="mascot-fist" />
      </div>
      <div className="mascot-arm arm-right">
        <span className="shirt-sleeve" />
        <span className="mascot-fist" />
      </div>
      <div className="mascot-pants">
        <div className="pant-leg pant-left">
          <span className="pant-cuff" />
        </div>
        <div className="pant-leg pant-right">
          <span className="pant-cuff" />
        </div>
      </div>
    </div>
  );
}
