import { db } from "@/lib/db"
import { getAnalysisConfig } from "@/lib/ai-analysis"

export type SubscriptionTier = "free" | "basic" | "pro" | "agency"

export interface TierLimits {
  complaintsPerMonth: number | null // null = use lifetimeEmailSends for free
  complaintsTotal: number | null // lifetime cap for free tier
  followUpsPerComplaint: number
  maxFilesPerIssue: number
  maxFileSizeMB: number
  features: string[]
}

/**
 * Follow-up allowances were reduced on 21 Aug 2026 (Basic 10->3, Pro 20->5,
 * Agency 50->10). Each follow-up is a full AI generation costing 8-40p, and
 * the original numbers were set when a generation cost about 4p — a Basic user
 * using all 10 follow-ups on 5 complaints would have cost roughly £22 against
 * £4.99 of revenue. Three follow-ups still covers a normal complaint chain:
 * initial, chase, escalation.
 */
export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    complaintsPerMonth: null,
    complaintsTotal: 3,
    followUpsPerComplaint: 0,
    maxFilesPerIssue: 5,
    maxFileSizeMB: 200,
    features: ["auto-send", "case-builder", "basic-tracking"],
  },
  basic: {
    complaintsPerMonth: 5,
    complaintsTotal: null,
    followUpsPerComplaint: 3,
    maxFilesPerIssue: 5,
    maxFileSizeMB: 200,
    // "case-builder-locked" = visible but not usable, per the launch decision.
    // Without it Basic had strictly fewer features than Free, which is worse
    // than the tier below it.
    features: ["auto-send", "basic-tracking", "case-builder-locked"],
  },
  pro: {
    complaintsPerMonth: 15,
    complaintsTotal: null,
    followUpsPerComplaint: 5,
    maxFilesPerIssue: 15,
    maxFileSizeMB: 500,
    features: [
      "auto-send",
      "full-tracking",
      "case-builder",
      "pdf-export",
      "priority-support",
    ],
  },
  agency: {
    complaintsPerMonth: 30,
    complaintsTotal: null,
    followUpsPerComplaint: 10,
    maxFilesPerIssue: 50,
    maxFileSizeMB: 2048,
    features: [
      "auto-send",
      "full-tracking",
      "case-builder",
      "pdf-export",
      "bulk-send",
      "priority-support",
    ],
  },
}

export function getTierLimits(tier: string): TierLimits {
  return TIER_LIMITS[tier as SubscriptionTier] || TIER_LIMITS.free
}

export function hasFeature(tier: string, feature: string): boolean {
  const limits = getTierLimits(tier)
  return limits.features.includes(feature)
}

/**
 * Date the free tier switched from counting sends to counting generations.
 *
 * The free cap used to measure `lifetimeEmailSends`, which only increments on
 * send — so a user who never pressed Send could generate unlimited Claude
 * analyses, each one a paid API call. Counting generations closes that.
 *
 * Complaints generated before this date are NOT counted, so existing users
 * aren't retroactively locked out over a bug that was ours. Without the
 * cutoff, three accounts would have been blocked mid-use the moment this
 * shipped. Their prior sends still count via `lifetimeEmailSends`.
 */
const FREE_TIER_GENERATION_COUNTING_FROM = new Date("2026-08-19T00:00:00Z")

/**
 * Free-tier lifetime usage: sends of any age, plus generations from the
 * cutoff onward, whichever is higher.
 */
async function getFreeTierUsage(
  userId: number,
  lifetimeEmailSends: number
): Promise<number> {
  const generatedSinceCutoff = await db.complaint.count({
    where: {
      issue: { userId },
      isFollowUp: false,
      createdAt: { gte: FREE_TIER_GENERATION_COUNTING_FROM },
    },
  })
  return Math.max(generatedSinceCutoff, lifetimeEmailSends)
}

/**
 * Check if user can create a new complaint.
 * Free: lifetime cap of 3 complaints generated (see cutoff above).
 * Paid: monthly cap based on tier.
 */
export async function checkComplaintLimit(userId: number): Promise<{
  allowed: boolean
  used: number
  limit: number
  tier: SubscriptionTier
  message?: string
}> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true,
      lifetimeEmailSends: true,
    },
  })

  if (!user) {
    return { allowed: false, used: 0, limit: 0, tier: "free", message: "User not found" }
  }

  const tier = getEffectiveTier(user.subscriptionTier, user.subscriptionStatus)
  const limits = getTierLimits(tier)

  // Cancelled subscribers: read-only access, no new complaints
  if (user.subscriptionStatus === "cancelled") {
    return {
      allowed: false,
      used: 0,
      limit: 0,
      tier,
      message: "Your subscription has been cancelled. Resubscribe to create new complaints.",
    }
  }

  // Free tier: lifetime cap.
  if (tier === "free") {
    const used = await getFreeTierUsage(userId, user.lifetimeEmailSends)
    const limit = limits.complaintsTotal!
    return {
      allowed: used < limit,
      used,
      limit,
      tier,
      message: used >= limit
        ? "You've used all 3 free complaints. Upgrade to continue."
        : undefined,
    }
  }

  // Paid tiers: monthly cap (count new complaints this calendar month)
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const monthlyCount = await db.complaint.count({
    where: {
      issue: { userId },
      isFollowUp: false,
      createdAt: { gte: startOfMonth },
    },
  })

  const limit = limits.complaintsPerMonth!
  return {
    allowed: monthlyCount < limit,
    used: monthlyCount,
    limit,
    tier,
    message: monthlyCount >= limit
      ? `You've reached your ${limit} complaint limit for this month. Upgrade for more.`
      : undefined,
  }
}

