export async function sendTelegramLeadNotification(lead, { timeoutMs = 2500 } = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId || token === 'your_bot_token_here') {
    return { sent: false, reason: 'not_configured' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const text = [
    'New kitchen lead',
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    `City: ${lead.city || '-'}`,
    `Length: ${lead.kitchenLength || '-'}`,
    `Kitchen type: ${lead.kitchenType || '-'}`,
    `Install time: ${lead.installTime || '-'}`,
    `Budget: ${lead.budget || '-'}`,
    `Project file: ${lead.projectFile || '-'}`
  ].join('\n');

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: controller.signal
    });
    return { sent: res.ok, status: res.status };
  } catch (error) {
    console.error('[telegram] notification failed:', error?.name || error?.message || error);
    return { sent: false, reason: 'request_failed' };
  } finally {
    clearTimeout(timeout);
  }
}
