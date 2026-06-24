"use client";

import { useState } from "react";
import AngryMascot, { type MascotState } from "@/components/AngryMascot";
import HandDrawnDecorations from "@/components/HandDrawnDecorations";
import SubmitForm from "@/components/SubmitForm";

export default function HomeClient() {
  const [mascotState, setMascotState] = useState<MascotState>("idle");

  return (
    <main className="relative min-h-screen overflow-hidden bg-yolk text-ink">
      <HandDrawnDecorations />

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="ticker-strip border-b-[3px] border-ink bg-ink py-2 text-cream">
          <div className="ticker-track font-display text-xs uppercase">
            <span>HOT WISH DELIVERY</span>
            <span>怒怒正在偷吃心愿</span>
            <span>DOUYIN</span>
            <span>XIAOHONGSHU</span>
            <span>NO REVIEW QUEUE</span>
            <span>JUST FEED NUNU</span>
            <span>HOT WISH DELIVERY</span>
            <span>怒怒正在偷吃心愿</span>
            <span>DOUYIN</span>
            <span>XIAOHONGSHU</span>
            <span>NO REVIEW QUEUE</span>
            <span>JUST FEED NUNU</span>
          </div>
        </div>

        <section className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-6 overflow-x-hidden px-5 py-7 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-x-12 lg:gap-y-5 lg:px-10 lg:py-10">
          <div className="order-1 lg:col-start-1 lg:row-start-1 lg:self-end">
            <div className="mb-5 inline-flex rotate-[-1deg] items-center gap-2 border-[3px] border-ink bg-cream px-3 py-2 font-display text-sm shadow-sketch-sm">
              <span className="inline-block h-3 w-3 animate-flame-jump rounded-full bg-chili" />
              愿望投递台开张中
            </div>

            <h1 className="title-logo" aria-label="会偷吃心愿的怒怒">
              <span className="title-line title-line-top" aria-hidden="true">
                {"会偷吃心愿的".split("").map((char, index) => (
                  <span className="title-char" data-index={index} key={`${char}-${index}`}>
                    {char}
                  </span>
                ))}
              </span>
              <span className="title-line title-line-bottom" aria-hidden="true">
                {"怒怒".split("").map((char, index) => (
                  <span className="title-char" data-index={index + 6} key={`${char}-${index}`}>
                    {char}
                  </span>
                ))}
              </span>
            </h1>

            <p className="mt-5 max-w-2xl font-body text-lg leading-8 text-ink sm:text-xl">
              把抖音和小红书里的想吃瞬间丢给怒怒，它会偷偷替你记下来。
            </p>
          </div>

          <div className="order-2 flex justify-center lg:col-start-2 lg:row-start-2 lg:self-center">
            <div className="relative w-full max-w-[500px]">
              <div className="absolute left-2 top-5 hidden rotate-[-8deg] border-[3px] border-ink bg-paper px-4 py-2 font-display text-sm shadow-sketch-sm sm:block">
                怒气值 99%
              </div>
              <AngryMascot state={mascotState} />
              <div className="mx-auto mt-[-16px] w-[80%] border-[3px] border-ink bg-cream px-4 py-3 text-center font-display text-sm shadow-sketch-sm">
                粘贴链接，别让它饿着。
              </div>
            </div>
          </div>

          <div className="order-3 lg:col-start-1 lg:row-start-2 lg:self-center">
            <SubmitForm onMascotStateChange={setMascotState} />
          </div>
        </section>
      </div>
    </main>
  );
}
