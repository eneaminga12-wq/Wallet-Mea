/**
 * SMS / USSD service stub.
 *
 * Status: COMING SOON — no SMS or USSD gateway is connected. These
 * interfaces are prepared so a provider (e.g. Africa's Talking) can be
 * integrated later without touching the UI.
 */
export interface SmsCapability {
  code: string;
  label: string;
  live: boolean;
}

export const SMS_USSD_FEATURES: SmsCapability[] = [
  { code: '*150*MEABIT#', label: 'USSD menu — balance, send, receive', live: false },
  { code: 'SMS "BALI" → 15MEABIT', label: 'Check balance via SMS keyword', live: false },
  { code: 'SMS notifications', label: 'Get an SMS for every payment', live: false },
];

export const smsUssdService = {
  async registerInterest(phone: string): Promise<{ ok: boolean }> {
    await new Promise((r) => setTimeout(r, 700));
    return { ok: Boolean(phone.trim()) };
  },
};
