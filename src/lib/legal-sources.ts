/**
 * CivicShield Legal Source Registry
 *
 * Verified, authoritative source URLs for UK legislation, case law,
 * regulatory bodies, and constitutional documents. Used to enrich
 * AI-generated legal analysis with clickable source links.
 */

// ============================================================================
// 1A. UK LEGISLATION REGISTRY
// Pattern: legislation.gov.uk/ukpga/YEAR/CHAPTER (Acts of Parliament)
//          legislation.gov.uk/uksi/YEAR/NUMBER (Statutory Instruments)
// ============================================================================

const LEGISLATION_URLS: Record<string, string> = {
  // Primary Legislation (Acts of Parliament)
  "Human Rights Act 1998": "https://www.legislation.gov.uk/ukpga/1998/42",
  "Equality Act 2010": "https://www.legislation.gov.uk/ukpga/2010/15",
  "Protection from Harassment Act 1997": "https://www.legislation.gov.uk/ukpga/1997/40",
  "Freedom of Information Act 2000": "https://www.legislation.gov.uk/ukpga/2000/36",
  "Data Protection Act 2018": "https://www.legislation.gov.uk/ukpga/2018/12",
  "Police and Criminal Evidence Act 1984": "https://www.legislation.gov.uk/ukpga/1984/60",
  "Criminal Justice Act 2003": "https://www.legislation.gov.uk/ukpga/2003/44",
  "Courts Act 2003": "https://www.legislation.gov.uk/ukpga/2003/39",
  "Tribunals, Courts and Enforcement Act 2007": "https://www.legislation.gov.uk/ukpga/2007/15",
  "Consumer Rights Act 2015": "https://www.legislation.gov.uk/ukpga/2015/15",
  "Consumer Credit Act 1974": "https://www.legislation.gov.uk/ukpga/1974/39",
  "Sale of Goods Act 1979": "https://www.legislation.gov.uk/ukpga/1979/54",
  "Supply of Goods and Services Act 1982": "https://www.legislation.gov.uk/ukpga/1982/29",
  "Misuse of Drugs Act 1971": "https://www.legislation.gov.uk/ukpga/1971/38",
  "Theft Act 1968": "https://www.legislation.gov.uk/ukpga/1968/60",
  "Criminal Damage Act 1971": "https://www.legislation.gov.uk/ukpga/1971/48",
  "Public Order Act 1986": "https://www.legislation.gov.uk/ukpga/1986/64",
  "Malicious Communications Act 1988": "https://www.legislation.gov.uk/ukpga/1988/27",
  "Communications Act 2003": "https://www.legislation.gov.uk/ukpga/2003/21",
  "Road Traffic Act 1988": "https://www.legislation.gov.uk/ukpga/1988/52",
  "Landlord and Tenant Act 1985": "https://www.legislation.gov.uk/ukpga/1985/70",
  "Housing Act 1988": "https://www.legislation.gov.uk/ukpga/1988/50",
  "Housing Act 2004": "https://www.legislation.gov.uk/ukpga/2004/34",
  "Protection of Freedoms Act 2012": "https://www.legislation.gov.uk/ukpga/2012/9",
  "Regulation of Investigatory Powers Act 2000": "https://www.legislation.gov.uk/ukpga/2000/23",
  "Employment Rights Act 1996": "https://www.legislation.gov.uk/ukpga/1996/18",
  "Trade Union and Labour Relations (Consolidation) Act 1992": "https://www.legislation.gov.uk/ukpga/1992/52",
  "Health and Safety at Work etc. Act 1974": "https://www.legislation.gov.uk/ukpga/1974/37",
  "Occupiers' Liability Act 1957": "https://www.legislation.gov.uk/ukpga/Eliz2/5-6/31",
  "Occupiers' Liability Act 1984": "https://www.legislation.gov.uk/ukpga/1984/3",
  "Defamation Act 2013": "https://www.legislation.gov.uk/ukpga/2013/26",
  "Contempt of Court Act 1981": "https://www.legislation.gov.uk/ukpga/1981/49",
  "Legal Aid, Sentencing and Punishment of Offenders Act 2012": "https://www.legislation.gov.uk/ukpga/2012/10",
  "Solicitors Act 1974": "https://www.legislation.gov.uk/ukpga/1974/47",
  "Senior Courts Act 1981": "https://www.legislation.gov.uk/ukpga/1981/54",
  "Limitation Act 1980": "https://www.legislation.gov.uk/ukpga/1980/58",
  "Local Government Act 1972": "https://www.legislation.gov.uk/ukpga/1972/70",
  "Local Government Act 2000": "https://www.legislation.gov.uk/ukpga/2000/22",
  "Education Act 1996": "https://www.legislation.gov.uk/ukpga/1996/56",
  "Children Act 1989": "https://www.legislation.gov.uk/ukpga/1989/41",
  "Mental Health Act 1983": "https://www.legislation.gov.uk/ukpga/1983/20",
  "Coroners and Justice Act 2009": "https://www.legislation.gov.uk/ukpga/2009/25",
  "Investigatory Powers Act 2016": "https://www.legislation.gov.uk/ukpga/2016/25",
  "Proceeds of Crime Act 2002": "https://www.legislation.gov.uk/ukpga/2002/29",

  // Secondary Legislation (Statutory Instruments / Regulations)
  "The Taking Control of Goods Regulations 2013": "https://www.legislation.gov.uk/uksi/2013/1894",
  "Taking Control of Goods Regulations 2013": "https://www.legislation.gov.uk/uksi/2013/1894",
  "Civil Procedure Rules": "https://www.legislation.gov.uk/uksi/1998/3132",
  "Civil Procedure Rules 1998": "https://www.legislation.gov.uk/uksi/1998/3132",
  "Air Navigation Order 2016": "https://www.legislation.gov.uk/uksi/2016/765",
  "The Certification Officer (Amendment of Fees) Regulations 2022": "https://www.legislation.gov.uk/uksi/2022/1164",
  "Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013": "https://www.legislation.gov.uk/uksi/2013/3134",
  "The Consumer Protection from Unfair Trading Regulations 2008": "https://www.legislation.gov.uk/uksi/2008/1277",
}

function normalizeActTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function resolveActUrl(actTitle: string): string | null {
  // Exact match
  if (LEGISLATION_URLS[actTitle]) return LEGISLATION_URLS[actTitle]

  // Normalized fuzzy match
  const normalized = normalizeActTitle(actTitle)
  for (const [key, url] of Object.entries(LEGISLATION_URLS)) {
    if (normalizeActTitle(key) === normalized) return url
  }

  return null
}

// ============================================================================
// 1B. UK CASE LAW REGISTRY
// Sources: BAILII (bailii.org), National Archives (caselaw.nationalarchives.gov.uk)
// ============================================================================

const CASE_LAW_URLS: Record<string, string> = {
  "Laporte v Chief Constable of Gloucestershire": "https://www.bailii.org/uk/cases/UKHL/2006/55.html",
  "Austin v Commissioner of Police of the Metropolis": "https://www.bailii.org/uk/cases/UKHL/2009/5.html",
  "Entick v Carrington": "https://www.bailii.org/ew/cases/EWHC/KB/1765/J98.html",
  "Donoghue v Stevenson": "https://www.bailii.org/uk/cases/UKHL/1932/100.html",
  "Ridge v Baldwin": "https://www.bailii.org/uk/cases/UKHL/1963/2.html",
}

// Court abbreviation mappings for National Archives URL construction
const COURT_MAPPINGS: Record<string, string> = {
  "UKHL": "ukhl",
  "UKSC": "uksc",
  "EWHC": "ewhc",
  "EWCA Civ": "ewca/civ",
  "EWCA Crim": "ewca/crim",
  "EWCA": "ewca/civ",
  "UKPC": "ukpc",
  "UKUT": "ukut/iac",
  "UKFTT": "ukftt/tc",
}

function parseCitation(caseReference: string): { year: string; court: string; number: string } | null {
  // Match patterns like [2006] UKHL 55, [2021] EWHC 2682, [2009] EWCA Civ 123
  const match = caseReference.match(/\[(\d{4})\]\s+(UKHL|UKSC|EWHC|EWCA\s*(?:Civ|Crim)?|UKPC|UKUT|UKFTT)\s+(\d+)/)
  if (!match) return null
  return {
    year: match[1],
    court: match[2].replace(/\s+/g, " ").trim(),
    number: match[3],
  }
}

