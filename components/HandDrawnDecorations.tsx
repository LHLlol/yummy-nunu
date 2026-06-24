export default function HandDrawnDecorations() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="doodle doodle-plate left-[3%] top-[14%]" />
      <div className="doodle doodle-chili right-[6%] top-[11%]" />
      <div className="doodle doodle-fork left-[8%] bottom-[13%]" />
      <div className="doodle doodle-note right-[9%] bottom-[10%]">想吃</div>
      <div className="absolute bottom-[22%] left-[43%] hidden rotate-[-11deg] border-[3px] border-ink bg-paper px-3 py-2 font-display text-xs shadow-sketch-sm lg:block">
        HOT
      </div>
      <div className="absolute right-[35%] top-[11%] hidden h-8 w-8 animate-flame-jump rounded-full border-[3px] border-ink bg-flame sm:block" />
    </div>
  );
}
