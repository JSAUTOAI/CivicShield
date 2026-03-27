import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";
import { dictionaryTerms } from "./seeds/dictionary-terms";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helper: read and parse the JSON dump from db_dump.md
// ---------------------------------------------------------------------------
function loadDumpData(): Record<string, any[]> {
  const dumpPath = path.resolve(__dirname, "../db_dump.md");
  const content = fs.readFileSync(dumpPath, "utf8");
  const jsonStart = content.indexOf("{");
  if (jsonStart === -1) {
    throw new Error("Could not find JSON data in db_dump.md");
  }
  return JSON.parse(content.slice(jsonStart));
}

// ---------------------------------------------------------------------------
// Helper: convert date strings to Date objects (returns null for falsy values)
// ---------------------------------------------------------------------------
function toDate(val: string | null | undefined): Date | null {
  if (!val) return null;
  return new Date(val);
}

// ---------------------------------------------------------------------------
// Helper: ensure a value is a proper array (handles null/undefined from dump)
// ---------------------------------------------------------------------------
function toArray(val: any): any[] {
  if (val === null || val === undefined) return [];
  if (Array.isArray(val)) return val;
  return [val];
}

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------
async function main() {
  console.log("Seeding database from db_dump.md ...\n");

  const data = loadDumpData();
  const summary: Record<string, number> = {};

  // =========================================================================
  // 1. USERS
  // Re-hash passwords with bcrypt (Replit used SHA-512, v2 uses bcrypt)
  // =========================================================================
  const DEFAULT_PASSWORD = "CivicShield2024!";
  const bcryptHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  if (data.users?.length) {
    for (const u of data.users) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: { password: bcryptHash },
        create: {
          id: u.id,
          username: u.username,
          password: bcryptHash,
          email: u.email,
          fullName: u.full_name ?? null,
          createdAt: toDate(u.created_at) ?? new Date(),
          phone: u.phone ?? null,
          address: u.address ?? null,
          theme: u.theme ?? "light",
          emailVerified: u.email_verified ?? false,
          verificationToken: u.verification_token ?? null,
          verificationTokenExpires: toDate(u.verification_token_expires),
          resetPasswordToken: u.reset_password_token ?? null,
          resetPasswordExpires: toDate(u.reset_password_expires),
          lastLogin: toDate(u.last_login),
          failedLoginAttempts: u.failed_login_attempts ?? 0,
          accountLocked: u.account_locked ?? false,
          accountLockedUntil: toDate(u.account_locked_until),
          subscriptionStatus: u.subscription_status ?? "free",
          subscriptionTier: u.subscription_tier ?? "basic",
          subscriptionExpiresAt: toDate(u.subscription_expires_at),
          stripeCustomerId: u.stripe_customer_id ?? null,
          stripeSubscriptionId: u.stripe_subscription_id ?? null,
          role: u.role ?? "user",
        },
      });
    }
    summary["users"] = data.users.length;
  }

  // =========================================================================
  // 2. PASSWORD HISTORY
  // =========================================================================
  if (data.password_history?.length) {
    for (const ph of data.password_history) {
      await prisma.passwordHistory.upsert({
        where: { id: ph.id },
        update: {},
        create: {
          id: ph.id,
          userId: ph.user_id,
          passwordHash: ph.password_hash,
          changedAt: toDate(ph.changed_at) ?? new Date(),
        },
      });
    }
    summary["password_history"] = data.password_history.length;
  }

  // =========================================================================
  // 3. PERMISSIONS
  // Dump fields: id, name, description, resource_type
  // Prisma fields: id, permissionName, description, category
  // =========================================================================
  if (data.permissions?.length) {
    for (const p of data.permissions) {
      await prisma.permission.upsert({
        where: { id: p.id },
        update: {},
        create: {
          id: p.id,
          permissionName: p.name,
          description: p.description ?? null,
          category: p.resource_type ?? null,
        },
      });
    }
    summary["permissions"] = data.permissions.length;
  }

  // =========================================================================
  // 4. ROLE PERMISSIONS
  // =========================================================================
  if (data.role_permissions?.length) {
    for (const rp of data.role_permissions) {
      await prisma.rolePermission.upsert({
        where: { id: rp.id },
        update: {},
        create: {
          id: rp.id,
          role: rp.role,
          permissionId: rp.permission_id,
        },
      });
    }
    summary["role_permissions"] = data.role_permissions.length;
  }

  // =========================================================================
  // 5. ISSUES
  // =========================================================================
  if (data.issues?.length) {
    for (const i of data.issues) {
      await prisma.issue.upsert({
        where: { id: i.id },
        update: {},
        create: {
          id: i.id,
          userId: i.user_id ?? null,
          issueType: i.issue_type,
          description: i.description,
          organization: i.organization,
          individual: i.individual ?? null,
          dateOfIncident: i.date_of_incident,
          timeOfIncident: i.time_of_incident ?? null,
          location: i.location,
          status: i.status ?? "in_progress",
          evidence: toArray(i.evidence),
          createdAt: toDate(i.created_at) ?? new Date(),
          isAnonymous: i.is_anonymous ?? false,
          hasComplaint: i.has_complaint ?? false,
          complaintSent: i.complaint_sent ?? false,
          organizationMetadata: i.organization_metadata ?? Prisma.JsonNull,
          issueCategory: i.issue_category ?? "Public Sector & Government",
          userRole: i.user_role ?? "complainant",
        },
      });
    }
    summary["issues"] = data.issues.length;
  }

  // =========================================================================
  // 6. COMPLAINTS
  // Dump fields: id, issue_id, content, created_at, submission_info, status
  // Prisma fields: id, issueId, complaintText, complaintFormat, recipientName,
  //   recipientEmail, recipientAddress, recipientOrg, ccRecipients, status,
  //   sentAt, sentVia, openedAt, respondedAt, responseText, createdAt, updatedAt
  // =========================================================================
  if (data.complaints?.length) {
    for (const c of data.complaints) {
      const sentAt =
        c.submission_info?.submittedAt
          ? toDate(c.submission_info.submittedAt)
          : null;
      const sentVia = c.submission_info?.method ?? null;

      await prisma.complaint.upsert({
        where: { id: c.id },
        update: {},
        create: {
          id: c.id,
          issueId: c.issue_id,
          complaintText: c.content,
          complaintFormat: "formal_letter",
          recipientName: null,
          recipientEmail: null,
          recipientAddress: null,
          recipientOrg: null,
          ccRecipients: [],
          status: c.status ?? "draft",
          sentAt: sentAt,
          sentVia: sentVia,
          openedAt: null,
          respondedAt: null,
          responseText: null,
          createdAt: toDate(c.created_at) ?? new Date(),
          updatedAt: toDate(c.created_at) ?? new Date(),
        },
      });
    }
    summary["complaints"] = data.complaints.length;
  }

  // =========================================================================
  // 7. LEGAL ANALYSIS
  // =========================================================================
  if (data.legal_analysis?.length) {
    for (const la of data.legal_analysis) {
      await prisma.legalAnalysis.upsert({
        where: { id: la.id },
        update: {},
        create: {
          id: la.id,
          issueId: la.issue_id,
          relevantLaws: toArray(la.relevant_laws),
          rightViolations: toArray(la.right_violations),
          recommendedActions: toArray(la.recommended_actions),
          precedents: toArray(la.precedents),
          createdAt: toDate(la.created_at) ?? new Date(),
        },
      });
    }
    summary["legal_analysis"] = data.legal_analysis.length;
  }

  // =========================================================================
  // 8. SECURITY AUDIT LOGS
  // Dump fields: id, user_id, action, ip_address, user_agent, timestamp,
  //   details, resource_type, resource_id, success
  // Prisma fields: id, userId, action, details (Json), ipAddress, userAgent, createdAt
  // Extra dump fields (resource_type, resource_id, success) merged into details
  // =========================================================================
  if (data.security_audit_logs?.length) {
    for (const sal of data.security_audit_logs) {
      const baseDetails =
        sal.details && typeof sal.details === "object" ? sal.details : {};
      const details = {
        ...baseDetails,
        ...(sal.resource_type != null ? { resource_type: sal.resource_type } : {}),
        ...(sal.resource_id != null ? { resource_id: sal.resource_id } : {}),
        ...(sal.success != null ? { success: sal.success } : {}),
      };

      await prisma.securityAuditLog.upsert({
        where: { id: sal.id },
        update: {},
        create: {
          id: sal.id,
          userId: sal.user_id ?? null,
          action: sal.action,
          details: details,
          ipAddress: sal.ip_address ?? null,
          userAgent: sal.user_agent ?? null,
          createdAt: toDate(sal.timestamp) ?? new Date(),
        },
      });
    }
    summary["security_audit_logs"] = data.security_audit_logs.length;
  }

  // =========================================================================
  // 9. RESOURCES
  // Dump fields: id, title, category, description, icon, link, tags, featured, source_details
  // Prisma fields: id, title, description, content, category, subcategory,
  //   resourceType, tags, iconName, url, isFeatured, sortOrder, createdAt, updatedAt
  // =========================================================================
  if (data.resources?.length) {
    for (const r of data.resources) {
      await prisma.resource.upsert({
        where: { id: r.id },
        update: {},
        create: {
          id: r.id,
          title: r.title,
          description: r.description ?? null,
          content: r.source_details ?? null,
          category: r.category,
          subcategory: null,
          resourceType: "guide",
          tags: toArray(r.tags),
          iconName: r.icon ?? null,
          url: r.link ?? null,
          isFeatured: r.featured ?? false,
          sortOrder: r.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
    summary["resources"] = data.resources.length;
  }

  // =========================================================================
  // 10. SUBMISSION TARGETS
  // Dump fields: id, name, category, description, contact_method,
  //   contact_details (object), requires_attachments, response_timeframe, notes
  // Prisma fields: id, organizationName, organizationType, department,
  //   contactEmail, contactPhone, contactAddress, websiteUrl, complaintUrl,
  //   region, jurisdiction, responseTimeDays, escalationPath, isActive,
  //   createdAt, updatedAt
  // =========================================================================
  if (data.submission_targets?.length) {
    for (const st of data.submission_targets) {
      const cd =
        st.contact_details && typeof st.contact_details === "object"
          ? st.contact_details
          : {};

      // Parse "5-10 business days" → first number
      let responseTimeDays: number | null = null;
      if (st.response_timeframe) {
        const match = st.response_timeframe.match(/(\d+)/);
        if (match) responseTimeDays = parseInt(match[1], 10);
      }

      await prisma.submissionTarget.upsert({
        where: { id: st.id },
        update: {},
        create: {
          id: st.id,
          organizationName: st.name,
          organizationType: st.category,
          department: null,
          contactEmail: cd.email ?? null,
          contactPhone: cd.phone ?? null,
          contactAddress: cd.address ?? null,
          websiteUrl: cd.website ?? cd.url ?? null,
          complaintUrl: cd.url ?? null,
          region: null,
          jurisdiction: null,
          responseTimeDays: responseTimeDays,
          escalationPath: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
    summary["submission_targets"] = data.submission_targets.length;
  }

  // =========================================================================
  // 11. PETITIONS
  // Dump fields: id, user_id, title, description, category, organization,
  //   target_signatures, location, status, expires_at, created_at, updated_at,
  //   is_poll, poll_options (string[]), keywords, trending, published
  // Prisma fields: id, title, description, category, targetOrg, targetCount,
  //   currentCount, status, createdBy, isTrending, isPoll, pollOptions (Json[]),
  //   keywords, createdAt, expiresAt
  // =========================================================================
  if (data.petitions?.length) {
    for (const p of data.petitions) {
      // Convert string poll options to Json objects
      const pollOptions = toArray(p.poll_options).map(
        (opt: string | object, idx: number) =>
          typeof opt === "string" ? { id: idx + 1, text: opt, votes: 0 } : opt
      );

      await prisma.petition.upsert({
        where: { id: p.id },
        update: {},
        create: {
          id: p.id,
          title: p.title,
          description: p.description,
          category: p.category ?? null,
          targetOrg: p.organization ?? null,
          targetCount: p.target_signatures ?? 1000,
          currentCount: 0,
          status: p.status ?? "active",
          createdBy: p.user_id ?? null,
          isTrending: p.trending ?? false,
          isPoll: p.is_poll ?? false,
          pollOptions: pollOptions,
          keywords: toArray(p.keywords),
          createdAt: toDate(p.created_at) ?? new Date(),
          expiresAt: toDate(p.expires_at),
        },
      });
    }
    summary["petitions"] = data.petitions.length;
  }

  // =========================================================================
  // 12. SIGNATURES
  // Dump fields: id, petition_id, user_id, name, email, location, comment,
  //   is_anonymous, created_at, poll_option_selected (string)
  // Prisma fields: id, petitionId, userId, signerName, signerEmail, comment,
  //   isAnonymous, pollOptionId (Int), createdAt
  // =========================================================================
  if (data.signatures?.length) {
    for (const s of data.signatures) {
      await prisma.signature.upsert({
        where: { id: s.id },
        update: {},
        create: {
          id: s.id,
          petitionId: s.petition_id,
          userId: s.user_id ?? null,
          signerName: s.name ?? null,
          signerEmail: s.email ?? null,
          comment: s.comment ?? null,
          isAnonymous: s.is_anonymous ?? false,
          pollOptionId: null, // dump has string poll_option_selected; schema expects Int
          createdAt: toDate(s.created_at) ?? new Date(),
        },
      });
    }
    summary["signatures"] = data.signatures.length;
  }

  // =========================================================================
  // 13. SESSION
  // Dump fields: sid, sess (object), expire
  // Prisma fields: id (cuid auto), sid, data (String), expiresAt, userId
  // =========================================================================
  if (data.session?.length) {
    for (const s of data.session) {
      // Avoid duplicates on re-run
      const existing = await prisma.session.findUnique({ where: { sid: s.sid } });
      if (!existing) {
        const userId =
          s.sess?.passport?.user != null ? s.sess.passport.user : null;
        await prisma.session.create({
          data: {
            sid: s.sid,
            data: JSON.stringify(s.sess),
            expiresAt: toDate(s.expire) ?? new Date(),
            userId: userId,
          },
        });
      }
    }
    summary["session"] = data.session.length;
  }

  // =========================================================================
  // 14. DICTIONARY TERMS
  // =========================================================================
  if (dictionaryTerms?.length) {
    for (const t of dictionaryTerms) {
      await prisma.dictionaryTerm.upsert({
        where: { slug: t.slug },
        update: {
          definition: t.definition,
          legalDefinition: t.legalDefinition ?? null,
          category: t.category,
          source: t.source ?? null,
          relatedActNames: t.relatedActNames,
          relatedCaseNames: t.relatedCaseNames,
          seeAlso: t.seeAlso,
          tags: t.tags,
          usageExample: t.usageExample ?? null,
          isFeatured: t.isFeatured ?? false,
        },
        create: {
          term: t.term,
          slug: t.slug,
          definition: t.definition,
          legalDefinition: t.legalDefinition ?? null,
          category: t.category,
          jurisdiction: t.jurisdiction ?? "England and Wales",
          source: t.source ?? null,
          relatedActNames: t.relatedActNames,
          relatedCaseNames: t.relatedCaseNames,
          seeAlso: t.seeAlso,
          tags: t.tags,
          usageExample: t.usageExample ?? null,
          isFeatured: t.isFeatured ?? false,
        },
      });
    }
    summary["dictionary_terms"] = dictionaryTerms.length;
  }

  // =========================================================================
  // RESET AUTO-INCREMENT SEQUENCES
  // After inserting with explicit IDs, sequences must be advanced past max ID
  // =========================================================================
  const sequenceTables = [
    "users",
    "password_history",
    "permissions",
    "role_permissions",
    "issues",
    "complaints",
    "legal_analysis",
    "security_audit_logs",
    "resources",
    "submission_targets",
    "petitions",
    "signatures",
    "evidence_items",
    "issue_change_history",
    "legal_cases",
    "legal_precedents",
    "relevant_legislation",
    "rights_violations",
    "court_documents",
    "case_timeline",
    "case_preparation_tasks",
    "public_user_profiles",
    "ai_chat_messages",
    "encrypted_data",
    "dictionary_terms",
  ];

  for (const table of sequenceTables) {
    try {
      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1))`
      );
    } catch {
      // Table may be empty or have no serial sequence — skip silently
    }
  }

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log("\n=== Seed Summary ===");
  let total = 0;
  for (const [table, count] of Object.entries(summary)) {
    console.log(`  ${table}: ${count} rows`);
    total += count;
  }
  console.log(`  --------------------------`);
  console.log(`  Total: ${total} rows seeded`);
  console.log("=== Seeding complete ===\n");

  console.log("Demo login credentials:");
  console.log("  Email: jake@example.com");
  console.log("  Password: CivicShield2024!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
