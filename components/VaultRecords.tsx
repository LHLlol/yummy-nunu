"use client";

import { useEffect, useMemo, useState } from "react";
import { downloadTextFile } from "@/lib/export/downloadTextFile";
import { generateLinksMarkdown } from "@/lib/export/generateLinksMarkdown";
import {
  deleteLocalSubmission,
  readLocalSubmissions,
  updateLocalSubmission,
} from "@/lib/storage/localSubmissions";
import type { ReadStatus, Submission } from "@/types/submission";

function platformLabel(platform: Submission["sourcePlatform"]) {
  if (platform === "douyin") {
    return "抖音";
  }

  if (platform === "xiaohongshu") {
    return "小红书";
  }

  return "其他";
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

function formatTime(value: string) {
  return new Date(value).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function exportDateStamp() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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
    return false;
  }

  await navigator.clipboard.writeText(value);
  return true;
}

export default function VaultRecords() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [documentText, setDocumentText] = useState("");
  const [isDocumentVisible, setIsDocumentVisible] = useState(false);

  useEffect(() => {
    setSubmissions(readLocalSubmissions());
  }, []);

  const stats = useMemo(() => {
    return {
      total: submissions.length,
      unread: submissions.filter((submission) => submission.readStatus !== "read").length,
      identified: submissions.filter((submission) => submission.parseStatus === "success").length,
    };
  }, [submissions]);

  const syncSubmissions = (nextSubmissions: Submission[]) => {
    setSubmissions(nextSubmissions);

    if (isDocumentVisible && documentText) {
      setDocumentText(generateLinksMarkdown(nextSubmissions));
    }
  };

  const getFreshDocument = () => {
    const freshSubmissions = readLocalSubmissions();

    if (freshSubmissions.length === 0) {
      setSubmissions([]);
      setMessage("怒怒的档案室还是空的，还没有可以汇总的链接。");
      return null;
    }

    setSubmissions(freshSubmissions);
    return generateLinksMarkdown(freshSubmissions);
  };

  const generateDocument = () => {
    const markdown = getFreshDocument();

    if (!markdown) {
      setDocumentText("");
      setIsDocumentVisible(false);
      return;
    }

    setDocumentText(markdown);
    setIsDocumentVisible(true);
    setMessage("怒怒已经整理好链接汇总文档。");
  };

  const copyDocument = async () => {
    const markdown = getFreshDocument();

    if (!markdown) {
      return;
    }

    try {
      await navigator.clipboard.writeText(markdown);
      setDocumentText(markdown);
      setIsDocumentVisible(true);
      setMessage("怒怒已经把汇总文档塞进剪贴板。");
    } catch {
      setDocumentText(markdown);
      setIsDocumentVisible(true);
      setMessage("怒怒没复制成功，可以手动选中文档内容。");
    }
  };

  const downloadDocument = (extension: "md" | "txt") => {
    const markdown = getFreshDocument();

    if (!markdown) {
      return;
    }

    const filename = `nunu-wish-links-${exportDateStamp()}.${extension}`;
    const mimeType =
      extension === "md" ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8";

    setDocumentText(markdown);
    setIsDocumentVisible(true);
    downloadTextFile(filename, markdown, mimeType);
  };

  const updateReadStatus = (submission: Submission) => {
    const nextStatus: ReadStatus = submission.readStatus === "read" ? "unread" : "read";
    setBusyId(submission.id);
    setMessage(null);

    const updatedSubmission = updateLocalSubmission(submission.id, {
      readStatus: nextStatus,
    });

    if (!updatedSubmission) {
      setMessage("怒怒刚刚没按住标记，稍后再试一次。");
      setBusyId(null);
      return;
    }

    const nextSubmissions = submissions.map((item) =>
      item.id === submission.id ? updatedSubmission : item,
    );
    syncSubmissions(nextSubmissions);
    setBusyId(null);
  };

  const deleteRecord = (submission: Submission) => {
    setBusyId(submission.id);
    setMessage(null);

    const deleted = deleteLocalSubmission(submission.id);

    if (!deleted) {
      setMessage("怒怒这次没忘干净，稍后再试。");
      setBusyId(null);
      return;
    }

    const nextSubmissions = submissions.filter((item) => item.id !== submission.id);
    syncSubmissions(nextSubmissions);
    setPendingDeleteId(null);
    setBusyId(null);
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

      <section className="vault-export-panel" aria-label="怒怒汇总文档">
        <div>
          <p className="vault-export-kicker">EXPORT MENU</p>
          <h2>怒怒汇总文档</h2>
          <p>
            把所有偷听到的视频链接整理成一份文档，方便你慢慢研究今天到底想吃什么。
          </p>
        </div>

        <div className="vault-export-actions">
          <button type="button" className="vault-action vault-action-hot" onClick={generateDocument}>
            生成汇总文档
          </button>
          <button type="button" className="vault-action" onClick={copyDocument}>
            复制文档
          </button>
          <button type="button" className="vault-action" onClick={() => downloadDocument("md")}>
            下载 Markdown
          </button>
          <button type="button" className="vault-action" onClick={() => downloadDocument("txt")}>
            下载 TXT
          </button>
          {isDocumentVisible && (
            <button
              type="button"
              className="vault-action"
              onClick={() => setIsDocumentVisible(false)}
            >
              收起文档
            </button>
          )}
        </div>

        {isDocumentVisible && documentText && (
          <textarea
            className="vault-export-preview"
            readOnly
            value={documentText}
            aria-label="链接汇总文档预览"
          />
        )}
      </section>

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
                    <span className="status-sticker bg-cream text-ink">
                      {ownerStatusLabel(submission.ownerStatus)}
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
                      <p>处理状态：{ownerStatusLabel(submission.ownerStatus)}</p>
                      <p>主人备注：{submission.ownerNote ?? "未填写"}</p>
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
