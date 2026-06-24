"use client";

import { useMemo, useState } from "react";
import type { ReadStatus, Submission } from "@/types/submission";

interface VaultRecordsProps {
  initialSubmissions: Submission[];
}

interface SubmissionUpdateResponse {
  success: boolean;
  data?: Submission;
  message?: string;
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

function statusLabel(status: Submission["parseStatus"]) {
  if (status === "success") {
    return "已识别";
  }

  if (status === "saved_only") {
    return "已收下";
  }

  if (status === "failed") {
    return "没听清";
  }

  return "处理中";
}

function readStatusLabel(status: ReadStatus) {
  return status === "read" ? "已读" : "未读";
}

function formatTime(value: string) {
  return new Date(value).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function previewText(value: string) {
  const trimmed = value.trim();

  if (trimmed.length <= 132) {
    return trimmed || "没有原始文本";
  }

  return `${trimmed.slice(0, 132)}...`;
}

async function copyText(value: string | null) {
  if (!value) {
    return;
  }

  await navigator.clipboard.writeText(value);
}

export default function VaultRecords({ initialSubmissions }: VaultRecordsProps) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const stats = useMemo(() => {
    return {
      total: submissions.length,
      unread: submissions.filter((submission) => submission.readStatus !== "read").length,
      identified: submissions.filter((submission) => submission.parseStatus === "success").length,
    };
  }, [submissions]);

  const updateReadStatus = async (submission: Submission) => {
    const nextStatus: ReadStatus = submission.readStatus === "read" ? "unread" : "read";
    setBusyId(submission.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/submissions/${submission.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          readStatus: nextStatus,
        }),
      });
      const result = (await response.json()) as SubmissionUpdateResponse;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message ?? "更新失败");
      }

      setSubmissions((current) =>
        current.map((item) => (item.id === submission.id ? result.data! : item)),
      );
    } catch {
      setMessage("怒怒刚刚没按住标记，稍后再试一次。");
    } finally {
      setBusyId(null);
    }
  };

  const deleteRecord = async (submission: Submission) => {
    setBusyId(submission.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/submissions/${submission.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除失败");
      }

      setSubmissions((current) => current.filter((item) => item.id !== submission.id));
      setPendingDeleteId(null);
    } catch {
      setMessage("怒怒这次没忘干净，稍后再试。");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="vault-header">
        <div>
          <p className="vault-kicker">NUNU VAULT</p>
          <h1 className="vault-title">怒怒偷来的心愿</h1>
        </div>
        <div className="vault-stats">
          <div>
            <span>全部</span>
            <strong>{stats.total}</strong>
          </div>
          <div>
            <span>未读</span>
            <strong>{stats.unread}</strong>
          </div>
          <div>
            <span>已识别</span>
            <strong>{stats.identified}</strong>
          </div>
        </div>
      </div>

      {message && (
        <p className="vault-message" role="status">
          {message}
        </p>
      )}

      {submissions.length === 0 ? (
        <div className="vault-empty">
          <p className="font-display text-2xl">还没有心愿被怒怒偷到。</p>
          <p className="mt-2 text-sm">等第一条抖音 / 小红书美食链接投喂进来，这里会自动出现。</p>
        </div>
      ) : (
        <div className="vault-list">
          {submissions.map((submission) => {
            const isRead = submission.readStatus === "read";
            const isBusy = busyId === submission.id;
            const confirmOpen = pendingDeleteId === submission.id;

            return (
              <article
                className={`vault-record ${isRead ? "vault-record-read" : "vault-record-unread"}`}
                key={submission.id}
              >
                <div className="vault-record-top">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="status-sticker bg-cream text-ink">
                      {platformLabel(submission.sourcePlatform)}
                    </span>
                    <span className={`vault-read-badge vault-read-${submission.readStatus}`}>
                      {readStatusLabel(submission.readStatus)}
                    </span>
                    <span className="status-sticker bg-paper text-ink">
                      {statusLabel(submission.parseStatus)}
                    </span>
                  </div>
                  <time className="vault-time">{formatTime(submission.createdAt)}</time>
                </div>

                <h2 className="mt-4 break-words font-display text-2xl text-chili">
                  {submission.extractedDishName ?? "未识别菜名"}
                </h2>
                <p className="mt-2 break-words text-sm font-bold">
                  {submission.title ?? "暂时没有标题"}
                </p>
                <p className="vault-raw-preview">{previewText(submission.rawInput)}</p>

                <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                  <p className="vault-link">作者：{submission.author ?? "暂时未知"}</p>
                  <p>置信度：{Math.round(submission.confidence * 100)}%</p>
                </div>

                {submission.dishCandidates.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {submission.dishCandidates.map((candidate) => (
                      <span className="candidate-chip" key={candidate}>
                        {candidate}
                      </span>
                    ))}
                  </div>
                )}

                {submission.errorMessage && (
                  <p className="mt-3 border-l-[4px] border-ink pl-3 text-sm">
                    {submission.errorMessage}
                  </p>
                )}

                <div className="vault-actions">
                  {submission.extractedUrl ? (
                    <a
                      className="vault-action"
                      href={submission.extractedUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      打开原链接
                    </a>
                  ) : (
                    <span className="vault-action vault-action-disabled">没有链接</span>
                  )}
                  <button
                    className="vault-action"
                    type="button"
                    onClick={() => copyText(submission.extractedUrl)}
                    disabled={!submission.extractedUrl}
                  >
                    复制链接
                  </button>
                  <button
                    className="vault-action"
                    type="button"
                    onClick={() => copyText(submission.rawInput)}
                  >
                    复制原文
                  </button>
                  <button
                    className="vault-action"
                    type="button"
                    onClick={() => updateReadStatus(submission)}
                    disabled={isBusy}
                  >
                    {isRead ? "标为未读" : "标为已读"}
                  </button>
                  <button
                    className="vault-action vault-action-danger"
                    type="button"
                    onClick={() => setPendingDeleteId(submission.id)}
                    disabled={isBusy}
                  >
                    忘掉
                  </button>
                </div>

                {confirmOpen && (
                  <div className="vault-confirm" role="group" aria-label="删除确认">
                    <p>真的要让怒怒忘掉这条心愿吗？</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="vault-confirm-button vault-confirm-danger"
                        onClick={() => deleteRecord(submission)}
                        disabled={isBusy}
                      >
                        忘掉它
                      </button>
                      <button
                        type="button"
                        className="vault-confirm-button"
                        onClick={() => setPendingDeleteId(null)}
                        disabled={isBusy}
                      >
                        再想想
                      </button>
                    </div>
                  </div>
                )}

                <details className="vault-detail">
                  <summary>查看详情</summary>
                  <div className="vault-detail-body">
                    <div>
                      <p className="vault-detail-label">原始投喂文本</p>
                      <p className="vault-raw-full">{submission.rawInput || "没有原始文本"}</p>
                    </div>

                    <div className="vault-detail-grid">
                      <p>提取链接：{submission.extractedUrl ?? "未找到"}</p>
                      <p>解析链接：{submission.resolvedUrl ?? "未展开"}</p>
                      <p>视频地址：{submission.videoUrl ?? "未获取"}</p>
                      <p>更新时间：{formatTime(submission.updatedAt)}</p>
                    </div>

                    <div className="vault-actions">
                      <button
                        className="vault-action"
                        type="button"
                        onClick={() => copyText(submission.rawInput)}
                      >
                        复制完整原文
                      </button>
                      <button
                        className="vault-action vault-action-danger"
                        type="button"
                        onClick={() => setPendingDeleteId(submission.id)}
                        disabled={isBusy}
                      >
                        忘掉
                      </button>
                    </div>
                  </div>
                </details>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
