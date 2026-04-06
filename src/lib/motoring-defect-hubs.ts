/**
 * CivicShield Motoring Hub — Known Manufacturer Defect Hubs
 *
 * Structured data for known, widespread manufacturer defects
 * that CivicShield users are actively reporting. Each hub provides
 * context for AI complaint generation and user guidance.
 */

export interface DefectHub {
  slug: string
  manufacturer: string
  title: string
  subtitle: string
  severity: "critical" | "high" | "medium"
  affectedModels: { model: string; years: string; variants?: string }[]
  issueDescription: string
  failureMechanism: string
  safetyImpact: string
  knownCost: string
  dvsaPosition: string
  manufacturerPosition: string
  evidenceExamples: string[]
  complaintStrategy: {
    step: number
    target: string
    action: string
    keyPoints: string[]
  }[]
  escalationPath: string[]
  relatedLegislation: string[]
  relatedIssueCategory: string
  communityReportCount?: string
}

// ============================================================================
// KNOWN DEFECT HUBS
// ============================================================================

export const MOTORING_DEFECT_HUBS: DefectHub[] = [
  {
    slug: "jlr-power-steering",
    manufacturer: "Jaguar Land Rover (JLR)",
    title: "JLR Power Steering Failure — Water Ingress",
    subtitle: "Catastrophic loss of power steering after driving through standing water",
    severity: "critical",
    affectedModels: [
      { model: "Land Rover Discovery Sport", years: "2015–2024", variants: "All variants including facelift models" },
      { model: "Range Rover Evoque", years: "2015–2024", variants: "First and second generation" },
      { model: "Jaguar E-PACE", years: "2018–2024" },
      { model: "Jaguar F-PACE", years: "2016–2024", variants: "Some variants reported" },
      { model: "Range Rover Velar", years: "2017–2024", variants: "Some variants reported" },
    ],
    issueDescription:
      "Vehicles manufactured by Jaguar Land Rover are experiencing complete or partial loss of power steering after the vehicle drives through even small amounts of standing water (puddles, surface water, light flooding). The steering becomes extremely heavy or locks entirely, creating an immediate and serious safety hazard — particularly at speed, on motorways, or when cornering. This is not a gradual degradation; it is a sudden, catastrophic failure that occurs without warning.",
    failureMechanism:
      "Water enters the engine bay through inadequate sealing around the front of the vehicle and reaches the electric power steering (EPS) rack or its electronic control module. The water causes corrosion, short-circuiting, or sensor failure within the EPS system. Despite JLR marketing many of these vehicles as having 'all-terrain capability' and wade sensing features, the steering rack assembly lacks adequate waterproofing for conditions that any UK driver would encounter routinely — standing water on roads after rainfall. The fault is a design deficiency, not wear and tear.",
    safetyImpact:
      "CRITICAL — Sudden loss of power steering at any speed constitutes an immediate risk of loss of vehicle control, particularly on motorways, dual carriageways, and during cornering. This defect has the potential to cause serious injury or death to the vehicle occupants and other road users. The fact that it occurs after contact with standing water — an everyday UK driving condition — makes the risk especially acute.",
    knownCost:
      "JLR dealers are quoting £2,500 to £4,000+ for steering rack replacement and associated diagnostic work. Many owners report being told the repair is not covered by warranty because it is classified as 'water damage' or 'wear and tear' — even on vehicles with low mileage and full service history.",
    dvsaPosition:
      "Despite numerous reports from vehicle owners, DVSA has not issued a recall or mandatory safety investigation for this defect. Reports submitted through the DVSA safety defect reporting system have not resulted in visible action. DVSA appears to be treating reports individually rather than recognising the systemic nature of the defect across the JLR platform.",
    manufacturerPosition:
      "JLR customer services and dealership networks are consistently classifying this failure as 'wear and tear' or 'water damage not covered by warranty.' JLR has not acknowledged the defect as a design issue, has not issued a Technical Service Bulletin (TSB) to dealers, and has not offered a voluntary recall or extended warranty for the affected component. Some owners report being offered partial 'goodwill' contributions, but these are inconsistent and often conditional on signing non-disclosure agreements.",
    evidenceExamples: [
      "OBD-II diagnostic fault codes: C0051 (EPS motor circuit), U0131 (lost communication with PSCM), C1A00 (steering column module fault)",
      "Dashboard warning: 'Steering Assistance Fault' or 'Restricted Performance' after driving through water",
      "Independent engineer's report confirming water ingress to EPS rack — not caused by submersion or abuse",
      "Vehicle wading depth specification vs. actual water depth that caused the failure",
      "Photographs of corrosion on the steering rack connector/module",
      "JLR service records showing the vehicle was maintained to manufacturer specifications",
      "DVSA safety defect report reference number showing the report was filed",
      "Screenshots from owner forums showing widespread reports of the same failure",
      "Dealer diagnostic report showing the EPS rack failure diagnosis",
      "Quotes from multiple dealers confirming the same repair cost range",
    ],
    complaintStrategy: [
      {
        step: 1,
        target: "JLR Customer Relations",
        action: "Submit a formal complaint to JLR's UK customer relations team (not just the dealer) citing the Consumer Rights Act 2015 and General Product Safety Regulations 2005",
        keyPoints: [
          "The vehicle was not of satisfactory quality — a vehicle marketed for all-terrain use should withstand standing water (s.9 CRA 2015)",
          "The vehicle was not fit for purpose — driving on wet UK roads is a reasonably foreseeable use (s.10 CRA 2015)",
          "This is a design deficiency, not wear and tear — the EPS rack lacks adequate waterproofing",
          "Request: full repair at JLR's cost, or rejection of the vehicle if within rights period",
          "Set a 14-day deadline for a substantive response",
        ],
      },
      {
        step: 2,
        target: "DVSA Safety Defect Report",
        action: "File a formal safety defect report with DVSA, emphasising the systemic nature and safety-critical impact",
        keyPoints: [
          "Report via gov.uk/report-vehicle-safety-defect",
          "Emphasise this is a SAFETY defect — sudden loss of steering at speed risks lives",
          "Note this affects multiple JLR models across multiple years — this is systemic",
          "Include your diagnostic codes, independent report, and any dealer quotes",
          "Request confirmation of report receipt and ask what action DVSA intends to take",
          "If DVSA fails to act, this becomes grounds for escalation to VCA and DfT",
        ],
      },
      {
        step: 3,
        target: "Vehicle Certification Agency (VCA)",
        action: "Escalate to VCA if DVSA does not take meaningful action within 28 days",
        keyPoints: [
          "VCA is responsible for vehicle type approval — if the vehicle doesn't meet safety standards, VCA can act",
          "Reference Road Vehicles (Approval) Regulations 2020",
          "Argue the vehicle may not meet its type approval if the steering system fails under foreseeable conditions",
          "Include DVSA report reference and lack of action",
        ],
      },
      {
        step: 4,
        target: "Trading Standards (via Citizens Advice)",
        action: "Report JLR to Trading Standards for potential breach of the General Product Safety Regulations",
        keyPoints: [
          "Manufacturers have a duty to monitor safety of products on the market",
          "JLR's failure to recall or address a known safety defect may constitute a breach",
          "Trading Standards can investigate and prosecute",
          "Call Citizens Advice consumer helpline: 0808 223 1133",
        ],
      },
      {
        step: 5,
        target: "Motor Ombudsman / Legal Action",
        action: "If JLR refuses all resolution, escalate to the Motor Ombudsman (JLR is a member) or issue pre-action proceedings",
        keyPoints: [
          "JLR is a registered member of The Motor Ombudsman",
          "TMO can make binding decisions on JLR",
          "Alternatively, send a Letter Before Action giving 14 days before filing in small claims court",
          "Claims up to £10,000 can be filed online at money claims online",
          "Consider whether the claim exceeds small claims track — if over £10,000, consider solicitor advice",
        ],
      },
    ],
    escalationPath: [
      "JLR Dealer → JLR Customer Relations → JLR UK Managing Director",
      "DVSA Safety Defect Report → DVSA Chief Executive → VCA → Department for Transport",
      "Citizens Advice → Trading Standards → CMA (if market-wide)",
      "Motor Ombudsman → Small Claims Court → County Court",
    ],
    relatedLegislation: [
      "Consumer Rights Act 2015 (s.9, s.10, s.11, s.20, s.24)",
      "General Product Safety Regulations 2005",
      "Road Vehicles (Approval) Regulations 2020",
      "Consumer Protection from Unfair Trading Regulations 2008",
    ],
    relatedIssueCategory: "vehicle-safety-defects",
    communityReportCount: "Numerous daily complaints reported to JLR and DVSA",
  },
]

