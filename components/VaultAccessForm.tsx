"use client";

import { FormEvent, useState } from "react";
import { isVaultEntryCode, unlockVaultSession } from "@/lib/vault/access";

interface VaultAccessFormProps {
  onUnlocked?: () => void;
}

export default function VaultAccessForm({ onUnlocked }: VaultAccessFormProps) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (!isVaultEntryCode(code)) {
        setMessage("怒怒摇头：这不是那句口令。");
        return;
      }

      unlockVaultSession();
      onUnlocked?.();
    } catch {
      setMessage("怒怒暂时没听见，请再试一次。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="vault-lock-box" onSubmit={handleSubmit}>
      <p className="font-display text-2xl">怒怒把这里锁起来了</p>
      <label className="mt-5 block text-sm font-bold" htmlFor="vault-code">
        口令
      </label>
      <input
        id="vault-code"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        className="vault-input"
        placeholder="输入口令"
        type="password"
        autoComplete="off"
      />
      <button className="feed-button mt-4 w-full" disabled={isLoading} type="submit">
        {isLoading ? "怒怒确认中……" : "打开"}
      </button>
      {message && (
        <p className="mt-4 border-l-[4px] border-ink pl-3 text-sm" role="status">
          {message}
        </p>
      )}
    </form>
  );
}
