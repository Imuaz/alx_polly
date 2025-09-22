"use server"

// Minimal email utility with provider-agnostic interface.
// In production, plug in Resend/SendGrid via API key envs.

type EmailPayload = {
  to: string
  subject: string
  html: string
}

function isEmailEnabled() {
  return Boolean(process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY)
}

export async function sendEmail(payload: EmailPayload) {
  if (!isEmailEnabled()) return { skipped: true }
  // TODO: Integrate provider SDK here. For now, noop.
  return { success: true }
}

export async function sendPollCreatedEmail(to: string, pollTitle: string) {
  return sendEmail({
    to,
    subject: `Your poll "${pollTitle}" is live!`,
    html: `<p>Your poll <strong>${pollTitle}</strong> has been created successfully.</p>`,
  })
}

export async function sendVoteAlertEmail(to: string, pollTitle: string) {
  return sendEmail({
    to,
    subject: `New vote on "${pollTitle}"`,
    html: `<p>Your poll <strong>${pollTitle}</strong> just received a new vote.</p>`,
  })
}