// ============================================================================
// HELPERS
// ============================================================================

export function getDefectHub(slug: string): DefectHub | undefined {
  return MOTORING_DEFECT_HUBS.find((d) => d.slug === slug)
}

export function getDefectHubsForManufacturer(manufacturer: string): DefectHub[] {
  return MOTORING_DEFECT_HUBS.filter((d) =>
    d.manufacturer.toLowerCase().includes(manufacturer.toLowerCase())
  )
}

/**
 * Check if an issue description matches a known defect pattern.
 * Returns the matching defect hub(s) for AI context injection.
 */
export function matchDefectPatterns(description: string): DefectHub[] {
  const lower = description.toLowerCase()
  const matches: DefectHub[] = []

  for (const hub of MOTORING_DEFECT_HUBS) {
    const keywords = getDefectKeywords(hub)
    const matchCount = keywords.filter((kw) => lower.includes(kw)).length
    // Require at least 2 keyword matches to avoid false positives
    if (matchCount >= 2) {
      matches.push(hub)
    }
  }

  return matches
}

function getDefectKeywords(hub: DefectHub): string[] {
  switch (hub.slug) {
    case "jlr-power-steering":
      return [
        "power steering",
        "steering failure",
        "steering fault",
        "steering assistance",
        "water",
        "puddle",
        "standing water",
        "jlr",
        "jaguar",
        "land rover",
        "discovery sport",
        "evoque",
        "e-pace",
        "steering rack",
        "eps",
        "c0051",
        "u0131",
      ]
    default:
      return []
  }
}
