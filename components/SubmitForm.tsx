"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { MascotState } from "@/components/AngryMascot";
import { detectPlatform } from "@/lib/parser/detectPlatform";
import { extractUrlFromText } from "@/lib/parser/extractUrlFromText";
import type { ParseApiResponse, Submission } from "@/types/submission";

interface AdminShortcutResponse {
  success: boolean;
  redirectTo?: string;
  message?: string;
}

interface SubmitFormProps {
  onMascotStateChange?: (state: MascotState) => void;
}

function platformLabel(platform: Submission["sourcePlatform"]) {
  if (platform === "douyin") {
    return "抖音";
  }

  if (platform === "xiaohongshu") {
    return "小红书";
  }

  return "未知平台";
}

function isPotentialVaultCode(value: string) {
  return /^[a-z]{3}\d{8}$/i.test(value);
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export default function SubmitForm({ onMascotStateChange }: SubmitFormProps) {
  const router = useRouter();
  const [rawInput, setRawInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const extractedUrl = useMemo(() => extractUrlFromText(rawInput), [rawInput]);
  const detectedPlatform = useMemo(() => detectPlatform(extractedUrl), [extractedUrl]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = rawInput.trim();

    if (!value) {
      onMascotStateChange?.("error");
      setSubmission(null);
      setFormMessage("怒怒没找到链接，再粘贴一次试试。");
      return;
    }

    setIsLoading(true);
    setSubmission(null);
    setFormMessage(null);
    onMascotStateChange?.("listening");

    try {
      if (isPotentialVaultCode(value)) {
        const shortcutResponse = await fetch("/api/admin/shortcut", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code: value }),
        });
        const shortcut = (await shortcutResponse.json()) as AdminShortcutResponse;

        if (shortcut.success && shortcut.redirectTo) {
          onMascotStateChange?.("unlocked");
          window.sessionStorage.setItem("nunu_vault_unlocked", "true");
          await wait(950);
          router.push(shortcut.redirectTo);
          return;
        }
      }

      const response = await fetch("/api/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rawInput }),
      });

      const result = (await response.json()) as ParseApiResponse;
      setSubmission(result.data);

      if (result.success) {
        onMascotStateChange?.("received");
        setFormMessage(null);
      } else {
        onMascotStateChange?.("error");
        setFormMessage(result.data.errorMessage ?? "怒怒这次没听清，可以稍后再试。");
      }
    } catch {
      onMascotStateChange?.("error");
      const now = new Date().toISOString();
      setSubmission({
        id: crypto.randomUUID(),
        rawInput,
        extractedUrl,
        resolvedUrl: extractedUrl,
        sourcePlatform: detectedPlatform,
        title: null,
        author: null,
        coverUrl: null,
        videoUrl: null,
        textContent: rawInput,
        extractedDishName: null,
        dishCandidates: [],
        confidence: 0,
        parseStatus: "failed",
        errorMessage: "怒怒这次被辣到断线了，请稍后再试。",
        readStatus: "unread",
        ownerStatus: null,
        ownerNote: null,
        createdAt: now,
        updatedAt: now,
      });
      setFormMessage("怒怒这次被辣到断线了，请稍后再试。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <form className="wish-box" onSubmit={handleSubmit}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <label htmlFor="wish-input" className="font-display text-lg">
            把心愿丢进来
          </label>

          <div className="flex flex-wrap gap-2 text-xs">
            {extractedUrl ? (
              <span className="status-sticker bg-cream text-ink">
                嗅到：{platformLabel(detectedPlatform)}
              </span>
            ) : (
              <span className="status-sticker bg-paper text-ink">等一个链接</span>
            )}
            {rawInput && (
              <button
                type="button"
                className="clear-button"
                onClick={() => {
                  setRawInput("");
                  setSubmission(null);
                  setFormMessage(null);
                  onMascotStateChange?.("idle");
                }}
              >
                清空盒子
              </button>
            )}
          </div>
        </div>

        <textarea
          id="wish-input"
          value={rawInput}
          onChange={(event) => {
            setRawInput(event.target.value);
            setFormMessage(null);
            onMascotStateChange?.("idle");
          }}
          placeholder="把抖音 / 小红书分享内容粘贴到这里……链接、整段文案都可以。"
          className="wish-textarea"
          rows={7}
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-sm leading-6">
            支持直接链接，也支持整段分享文案。怒怒会先记录，再尝试偷听菜名。
          </p>

          <button type="submit" disabled={isLoading} className="feed-button">
            {isLoading ? "怒怒偷听中……" : "投喂怒怒"}
          </button>
        </div>
      </form>

      {formMessage && (
        <p className="submit-inline-message" role="status">
          {formMessage}
        </p>
      )}
    </div>
  );
}