/**
 * Check if a follow-up can be created for a specific complaint.
 */
export async function checkFollowUpLimit(
  complaintId: number,
  userId: number
): Promise<{
  allowed: boolean
  used: number
  limit: number
  message?: string
}> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true, subscriptionStatus: true },
  })

  if (!user) {
    return { allowed: false, used: 0, limit: 0, message: "User not found" }
  }

  const tier = getEffectiveTier(user.subscriptionTier, user.subscriptionStatus)
  const limits = getTierLimits(tier)

  if (user.subscriptionStatus === "cancelled") {
    return {
      allowed: false,
      used: 0,
      limit: 0,
      message: "Your subscription has been cancelled. Resubscribe to send follow-ups.",
    }
  }

  const complaint = await db.complaint.findUnique({
    where: { id: complaintId },
    select: { followUpCount: true },
  })

  if (!complaint) {
    return { allowed: false, used: 0, limit: 0, message: "Complaint not found" }
  }

  const used = complaint.followUpCount
  const limit = limits.followUpsPerComplaint

  return {
    allowed: used < limit,
    used,
    limit,
    message: used >= limit
      ? `You've reached the ${limit} follow-up limit for this complaint. Upgrade for more.`
      : undefined,
  }
}

/**
 * Determine if a new complaint on an issue is a follow-up (issue already has a sent complaint).
 */
export async function isFollowUp(issueId: number): Promise<boolean> {
  const sentCount = await db.complaint.count({
    where: {
      issueId,
      status: "sent",
    },
  })
  return sentCount > 0
}

/**
 * Increment the lifetime email send count for free tier users.
 */
export async function incrementEmailSendCount(userId: number): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: { lifetimeEmailSends: { increment: 1 } },
  })
}

/**
 * Increment the follow-up count on a complaint.
 */
export async function incrementFollowUpCount(complaintId: number): Promise<void> {
  await db.complaint.update({
    where: { id: complaintId },
    data: { followUpCount: { increment: 1 } },
  })
}

/**
 * Get usage stats for display in the UI.
 */
export async function getUsageStats(userId: number) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true,
      subscriptionExpiresAt: true,
      lifetimeEmailSends: true,
    },
  })

  if (!user) return null

  const tier = getEffectiveTier(user.subscriptionTier, user.subscriptionStatus)
  const limits = getTierLimits(tier)

  let complaintsUsed: number
  let complaintsLimit: number

  if (tier === "free") {
    // Same helper as checkComplaintLimit — if these diverge, the usage shown
    // in settings won't agree with the limit the user actually hits.
    complaintsUsed = await getFreeTierUsage(userId, user.lifetimeEmailSends)
    complaintsLimit = limits.complaintsTotal!
  } else {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    complaintsUsed = await db.complaint.count({
      where: {
        issue: { userId },
        isFollowUp: false,
        createdAt: { gte: startOfMonth },
      },
    })
    complaintsLimit = limits.complaintsPerMonth!
  }

  return {
    tier,
    status: user.subscriptionStatus,
    expiresAt: user.subscriptionExpiresAt,
    complaintsUsed,
    complaintsLimit,
    followUpsPerComplaint: limits.followUpsPerComplaint,
    maxFilesPerIssue: limits.maxFilesPerIssue,
    maxFileSizeMB: limits.maxFileSizeMB,
    features: limits.features,
    isLifetimeLimit: tier === "free",
    // Whether paying tiers are currently running the stronger model. Lets the
    // UI show the upgrade prompt only when it would actually be true.
    premiumAnalysisLive: getAnalysisConfig("pro").isPremium,
  }
}

/**
 * Get the effective tier considering subscription status.
 * Past-due subscriptions still get their tier (grace period).
 * Cancelled subscriptions revert to free (read-only).
 */
export function getEffectiveTier(tier: string, status: string): SubscriptionTier {
  if (status === "cancelled" || status === "free") return "free"
  if (["active", "past_due"].includes(status)) {
    return (tier as SubscriptionTier) || "free"
  }
  return "free"
}
