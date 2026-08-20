import { Resend } from "resend"

let resendClient: Resend | null = null

function getResend(): Resend {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set")
    }
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

const EMAIL_FROM = process.env.EMAIL_FROM || "CivicShield <complaints@civicshield.co.uk>"
const EMAIL_NOREPLY = process.env.EMAIL_NOREPLY || "CivicShield <noreply@civicshield.co.uk>"
const INBOUND_DOMAIN = process.env.EMAIL_INBOUND_DOMAIN || "civicshield.co.uk"

/**
 * Generate a unique reply-to address for a complaint.
 * Replies to this address will be routed to the inbound webhook.
 */
export function getReplyToAddress(complaintId: number): string {
  return `reply+${complaintId}@${INBOUND_DOMAIN}`
}

/**
 * Extract complaint ID from an inbound reply-to address.
 * Returns null if the address doesn't match the expected pattern.
 */
export function parseReplyToAddress(address: string): number | null {
  const match = address.match(/^reply\+(\d+)@/)
  return match ? parseInt(match[1]) : null
}

/**
 * Send a complaint email to the recipient with CC to oversight bodies.
 */
export async function sendComplaintEmail({
  complaintId,
  to,
  cc,
  subject,
  body,
  senderName,
  senderEmail,
}: {
  complaintId: number
  to: string
  cc?: string[]
  subject: string
  body: string
  senderName: string
  senderEmail: string
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resend = getResend()
  const replyTo = getReplyToAddress(complaintId)

  // Build CC list: user's CC + complaints@civicshield.co.uk for internal tracking
  const ccList = [...(cc || []), `complaints@${INBOUND_DOMAIN}`].filter(Boolean)

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: [to],
      cc: ccList.length > 0 ? ccList : undefined,
      replyTo: [replyTo, senderEmail],
      subject,
      text: body,
      headers: {
        "X-CivicShield-Complaint-Id": String(complaintId),
        "X-CivicShield-Sender-Name": senderName,
      },
      tags: [{ name: "complaint_id", value: String(complaintId) }],
    })

    if (result.error) {
      return { success: false, error: result.error.message }
    }

    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error("Failed to send complaint email:", error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Send an email verification link after registration.
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  name?: string
): Promise<{ success: boolean; error?: string }> {
  const resend = getResend()
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`

  try {
    const result = await resend.emails.send({
      from: EMAIL_NOREPLY,
      to: [email],
      subject: "Verify your CivicShield account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f6ef7;">Verify your email address</h2>
          <p>Hi${name ? ` ${name}` : ""},</p>
          <p>Thank you for registering with CivicShield. Please verify your email address by clicking the button below:</p>
          <a href="${verifyUrl}" style="display: inline-block; background: #4f6ef7; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">
            Verify Email
          </a>
          <p style="color: #666; font-size: 14px;">Or copy this link: ${verifyUrl}</p>
          <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">CivicShield is a legal information tool. It does not provide legal advice.</p>
        </div>
      `,
    })

    if (result.error) {
      return { success: false, error: result.error.message }
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Send a password reset email.
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const resend = getResend()
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

  try {
    const result = await resend.emails.send({
      from: EMAIL_NOREPLY,
      to: [email],
      subject: "Reset your CivicShield password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f6ef7;">Reset your password</h2>
          <p>You requested a password reset for your CivicShield account.</p>
          <a href="${resetUrl}" style="display: inline-block; background: #4f6ef7; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #666; font-size: 14px;">Or copy this link: ${resetUrl}</p>
          <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">CivicShield is a legal information tool. It does not provide legal advice.</p>
        </div>
      `,
    })

    if (result.error) {
      return { success: false, error: result.error.message }
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Welcome the user once they've verified.
 *
 * Sent from the verify route rather than at registration, so it doesn't land
 * alongside the verification email. This is also where we set expectations
 * about what CivicShield is — and, importantly, what it isn't.
 */
export async function sendWelcomeEmail(
  email: string,
  name?: string
): Promise<{ success: boolean; error?: string }> {
  const resend = getResend()
  const appUrl = process.env.NEXTAUTH_URL || "https://www.civicshield.co.uk"

  try {
    const result = await resend.emails.send({
      from: EMAIL_NOREPLY,
      to: [email],
      replyTo: [`support@${INBOUND_DOMAIN}`],
      subject: "Welcome to CivicShield — your rights, unveiled",
      text: [
        `Hi${name ? ` ${name}` : ""},`,
        "",
        "Your CivicShield account is ready.",
        "",
        "CivicShield helps you turn a bad experience with an organisation into a formal, properly evidenced complaint — analysed against UK legislation and case law, addressed to the right department, and tracked from the moment it's sent.",
        "",
        "Getting started:",
        `1. Log an issue — ${appUrl}/issues/new`,
        "2. We analyse it against UK law and draft a formal complaint",
        "3. Review, edit, and send it — then track whether it's opened and answered",
        "",
        `Stuck, or something not working? Reply to this email or write to support@${INBOUND_DOMAIN}. A real person reads it, and knowing what's going wrong is the fastest way we can fix it.`,
        "",
        "CivicShield is a legal information tool. It does not provide legal advice, and it is not a substitute for a solicitor.",
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
          <h2 style="color: #4f6ef7;">Welcome to CivicShield</h2>
          <p>Hi${name ? ` ${name}` : ""},</p>
          <p>Your account is ready.</p>
          <p>CivicShield helps you turn a bad experience with an organisation into a formal, properly evidenced complaint — analysed against UK legislation and case law, addressed to the right department, and tracked from the moment it&rsquo;s sent.</p>
          <h3 style="font-size: 16px; margin-top: 24px;">Getting started</h3>
          <ol style="line-height: 1.7; padding-left: 20px;">
            <li>Log an issue &mdash; tell us what happened</li>
            <li>We analyse it against UK law and draft a formal complaint</li>
            <li>Review, edit and send it &mdash; then track whether it&rsquo;s opened and answered</li>
          </ol>
          <a href="${appUrl}/issues/new" style="display: inline-block; background: #4f6ef7; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">
            Log your first issue
          </a>
          <p style="background: #f3f4f6; border-radius: 6px; padding: 12px 16px; font-size: 14px;">
            <strong>Stuck, or something not working?</strong> Just reply to this email, or write to
            <a href="mailto:support@${INBOUND_DOMAIN}" style="color: #4f6ef7;">support@${INBOUND_DOMAIN}</a>.
            A real person reads it &mdash; and knowing what&rsquo;s going wrong is the fastest way we can fix it.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">CivicShield is a legal information tool. It does not provide legal advice, and it is not a substitute for a solicitor.</p>
        </div>
      `,
    })

    if (result.error) {
      return { success: false, error: result.error.message }
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Forward a support enquiry to the support inbox.
 * Reply-to is set to the user so Jake can answer straight from his mail client.
 */
export async function sendSupportEmail(params: {
  name: string
  email: string
  subject: string
  message: string
  userId?: number | null
  userTier?: string | null
  messageId: number
}): Promise<{ success: boolean; error?: string }> {
  const resend = getResend()
  const { name, email, subject, message, userId, userTier, messageId } = params

  try {
    const result = await resend.emails.send({
      from: EMAIL_NOREPLY,
      to: [`support@${INBOUND_DOMAIN}`],
      replyTo: [email],
      subject: `[Support #${messageId}] ${subject}`,
      text: [
        `From: ${name} <${email}>`,
        `User ID: ${userId ?? "not signed in"}`,
        `Tier: ${userTier ?? "unknown"}`,
        `Support message ID: ${messageId}`,
        "",
        "---",
        "",
        message,
      ].join("\n"),
    })

    if (result.error) {
      return { success: false, error: result.error.message }
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}
