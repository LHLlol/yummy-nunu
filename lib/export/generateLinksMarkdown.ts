import type { ReadStatus, SourcePlatform, Submission } from "@/types/submission";

function platformLabel(platform: SourcePlatform) {
  if (platform === "douyin") {
    return "抖音";
  }

  if (platform === "xiaohongshu") {
    return "小红书";
  }

  return "其他";
}

function readStatusLabel(status: ReadStatus | undefined) {
  return status === "read" ? "已读" : "未读";
}

function ownerStatusLabel(status: string | null | undefined) {
  const labels: Record<string, string> = {
    new: "新提交",
    planned: "想安排",
    queued: "已排队",
    eaten: "已吃掉",
    paused: "先放着",
    新提交: "新提交",
    想安排: "想安排",
    已排队: "已排队",
    已吃掉: "已吃掉",
    先放着: "先放着",
  };

  if (!status) {
    return "新提交";
  }

  return labels[status] ?? status;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "暂无";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function safeText(value: string | null | undefined, fallback = "暂无") {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function sortByCreatedAtDesc(submissions: Submission[]) {
  return [...submissions].sort((left, right) => {
    const leftTime = new Date(left.createdAt).getTime();
    const rightTime = new Date(right.createdAt).getTime();
    return rightTime - leftTime;
  });
}

function isEaten(submission: Submission) {
  return ownerStatusLabel(submission.ownerStatus) === "已吃掉";
}

export function generateLinksMarkdown(submissions: Submission[]): string {
  const sortedSubmissions = sortByCreatedAtDesc(submissions);
  const douyinCount = sortedSubmissions.filter((item) => item.sourcePlatform === "douyin").length;
  const xiaohongshuCount = sortedSubmissions.filter(
    (item) => item.sourcePlatform === "xiaohongshu",
  ).length;
  const unreadCount = sortedSubmissions.filter((item) => item.readStatus !== "read").length;
  const readCount = sortedSubmissions.filter((item) => item.readStatus === "read").length;
  const eatenCount = sortedSubmissions.filter(isEaten).length;
  const lines = [
    "# 会偷吃心愿的怒怒｜链接汇总文档",
    "",
    `生成时间：${formatDateTime(new Date().toISOString())}`,
    `总数量：${sortedSubmissions.length} 条`,
    `抖音：${douyinCount} 条`,
    `小红书：${xiaohongshuCount} 条`,
    `未读：${unreadCount} 条`,
    `已读：${readCount} 条`,
    `已吃掉：${eatenCount} 条`,
    "",
  ];

  sortedSubmissions.forEach((submission, index) => {
    const sequence = String(index + 1).padStart(2, "0");
    const dishName = safeText(submission.extractedDishName, "未识别菜名");

    lines.push(
      `## ${sequence}. ${dishName}`,
      "",
      `- 平台：${platformLabel(submission.sourcePlatform)}`,
      `- 阅读状态：${readStatusLabel(submission.readStatus)}`,
      `- 处理状态：${ownerStatusLabel(submission.ownerStatus)}`,
      `- 视频标题：${safeText(submission.title)}`,
      `- 作者：${safeText(submission.author)}`,
      `- 视频链接：${safeText(submission.extractedUrl, "未识别")}`,
      `- 提交时间：${formatDateTime(submission.createdAt)}`,
      `- 备注：${safeText(submission.ownerNote, "未填写")}`,
      "",
      "### 原始投喂文本",
      "",
      safeText(submission.rawInput),
      "",
    );
  });

  lines.push("---", "由「会偷吃心愿的怒怒」自动整理。");

  return lines.join("\n");
}
