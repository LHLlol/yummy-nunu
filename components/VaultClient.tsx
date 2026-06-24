"use client";

import { useEffect, useState } from "react";
import VaultAccessForm from "@/components/VaultAccessForm";
import VaultRecords from "@/components/VaultRecords";
import { hasVaultSessionAccess } from "@/lib/vault/access";

export default function VaultClient() {
  const [hasAccess, setHasAccess] = useState(false);
  const [hasCheckedAccess, setHasCheckedAccess] = useState(false);

  useEffect(() => {
    setHasAccess(hasVaultSessionAccess());
    setHasCheckedAccess(true);
  }, []);

  if (!hasCheckedAccess) {
    return (
      <main className="vault-page">
        <section className="vault-shell vault-lock-shell">
          <p className="vault-kicker">NUNU VAULT</p>
        </section>
      </main>
    );
  }

  if (!hasAccess) {
    return (
      <main className="vault-page">
        <section className="vault-shell vault-lock-shell">
          <div>
            <p className="vault-kicker">NUNU VAULT</p>
            <h1 className="vault-title">心愿小库</h1>
            <p className="mt-4 max-w-md text-sm leading-7">
              这里用来整理投喂过来的美食心愿。没有口令时，怒怒会守在门口。
            </p>
          </div>
          <VaultAccessForm onUnlocked={() => setHasAccess(true)} />
        </section>
      </main>
    );
  }

  return (
    <main className="vault-page">
      <section className="vault-shell">
        <VaultRecords />
      </section>
    </main>
  );
}
