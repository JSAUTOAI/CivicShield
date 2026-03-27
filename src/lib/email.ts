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
