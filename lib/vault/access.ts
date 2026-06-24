const ADMIN_ENTRY_CODE = ["lhl", "20040919"].join("");

export const VAULT_SESSION_KEY = "nunu_vault_unlocked";

export function isVaultEntryCode(value: string) {
  return value.trim() === ADMIN_ENTRY_CODE;
}

export function unlockVaultSession() {
  window.sessionStorage.setItem(VAULT_SESSION_KEY, "true");
}

export function hasVaultSessionAccess() {
  return window.sessionStorage.getItem(VAULT_SESSION_KEY) === "true";
}