export function resolveCaseUrl(caseName: string, caseReference: string): string | null {
  // Try static registry by case name (fuzzy)
  const normalizedName = caseName.toLowerCase().trim()
  for (const [key, url] of Object.entries(CASE_LAW_URLS)) {
    if (key.toLowerCase().trim() === normalizedName) return url
    // Partial match for common variations
    if (normalizedName.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedName)) return url
  }

  // Try constructing URL from neutral citation
  const parsed = parseCitation(caseReference)
  if (parsed) {
    const courtPath = COURT_MAPPINGS[parsed.court]
    if (courtPath) {
      return `https://caselaw.nationalarchives.gov.uk/${courtPath}/${parsed.year}/${parsed.number}`
    }
  }

  return null
}

// ============================================================================
// 1C. REGULATORY / COMPLAINTS BODIES REGISTRY
// ============================================================================

interface RegulatoryBody {
  name: string
  url: string
  complaintsUrl: string
  keywords: string[]
}

const REGULATORY_BODIES: RegulatoryBody[] = [
  {
    name: "Independent Office for Police Conduct (IOPC)",
    url: "https://www.policeconduct.gov.uk/",
    complaintsUrl: "https://www.policeconduct.gov.uk/complaints",
    keywords: ["police", "iopc", "officer", "constable", "pcso", "custody"],
  },
  {
    name: "Solicitors Regulation Authority (SRA)",
    url: "https://www.sra.org.uk/",
    complaintsUrl: "https://www.sra.org.uk/consumers/problems/",
    keywords: ["solicitor", "sra", "lawyer", "legal representative", "law firm"],
  },
  {
    name: "Local Government and Social Care Ombudsman",
    url: "https://www.lgo.org.uk/",
    complaintsUrl: "https://www.lgo.org.uk/make-a-complaint",
    keywords: ["council", "local government", "local authority", "ombudsman", "planning", "housing benefit"],
  },
  {
    name: "Information Commissioner's Office (ICO)",
    url: "https://ico.org.uk/",
    complaintsUrl: "https://ico.org.uk/make-a-complaint/",
    keywords: ["data protection", "privacy", "gdpr", "freedom of information", "foi", "ico", "subject access"],
  },
  {
    name: "Driver and Vehicle Standards Agency (DVSA)",
    url: "https://www.gov.uk/government/organisations/driver-and-vehicle-standards-agency",
    complaintsUrl: "https://www.gov.uk/report-driving-medical-condition",
    keywords: ["dvsa", "vehicle", "driving", "mot", "roadworthiness", "steering", "recall"],
  },
  {
    name: "Parliamentary and Health Service Ombudsman (PHSO)",
    url: "https://www.ombudsman.org.uk/",
    complaintsUrl: "https://www.ombudsman.org.uk/making-complaint",
    keywords: ["nhs", "health", "hospital", "gp", "phso", "government department", "parliament"],
  },
  {
    name: "Financial Ombudsman Service",
    url: "https://www.financial-ombudsman.org.uk/",
    complaintsUrl: "https://www.financial-ombudsman.org.uk/consumers/how-to-complain",
    keywords: ["bank", "finance", "insurance", "mortgage", "loan", "credit card", "financial"],
  },
  {
    name: "Trading Standards (via Citizens Advice)",
    url: "https://www.citizensadvice.org.uk/consumer/get-more-help/report-to-trading-standards/",
    complaintsUrl: "https://www.citizensadvice.org.uk/consumer/get-more-help/report-to-trading-standards/",
    keywords: ["trading standards", "consumer", "scam", "fraud", "counterfeit", "unsafe product", "rogue trader"],
  },
  {
    name: "Bar Standards Board",
    url: "https://www.barstandardsboard.org.uk/",
    complaintsUrl: "https://www.barstandardsboard.org.uk/for-the-public/reporting-concerns.html",
    keywords: ["barrister", "bar standards", "counsel", "qc", "kc"],
  },
  {
    name: "Independent Schools Inspectorate / Ofsted",
    url: "https://www.gov.uk/government/organisations/ofsted",
    complaintsUrl: "https://www.gov.uk/complain-about-school",
    keywords: ["school", "education", "teacher", "ofsted", "headteacher", "exclusion", "sen"],
  },
  {
    name: "HM Prison and Probation Service",
    url: "https://www.gov.uk/government/organisations/hm-prison-and-probation-service",
    complaintsUrl: "https://www.gov.uk/government/organisations/prisons-and-probation-ombudsman",
    keywords: ["prison", "probation", "inmate", "prisoner", "parole"],
  },
]

