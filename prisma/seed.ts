import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // ============================================================================
  // DEMO USER
  // ============================================================================
  const hashedPassword = await bcrypt.hash("CivicShield2024!", 12)
  const user = await prisma.user.upsert({
    where: { email: "jake@example.com" },
    update: {},
    create: {
      username: "jakes",
      email: "jake@example.com",
      password: hashedPassword,
      fullName: "Jake S",
      role: "user",
      emailVerified: true,
    },
  })
  console.log("  Created demo user:", user.email)

  // ============================================================================
  // PERMISSIONS
  // ============================================================================
  const permissions = [
    { name: "create_issue", description: "Create new issues", category: "issues" },
    { name: "edit_issue", description: "Edit own issues", category: "issues" },
    { name: "delete_issue", description: "Delete own issues", category: "issues" },
    { name: "view_all_issues", description: "View all users issues", category: "admin" },
    { name: "create_complaint", description: "Generate complaints", category: "complaints" },
    { name: "send_complaint", description: "Send complaints via email/API", category: "complaints" },
    { name: "view_analysis", description: "View AI legal analysis", category: "analysis" },
    { name: "create_case", description: "Build legal cases", category: "legal" },
    { name: "upload_evidence", description: "Upload evidence files", category: "evidence" },
    { name: "create_petition", description: "Create petitions", category: "community" },
    { name: "sign_petition", description: "Sign petitions", category: "community" },
    { name: "manage_users", description: "Manage user accounts", category: "admin" },
    { name: "manage_resources", description: "Manage resources library", category: "admin" },
    { name: "view_audit_logs", description: "View security audit logs", category: "admin" },
    { name: "manage_roles", description: "Manage roles and permissions", category: "admin" },
    { name: "moderate_content", description: "Moderate user content", category: "moderation" },
  ]

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { permissionName: perm.name },
      update: {},
      create: { permissionName: perm.name, description: perm.description, category: perm.category },
    })
  }
  console.log("  Created", permissions.length, "permissions")

  // Assign permissions to roles
  const allPerms = await prisma.permission.findMany()
  const userPerms = ["create_issue", "edit_issue", "delete_issue", "create_complaint", "send_complaint", "view_analysis", "upload_evidence", "sign_petition"]
  const modPerms = [...userPerms, "create_petition", "moderate_content", "view_all_issues"]

  for (const permName of userPerms) {
    const perm = allPerms.find((p) => p.permissionName === permName)
    if (perm) {
      await prisma.rolePermission.upsert({
        where: { role_permissionId: { role: "user", permissionId: perm.id } },
        update: {},
        create: { role: "user", permissionId: perm.id },
      })
    }
  }

  for (const permName of modPerms) {
    const perm = allPerms.find((p) => p.permissionName === permName)
    if (perm) {
      await prisma.rolePermission.upsert({
        where: { role_permissionId: { role: "moderator", permissionId: perm.id } },
        update: {},
        create: { role: "moderator", permissionId: perm.id },
      })
    }
  }

  // Admin gets all permissions
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: { role_permissionId: { role: "admin", permissionId: perm.id } },
      update: {},
      create: { role: "admin", permissionId: perm.id },
    })
  }
  console.log("  Assigned role permissions (user, moderator, admin)")

  // ============================================================================
  // RESOURCES — Rights & Guides
  // ============================================================================
  const resources = [
    // Featured — Natural Living Man rights
    { title: "Universal Declaration of Human Rights", description: "The foundational document recognizing the inherent dignity and rights of all human beings.", category: "natural_rights", resourceType: "reference", tags: ["fundamental rights", "human dignity", "natural rights"], iconName: "Globe", isFeatured: true, sortOrder: 1 },
    { title: "Common Law Rights in the UK", description: "Overview of fundamental common law rights that exist independent of statutory law.", category: "natural_rights", resourceType: "reference", tags: ["common law", "inherent rights", "legal traditions"], iconName: "Scale", isFeatured: true, sortOrder: 2 },
    { title: "Magna Carta (1215)", description: "The historic charter that established limits on royal authority and protected individual rights.", category: "natural_rights", resourceType: "reference", tags: ["historical rights", "constitutional foundations", "limits on authority"], iconName: "Scroll", isFeatured: true, sortOrder: 3 },
    { title: "The Living Man's Rights Declaration", description: "Template for asserting natural rights as a living man/woman in legal contexts.", category: "natural_rights", resourceType: "template", tags: ["declaration", "template", "assertion of rights"], iconName: "FileText", isFeatured: true, sortOrder: 4 },

    // Guides
    { title: "Bailiff Resistance Guide", description: "Learn about your rights when dealing with bailiffs and enforcement agents.", category: "educational", resourceType: "guide", tags: ["bailiffs", "enforcement", "rights of entry"], iconName: "Shield", sortOrder: 10 },
    { title: "Protest Rights", description: "Know your legal rights for peaceful protest and assembly.", category: "educational", resourceType: "guide", tags: ["protest", "assembly", "freedom of expression"], iconName: "Megaphone", sortOrder: 11 },
    { title: "School Policies Guide", description: "Understanding your rights within the education system.", category: "educational", resourceType: "guide", tags: ["education", "schools", "parental rights"], iconName: "GraduationCap", sortOrder: 12 },
    { title: "Council Accountability", description: "How to hold local government accountable for decisions.", category: "educational", resourceType: "guide", tags: ["council", "local government", "accountability"], iconName: "Landmark", sortOrder: 13 },
    { title: "Drone Rights Guide", description: "Protecting your natural rights when using drones in public.", category: "educational", resourceType: "guide", tags: ["drones", "aviation", "privacy"], iconName: "Plane", sortOrder: 14 },
    { title: "Photography Is Not A Crime", description: "Assert your right to film and photograph in public spaces.", category: "educational", resourceType: "guide", tags: ["photography", "filming", "public spaces"], iconName: "Camera", sortOrder: 15 },
    { title: "Free Speech Rights", description: "Assert your natural right to free speech and expression, especially regarding your country's heritage.", category: "educational", resourceType: "guide", tags: ["free speech", "expression", "heritage"], iconName: "MessageSquare", sortOrder: 16 },

    // Legislation
    { title: "Human Rights Act 1998", description: "Incorporates the rights contained in the European Convention on Human Rights into UK law.", category: "legislation", resourceType: "legislation", tags: ["human rights", "constitutional", "fundamental rights"], iconName: "Shield", sortOrder: 20 },
    { title: "Equality Act 2010", description: "Protects against discrimination, harassment, and victimization based on protected characteristics.", category: "legislation", resourceType: "legislation", tags: ["discrimination", "equality", "protected characteristics"], iconName: "Users", sortOrder: 21 },
    { title: "Freedom of Information Act 2000", description: "Provides public access to information held by public authorities.", category: "legislation", resourceType: "legislation", tags: ["transparency", "public authority", "information rights"], iconName: "BookOpen", sortOrder: 22 },
    { title: "Data Protection Act 2018", description: "Controls how personal information is used by organizations, businesses, and the government.", category: "legislation", resourceType: "legislation", tags: ["privacy", "data protection", "GDPR"], iconName: "Lock", sortOrder: 23 },
    { title: "Police and Criminal Evidence Act 1984", description: "Governs police powers and protects public rights during criminal investigations.", category: "legislation", resourceType: "legislation", tags: ["police powers", "criminal evidence", "rights of arrest"], iconName: "AlertTriangle", sortOrder: 24 },
    { title: "Criminal Justice Act 2003", description: "Covers a wide range of criminal justice issues including sentencing and criminal proceedings.", category: "legislation", resourceType: "legislation", tags: ["criminal justice", "sentencing", "court procedures"], iconName: "Gavel", sortOrder: 25 },
    { title: "Courts Act 2003", description: "Establishes the framework for the courts system in England and Wales.", category: "legislation", resourceType: "legislation", tags: ["courts", "legal system", "judiciary"], iconName: "Scale", sortOrder: 26 },
    { title: "Civil Procedure Rules", description: "Rules governing civil litigation and proceedings in England and Wales.", category: "legislation", resourceType: "court_rules", tags: ["civil procedure", "litigation", "court procedures"], iconName: "FileText", sortOrder: 27 },
    { title: "Air Navigation Order 2016", description: "Principal legislation governing aviation and aircraft operations, including drone regulations.", category: "legislation", resourceType: "regulation", tags: ["aviation", "aircraft", "drones", "flight regulations", "airspace"], iconName: "Plane", sortOrder: 28 },
    { title: "Drone and Model Aircraft Registration and Education Scheme (UK)", description: "Mandatory registration system for drone operators in the UK with safety guidance.", category: "legislation", resourceType: "regulation", tags: ["drone", "regulation", "aviation", "registration", "safety"], iconName: "Plane", sortOrder: 29 },
    { title: "Tribunals, Courts and Enforcement Act 2007", description: "Outlines the powers and responsibilities of enforcement agents (bailiffs).", category: "legislation", resourceType: "legislation", tags: ["bailiffs", "enforcement", "entry rights"], iconName: "Scale", sortOrder: 30 },
    { title: "Protection from Harassment Act 1997", description: "Provides protection against harassment and stalking.", category: "legislation", resourceType: "legislation", tags: ["harassment", "stalking", "protection"], iconName: "Shield", sortOrder: 31 },
    { title: "The Taking Control of Goods Regulations 2013", description: "Prescribes procedures bailiffs must follow when taking control of goods.", category: "legislation", resourceType: "regulation", tags: ["bailiffs", "goods", "enforcement procedures"], iconName: "FileText", sortOrder: 32 },
  ]

  for (const resource of resources) {
    const existing = await prisma.resource.findFirst({ where: { title: resource.title } })
    if (!existing) {
      await prisma.resource.create({
        data: {
          ...resource,
          isFeatured: resource.isFeatured || false,
        },
      })
    }
  }
  console.log("  Created", resources.length, "resources")

  // ============================================================================
  // SUBMISSION TARGETS — where to send complaints
  // ============================================================================
  const targets = [
    { organizationName: "Independent Office for Police Conduct (IOPC)", organizationType: "police_oversight", contactEmail: "enquiries@policeconduct.gov.uk", websiteUrl: "https://www.policeconduct.gov.uk", complaintUrl: "https://www.policeconduct.gov.uk/complaints", region: "England and Wales", responseTimeDays: 28 },
    { organizationName: "Local Government and Social Care Ombudsman", organizationType: "council_oversight", contactEmail: "enquiries@lgo.org.uk", websiteUrl: "https://www.lgo.org.uk", complaintUrl: "https://www.lgo.org.uk/make-a-complaint", region: "England", responseTimeDays: 28 },
    { organizationName: "Legal Ombudsman", organizationType: "legal_oversight", contactEmail: "enquiries@legalombudsman.org.uk", websiteUrl: "https://www.legalombudsman.org.uk", complaintUrl: "https://www.legalombudsman.org.uk/how-to-complain/", region: "England and Wales", responseTimeDays: 28 },
    { organizationName: "Financial Ombudsman Service", organizationType: "financial_oversight", contactEmail: "complaint.info@financial-ombudsman.org.uk", websiteUrl: "https://www.financial-ombudsman.org.uk", complaintUrl: "https://www.financial-ombudsman.org.uk/consumers/how-to-complain", region: "UK", responseTimeDays: 56 },
    { organizationName: "Information Commissioner's Office (ICO)", organizationType: "data_oversight", contactEmail: "icocasework@ico.org.uk", websiteUrl: "https://ico.org.uk", complaintUrl: "https://ico.org.uk/make-a-complaint/", region: "UK", responseTimeDays: 28 },
    { organizationName: "Civil Enforcement Association (CIVEA)", organizationType: "bailiff_oversight", websiteUrl: "https://www.civea.co.uk", complaintUrl: "https://www.civea.co.uk/consumer-information/making-a-complaint", region: "England and Wales", responseTimeDays: 28 },
    { organizationName: "Solicitors Regulation Authority (SRA)", organizationType: "legal_oversight", websiteUrl: "https://www.sra.org.uk", complaintUrl: "https://www.sra.org.uk/consumers/problems/report-solicitor/", region: "England and Wales", responseTimeDays: 28 },
    { organizationName: "Ofcom", organizationType: "telecom_oversight", websiteUrl: "https://www.ofcom.org.uk", complaintUrl: "https://www.ofcom.org.uk/complaints", region: "UK", responseTimeDays: 28 },
    { organizationName: "Ofgem", organizationType: "energy_oversight", websiteUrl: "https://www.ofgem.gov.uk", complaintUrl: "https://www.ofgem.gov.uk/information-for-household-consumers/resolving-complaints", region: "UK", responseTimeDays: 56 },
    { organizationName: "General Medical Council (GMC)", organizationType: "medical_oversight", websiteUrl: "https://www.gmc-uk.org", complaintUrl: "https://www.gmc-uk.org/concerns", region: "UK", responseTimeDays: 28 },
  ]

  for (const target of targets) {
    const existing = await prisma.submissionTarget.findFirst({
      where: { organizationName: target.organizationName },
    })
    if (!existing) {
      await prisma.submissionTarget.create({
        data: {
          ...target,
          escalationPath: [],
        },
      })
    }
  }
  console.log("  Created", targets.length, "submission targets")

  // ============================================================================
  // DEMO ISSUES (matching original app data from screenshots)
  // ============================================================================
  const demoIssues = [
    {
      issueType: "Local Council",
      issueCategory: "Public Sector & Government",
      description: "Issues with local council decision making and lack of transparency.",
      organization: "swansea council",
      dateOfIncident: "13/04/2025",
      location: "Swansea",
      userRole: "complainant",
      status: "in_progress",
    },
    {
      issueType: "Bailiff / Enforcement",
      issueCategory: "Public Sector & Government",
      description: "a bailiff has trespassed on my property after having implied rights of access removed this bailiff has enter into my home with force and has proceeded to harrass me and cause alram distress and tried to bully me into paying him money i have no writen contract with anyone todo with this debt and i refuse to pay it under duress",
      organization: "exodus",
      dateOfIncident: "14/04/2025",
      location: "Swansea",
      userRole: "complainant",
      status: "in_progress",
    },
    {
      issueType: "Police Conduct",
      issueCategory: "Public Sector & Government",
      description: "Inappropriate conduct by police officers during a routine interaction.",
      organization: "South wales police",
      dateOfIncident: "13/04/2025",
      location: "Swansea",
      userRole: "complainant",
      status: "in_progress",
    },
    {
      issueType: "School Board",
      issueCategory: "Public Sector & Government",
      description: "Concerns about school policies affecting children's rights.",
      organization: "south wales school boards",
      dateOfIncident: "14/04/2025",
      location: "Swansea",
      userRole: "complainant",
      status: "in_progress",
    },
    {
      issueType: "Solicitor",
      issueCategory: "Public Sector & Government",
      description: "Issues with legal representation and professional conduct.",
      organization: "acuity law",
      dateOfIncident: "28/09/2025",
      location: "Wolverhampton",
      userRole: "complainant",
      status: "in_progress",
    },
  ]

  for (const issue of demoIssues) {
    const existing = await prisma.issue.findFirst({
      where: { organization: issue.organization, userId: user.id },
    })
    if (!existing) {
      await prisma.issue.create({
        data: {
          ...issue,
          userId: user.id,
          evidence: [],
          hasComplaint: true,
        },
      })
    }
  }
  console.log("  Created", demoIssues.length, "demo issues")

  console.log("\nSeed complete!")
  console.log("\nDemo login credentials:")
  console.log("  Email: jake@example.com")
  console.log("  Password: CivicShield2024!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
