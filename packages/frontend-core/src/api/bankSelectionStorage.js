const KEY = "nm_selected_bank";
const TTL_MS = 30 * 60 * 1000; // 30 mins (optional expiry)

export function maskAccount(num = "") {
  if (!num) return "";
  const last4 = String(num).slice(-4);
  return `•••• •••• •••• ${last4}`;
}

export function saveSelectedBank(bank) {
  // Store only what you need to display later (avoid full account number)
  const snapshot = {
    id: bank.id ?? bank.player_bank_id,
    bank_name: bank.bank_name,
    account_name: bank.account_holder_name || bank.account_name,
    account_last4: String(bank.account_number || "").slice(-4),
    account_masked: maskAccount(bank.account_number),
    branch_code: bank.branch_code || bank.ifsc || bank.sort_code,
    payment_method_id: bank.payment_method_id ?? 1, // if you need it
  };

  const payload = { v: 1, savedAt: Date.now(), data: snapshot };
  localStorage.setItem(KEY, JSON.stringify(payload));
}

export function loadSelectedBank() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    // Optional TTL check
    if (parsed?.savedAt && Date.now() - parsed.savedAt > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return parsed.data || null;
  } catch {
    localStorage.removeItem(KEY);
    return null;
  }
}

export function clearSelectedBank() {
  localStorage.removeItem(KEY);
}