export function resolveActionUrl(actionTitle: string): string | null {
  const lower = actionTitle.toLowerCase()
  for (const body of REGULATORY_BODIES) {
    for (const keyword of body.keywords) {
      if (lower.includes(keyword)) {
        return body.complaintsUrl
      }
    }
  }

  // Generic gov.uk fallback for unmatched actions
  if (lower.includes("report") || lower.includes("complain") || lower.includes("contact")) {
    return "https://www.gov.uk/complain-about-a-government-service"
  }

  return null
}

// ============================================================================
// 1D. CONSTITUTIONAL DOCUMENTS REGISTRY
// ============================================================================

const CONSTITUTIONAL_URLS: Record<string, string> = {
  "Magna Carta": "https://www.legislation.gov.uk/aep/Edw1cc1929/25/9",
  "Magna Carta 1215": "https://www.legislation.gov.uk/aep/Edw1cc1929/25/9",
  "Bill of Rights 1689": "https://www.legislation.gov.uk/aep/WilsandMar2/1/2",
  "Bill of Rights": "https://www.legislation.gov.uk/aep/WilsandMar2/1/2",
  "European Convention on Human Rights": "https://www.echr.coe.int/european-convention-on-human-rights",
  "ECHR": "https://www.echr.coe.int/european-convention-on-human-rights",
  "Universal Declaration of Human Rights": "https://www.un.org/en/about-us/universal-declaration-of-human-rights",
  "UDHR": "https://www.un.org/en/about-us/universal-declaration-of-human-rights",
  "Habeas Corpus Act 1679": "https://www.legislation.gov.uk/aep/Cha2/31/2",
  "Act of Settlement 1701": "https://www.legislation.gov.uk/aep/Will3/12-13/2",
  "Parliament Act 1911": "https://www.legislation.gov.uk/ukpga/Geo5/1-2/13",
  "Parliament Act 1949": "https://www.legislation.gov.uk/ukpga/Geo6/12-13-14/103",
}

// ============================================================================
// 1E. DOMAIN WHITELIST + URL VALIDATION
// ============================================================================

const TRUSTED_DOMAINS = [
  "legislation.gov.uk",
  "bailii.org",
  "caselaw.nationalarchives.gov.uk",
  "gov.uk",
  "policeconduct.gov.uk",
  "sra.org.uk",
  "lgo.org.uk",
  "ico.org.uk",
  "ombudsman.org.uk",
  "financial-ombudsman.org.uk",
  "citizensadvice.org.uk",
  "echr.coe.int",
  "un.org",
  "barstandardsboard.org.uk",
]

export function isVerifiedUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return TRUSTED_DOMAINS.some(
      (domain) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    )
  } catch {
    return false
  }
}

// ============================================================================
// 1F. MASTER RESOLUTION FUNCTION
// ============================================================================

export function resolveSourceUrl(item: {
  type: "legislation" | "case" | "action" | "constitutional"
  title: string
  reference?: string
  aiGeneratedUrl?: string
}): string | null {
  // 1. Try static registry first (always preferred over AI-generated)
  switch (item.type) {
    case "legislation": {
      const staticUrl = resolveActUrl(item.title)
      if (staticUrl) return staticUrl
      // Also check constitutional documents (some overlap)
      const constUrl = CONSTITUTIONAL_URLS[item.title]
      if (constUrl) return constUrl
      break
    }
    case "case": {
      const staticUrl = resolveCaseUrl(item.title, item.reference || "")
      if (staticUrl) return staticUrl
      break
    }
    case "action": {
      const staticUrl = resolveActionUrl(item.title)
      if (staticUrl) return staticUrl
      break
    }
    case "constitutional": {
      const constUrl = CONSTITUTIONAL_URLS[item.title]
      if (constUrl) return constUrl
      // Fall through to legislation check
      const legUrl = resolveActUrl(item.title)
      if (legUrl) return legUrl
      break
    }
  }

  // 2. Try AI-generated URL if it passes domain whitelist
  if (item.aiGeneratedUrl && isVerifiedUrl(item.aiGeneratedUrl)) {
    return item.aiGeneratedUrl
  }

  return null
}
