"use client";

export type MascotState = "idle" | "listening" | "received" | "error" | "unlocked";

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
  const stateLabel = getStateLabel(state);

  return (
    <div
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
    </div>
  );
}
