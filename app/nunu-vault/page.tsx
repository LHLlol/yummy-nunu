import { cookies } from "next/headers";
import VaultAccessForm from "@/components/VaultAccessForm";
import VaultRecords from "@/components/VaultRecords";
import { listSubmissions } from "@/lib/storage/saveSubmission";

export const dynamic = "force-dynamic";

const VAULT_COOKIE = "nunu_vault_access";

export default async function NunuVaultPage() {
  const cookieStore = await cookies();
  const hasAccess = cookieStore.get(VAULT_COOKIE)?.value === "true";

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
          <VaultAccessForm />
        </section>
      </main>
    );
  }

  const submissions = await listSubmissions();

  return (
    <main className="vault-page">
      <section className="vault-shell">
        <VaultRecords initialSubmissions={submissions} />
      </section>
    </main>
  );
}
