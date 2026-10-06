import nodemailer from 'nodemailer';

type SendEmailInput = { to: string; subject: string; text: string; brandName?: string };
type SendEmailResult = { sent: boolean; reason?: string };

function isValidEmail(value?: string): boolean { return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())); }
function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character] || character)); }

function statusEmailHtml(input: SendEmailInput) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || '';
  const logoUrl = process.env.EMAIL_LOGO_URL?.trim() || (siteUrl ? `${siteUrl}/storefront/rm-mobile-hub-logo-generated.png` : '');
  const brandName = input.brandName?.trim() || process.env.EMAIL_BRAND_NAME?.trim() || 'RM Mobile Hub';
  const body = escapeHtml(input.text).replace(/\n/g, '<br />');
  const logo = logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(brandName)}" width="54" height="54" style="display:block;border:0;border-radius:12px;object-fit:cover" />` : '';
  const header = `<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td width="54" valign="middle">${logo}</td><td width="14"></td><td valign="middle"><div style="font-size:22px;line-height:1.15;font-weight:800;color:#ffffff">${escapeHtml(brandName)}</div><div style="margin-top:5px;font-size:13px;line-height:1.3;color:#d9f6ff">Order &amp; repair status update</div></td></tr></table>`;
  return `<!doctype html><html><body style="margin:0;padding:28px 12px;background:#edf7fb;font-family:Arial,Helvetica,sans-serif;color:#173b52"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #d7eaf2;border-radius:22px;overflow:hidden"><tr><td style="padding:22px 30px;background:linear-gradient(135deg,#063b63,#0b9ec6)">${header}</td></tr><tr><td style="padding:30px;font-size:15px;line-height:1.7;color:#36596e">${body}</td></tr><tr><td style="padding:18px 30px;border-top:1px solid #e4f0f5;font-size:12px;line-height:1.5;color:#7390a1">This is an automatic update from ${escapeHtml(brandName)}. Please contact us if you need help.</td></tr></table></td></tr></table></body></html>`;
}

/** Sends a branded customer email through the SMTP account configured in environment variables. */
export async function sendCustomerEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const to = input.to.trim();
  if (!isValidEmail(to)) return { sent: false, reason: 'missing_or_invalid_email' };
  const host = process.env.SMTP_HOST?.trim(); const user = process.env.SMTP_USER?.trim(); const pass = process.env.SMTP_PASSWORD?.replace(/\s+/g, ''); const port = Number(process.env.SMTP_PORT || 587); const from = process.env.EMAIL_FROM?.trim();
  if (!host || !user || !pass || !from || !Number.isFinite(port)) return { sent: false, reason: 'email_not_configured' };
  try {
    const transport = nodemailer.createTransport({ host, port, secure: process.env.SMTP_SECURE === 'true' || port === 465, auth: { user, pass } });
    await transport.sendMail({ from, to, subject: input.subject, text: input.text, html: statusEmailHtml(input) });
    return { sent: true };
  } catch (error) { return { sent: false, reason: error instanceof Error ? error.message : 'email_send_failed' }; }
}
