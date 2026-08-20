import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { apiSuccess, apiError } from "@/lib/api-response"
import { sendSupportEmail } from "@/lib/email"
import { supportMessageSchema } from "@/lib/validations"
import { getEffectiveTier } from "@/lib/subscription"

/**
 * POST /api/support — a user reporting a problem.
 *
 * The message is stored first and emailed second, deliberately. Email can fail;
 * the record is the thing that must not be lost. `emailedAt` stays null when
 * delivery failed, so unsent messages are findable rather than silently gone.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = supportMessageSchema.safeParse(body)

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Invalid message", 400)
    }

    const session = await auth()
    const userId = session?.user?.id ? parseInt(session.user.id) : null

    let userTier: string | null = null
    if (userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { subscriptionTier: true, subscriptionStatus: true },
      })
      if (user) {
        userTier = getEffectiveTier(user.subscriptionTier ?? "free", user.subscriptionStatus)
      }
    }

    const record = await db.supportMessage.create({
      data: {
        userId,
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        message: parsed.data.message,
        userTier,
      },
    })

    const sent = await sendSupportEmail({
      ...parsed.data,
      userId,
      userTier,
      messageId: record.id,
    })

    if (sent.success) {
      await db.supportMessage.update({
        where: { id: record.id },
        data: { emailedAt: new Date() },
      })
    } else {
      // Stored but not delivered — loud in the logs, invisible to the user,
      // whose message is safe either way.
      console.error(`Support message ${record.id} stored but not emailed:`, sent.error)
    }

    return apiSuccess({
      id: record.id,
      message: "Thanks — your message has been received. We'll reply by email.",
    })
  } catch (error) {
    console.error("Error handling support message:", error)
    return apiError("Could not send your message. Please email support@civicshield.co.uk directly.", 500)
  }
}
