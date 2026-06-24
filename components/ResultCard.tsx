import type { Submission } from "@/types/submission";
import LoadingFlame from "./LoadingFlame";

interface ResultCardProps {
  isLoading: boolean;
  submission: Submission | null;
}

function platformLabel(platform: Submission["sourcePlatform"]) {
  if (platform === "douyin") {
    return "抖音";
  }

  if (platform === "xiaohongshu") {
    return "小红书";
  }

  return "暂不支持";
}

export default function ResultCard({ isLoading, submission }: ResultCardProps) {
  if (isLoading) {
    return (
      <section className="result-card animate-pop-in" aria-live="polite">
        <div className="flex items-center gap-3">
          <LoadingFlame />
          <div>
            <p className="font-display text-xl">怒怒正在偷听这个链接……</p>
            <p className="mt-1 text-sm">它会先保存原文，再试着识别平台和菜名。</p>
          </div>
        </div>
      </section>
    );
  }

  if (!submission) {
    return null;
  }

  const isSuccess = submission.parseStatus === "success";
  const dishName = submission.extractedDishName ?? "还没听清";

  return (
    <section className="result-card animate-pop-in" aria-live="polite">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`status-sticker ${
            isSuccess ? "bg-pickle text-paper" : "bg-chili text-paper"
          }`}
        >
          {isSuccess ? "已记住" : "先收下"}
        </span>
        <span className="status-sticker bg-cream text-ink">
          平台：{platformLabel(submission.sourcePlatform)}
        </span>
      </div>

      <div className="mt-4">
        <p className="font-display text-2xl">
          {isSuccess ? "怒怒已经记住啦！" : "怒怒这次没听清，但已经把链接收下了。"}
        </p>
        <p className="mt-3 font-display text-3xl text-chili sm:text-4xl">
          {submission.confidence < 0.35 ? "疑似想吃：" : "今天想吃："}
          {dishName}
        </p>
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div className="info-box">
          <span>识别标题</span>
          <strong>{submission.title ?? "暂时没有标题"}</strong>
        </div>
        <div className="info-box">
          <span>置信度</span>
          <strong>{Math.round(submission.confidence * 100)}%</strong>
        </div>
      </div>

      {submission.dishCandidates.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {submission.dishCandidates.map((candidate) => (
            <span key={candidate} className="candidate-chip">
              {candidate}
            </span>
          ))}
        </div>
      )}

      {!isSuccess && (
        <p className="mt-4 border-l-[4px] border-ink pl-3 text-sm leading-6">
          {submission.errorMessage ?? "可以稍后重试，或者在分享文案里补一句菜名。"}
        </p>
      )}

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-display">查看怒怒偷听到的线索</summary>
        <div className="mt-3 space-y-2 break-all border-[3px] border-ink bg-paper p-3">
          <p>链接：{submission.extractedUrl ?? "未找到"}</p>
          <p>记录时间：{new Date(submission.createdAt).toLocaleString("zh-CN")}</p>
          <p>状态：{submission.parseStatus}</p>
          {submission.errorMessage && <p>提示：{submission.errorMessage}</p>}
        </div>
      </details>
    </section>
  );
}
