/** Sends the admin a WhatsApp message through CallMeBot (free). Never throws; returns whether it was sent. */
export async function notifyAdmin(text: string) {
  const phone = process.env.WHATSAPP_NOTIFY_PHONE;
  const apikey = process.env.CALLMEBOT_API_KEY;
  if (!phone || !apikey) { console.warn("WhatsApp notification skipped: WHATSAPP_NOTIFY_PHONE / CALLMEBOT_API_KEY not set"); return false; }
  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) { console.warn("WhatsApp notification failed:", res.status, (await res.text()).slice(0, 200)); return false; }
    return true;
  } catch (error) {
    console.warn("WhatsApp notification failed:", error);
    return false;
  }
}
