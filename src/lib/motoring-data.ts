/**
 * CivicShield Motoring Hub — Static Data
 *
 * Issue categories, authorities, laws, and evidence templates
 * for the Motoring Authority & Accountability Hub.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ResponsibleBody {
  name: string
  abbreviation?: string
  role: string
  whenToContact: string
  whatTheyCannotDo?: string
}

export interface ComplaintStep {
  step: number
  title: string
  description: string
  whatToSubmit: string
  expectedOutcome: string
}

export interface MotoringIssueCategory {
  slug: string
  title: string
  description: string
  icon: string
  symptoms: string[]
  exampleScenarios: string[]
  responsibleBodies: {
    primary: ResponsibleBody
    secondary: ResponsibleBody
    escalation: ResponsibleBody
  }
  legalFramework: { title: string; summary: string; section?: string }[]
  evidenceChecklist: string[]
  complaintRoute: ComplaintStep[]
  expectedOutcomes: string[]
}

export interface MotoringAuthority {
  slug: string
  name: string
  abbreviation: string
  description: string
  jurisdiction: string
  whenToContact: string
  whatTheyCannotDo: string
  contactUrl: string
  complaintsUrl: string
  phoneNumber?: string
}

export interface MotoringLaw {
  slug: string
  title: string
  year: number
  description: string
  keyRights: string[]
  timeLimits: string
  applicationScenarios: string[]
  legislationUrl: string
}

export interface EvidenceTemplate {
  categorySlug: string
  items: { label: string; description: string; required: boolean }[]
}

// ============================================================================
// ISSUE CATEGORIES
// ============================================================================

export const MOTORING_ISSUE_CATEGORIES: MotoringIssueCategory[] = [
  {
    slug: "vehicle-safety-defects",
    title: "Vehicle Safety Defects & Recalls",
    description: "Your vehicle has a safety defect that makes it dangerous to drive, or a manufacturer has failed to address a known safety issue.",
    icon: "AlertTriangle",
    symptoms: [
      "Sudden loss of power steering",
      "Brake failure or reduced braking performance",
      "Airbag warning lights or deployment failures",
      "Engine cutting out at speed",
      "Electrical fires or burning smells",
      "Suspension collapse or component failure",
    ],
    exampleScenarios: [
      "Your vehicle lost power steering after driving through a puddle and the manufacturer says it's wear and tear",
      "A known defect exists but the manufacturer has not issued a recall",
      "DVSA has not acted on multiple safety reports for the same defect",
    ],
    responsibleBodies: {
      primary: {
        name: "Vehicle Manufacturer",
        role: "Responsible for product safety and issuing recalls when defects are identified",
        whenToContact: "First point of contact — report the defect and request inspection/repair under warranty or goodwill",
      },
      secondary: {
        name: "Driver & Vehicle Standards Agency",
        abbreviation: "DVSA",
        role: "Government body responsible for vehicle safety standards, MOT, and recall oversight",
        whenToContact: "When the manufacturer refuses to act, or the defect poses a serious safety risk to other road users",
        whatTheyCannotDo: "Cannot force a manufacturer to pay compensation or order a specific repair",
      },
      escalation: {
        name: "Vehicle Certification Agency",
        abbreviation: "VCA",
        role: "Responsible for vehicle type approval and can investigate systemic safety failures",
        whenToContact: "When DVSA has failed to act and the defect affects a wide range of vehicles",
        whatTheyCannotDo: "Cannot handle individual consumer disputes or award compensation",
      },
    },
    legalFramework: [
      { title: "Consumer Rights Act 2015", summary: "Goods must be of satisfactory quality, fit for purpose, and as described", section: "s.9, s.10, s.11" },
      { title: "General Product Safety Regulations 2005", summary: "Products placed on the market must be safe — manufacturers have a duty to monitor and act on defects" },
      { title: "Road Vehicles (Approval) Regulations 2020", summary: "Vehicles must meet approval standards — manufacturers must notify authorities of safety defects" },
    ],
    evidenceChecklist: [
      "Vehicle registration (V5C)",
      "VIN number",
      "Current mileage",
      "Service history",
      "Diagnostic fault codes (OBD-II)",
      "Independent inspection report",
      "Photos/videos of the defect",
      "Timeline of when the fault occurred",
      "Communications with manufacturer/dealer",
      "Repair invoices and quotes",
      "Weather/road conditions at time of failure",
    ],
    complaintRoute: [
      { step: 1, title: "Contact the Manufacturer", description: "Write a formal complaint to the manufacturer's customer relations team describing the defect and requesting inspection/repair", whatToSubmit: "Formal letter with vehicle details, fault description, evidence, and reference to Consumer Rights Act 2015", expectedOutcome: "Manufacturer acknowledges and offers inspection, repair, or goodwill contribution" },
      { step: 2, title: "Book Independent Inspection", description: "If the manufacturer refuses or denies the defect, obtain an independent vehicle inspection from an accredited engineer", whatToSubmit: "Request inspection focusing on the specific defect — keep the report for evidence", expectedOutcome: "Independent evidence confirming the defect exists and was not caused by wear and tear" },
      { step: 3, title: "Report to DVSA", description: "Submit a safety defect report to DVSA, especially if the defect poses a risk to other road users", whatToSubmit: "DVSA online safety defect report with vehicle details, fault description, and supporting evidence", expectedOutcome: "DVSA logs the report and may investigate if multiple reports exist for the same defect" },
      { step: 4, title: "Escalate to Trading Standards", description: "If the manufacturer continues to deny responsibility, contact Trading Standards via Citizens Advice", whatToSubmit: "Full complaint file including manufacturer correspondence, inspection report, and DVSA reference", expectedOutcome: "Trading Standards may investigate the manufacturer for breaching consumer protection law" },
      { step: 5, title: "Motor Ombudsman or Legal Action", description: "If all else fails, escalate to the Motor Ombudsman (if the manufacturer is a member) or consider small claims court", whatToSubmit: "Full case file with all correspondence, evidence, and costs incurred", expectedOutcome: "Binding resolution from the Ombudsman or court-ordered repair/refund/compensation" },
    ],
    expectedOutcomes: [
      "Manufacturer goodwill repair (full or partial cost covered)",
      "Free repair under extended warranty or recall",
      "DVSA investigation leading to technical bulletin or recall review",
      "Trading Standards enforcement action",
      "Ombudsman-ordered compensation or repair",
      "Rejection of vehicle under Consumer Rights Act (within 6 months of purchase)",
    ],
  },
  {
    slug: "dealer-sale-issues",
    title: "Dealer Sale Issues",
    description: "You purchased a vehicle from a dealer that was faulty, mis-described, or not fit for purpose.",
    icon: "Store",
    symptoms: [
      "Faults appearing within days or weeks of purchase",
      "Mileage discrepancy (clocked vehicle)",
      "Outstanding finance on the vehicle",
      "Hidden accident damage",
      "Vehicle not matching the description in the advert",
      "Missing service history or MOT failures",
    ],
    exampleScenarios: [
      "You bought a car from a dealer and the engine failed within 2 weeks",
      "The dealer sold you a vehicle described as 'one owner' but it had 5 previous owners",
      "You discover the vehicle has outstanding finance and could be repossessed",
    ],
    responsibleBodies: {
      primary: {
        name: "The Selling Dealer",
        role: "Legally responsible for the condition of the vehicle at point of sale under the Consumer Rights Act 2015",
        whenToContact: "Immediately when a fault is discovered — you have the right to reject within 30 days",
      },
      secondary: {
        name: "Trading Standards",
        role: "Enforces consumer protection law against rogue traders and dishonest dealers",
        whenToContact: "When the dealer refuses to acknowledge the fault or engages in deceptive practices",
        whatTheyCannotDo: "Cannot award compensation directly — they investigate and can prosecute",
      },
      escalation: {
        name: "Motor Ombudsman",
        role: "Independent dispute resolution for motor industry complaints",
        whenToContact: "After 8 weeks without resolution from the dealer, or if they issue a final response",
        whatTheyCannotDo: "Can only act if the dealer is a registered member",
      },
    },
    legalFramework: [
      { title: "Consumer Rights Act 2015", summary: "Right to reject faulty goods within 30 days, right to repair/replacement within 6 months, and burden of proof on retailer for 6 months", section: "s.9, s.10, s.11, s.20, s.22, s.24" },
      { title: "Consumer Protection from Unfair Trading Regulations 2008", summary: "Prohibits misleading actions, misleading omissions, and aggressive commercial practices" },
      { title: "Sale of Goods Act 1979", summary: "Still applies to private sales — goods must be as described" },
    ],
    evidenceChecklist: [
      "Purchase receipt/invoice",
      "Vehicle advertisement (screenshot or printout)",
      "V5C registration document",
      "MOT history (check via gov.uk)",
      "HPI check report",
      "Independent inspection report",
      "Photos/videos of faults",
      "Communications with the dealer",
      "Finance agreement (if applicable)",
    ],
    complaintRoute: [
      { step: 1, title: "Notify the Dealer in Writing", description: "Send a formal complaint letter to the dealer detailing the faults and your rights under the Consumer Rights Act", whatToSubmit: "Formal letter referencing CRA 2015, describing faults, with evidence attached", expectedOutcome: "Dealer acknowledges and offers repair, replacement, or refund" },
      { step: 2, title: "Exercise Right to Reject (if within 30 days)", description: "If the vehicle was purchased within the last 30 days, you have the right to a full refund", whatToSubmit: "Formal rejection letter citing s.20 CRA 2015", expectedOutcome: "Full refund within 14 days" },
      { step: 3, title: "Request Repair or Replacement (30 days to 6 months)", description: "After 30 days, the dealer gets one chance to repair — if it fails, you can request a refund", whatToSubmit: "Written request for repair with reasonable deadline", expectedOutcome: "Successful repair or final right to reject" },
      { step: 4, title: "Escalate to Trading Standards", description: "Report the dealer to Trading Standards via Citizens Advice if they are being dishonest or refusing to comply", whatToSubmit: "Full complaint file with all correspondence and evidence", expectedOutcome: "Investigation into the dealer's practices" },
      { step: 5, title: "Motor Ombudsman or Small Claims Court", description: "Use the Motor Ombudsman for ADR or file a claim in the small claims court for up to £10,000", whatToSubmit: "Complete case file with costs, evidence, and pre-action letter", expectedOutcome: "Binding resolution or court-ordered refund/compensation" },
    ],
    expectedOutcomes: [
      "Full refund under right to reject (within 30 days)",
      "Dealer-funded repair or replacement vehicle",
      "Partial refund reflecting diminished value",
      "Trading Standards prosecution of rogue dealer",
      "Small claims court judgment",
    ],
  },
  {
    slug: "warranty-goodwill-disputes",
    title: "Warranty & Goodwill Disputes",
    description: "The manufacturer or dealer is refusing to honour a warranty claim or denying goodwill on a known issue.",
    icon: "ShieldOff",
    symptoms: [
      "Warranty claim rejected without clear reason",
      "Manufacturer claiming the fault is not covered",
      "Goodwill request denied despite known issue",
      "Extended warranty disputes with third-party providers",
      "Service history used to void warranty unfairly",
    ],
    exampleScenarios: [
      "Your vehicle developed a known fault just outside warranty and the manufacturer refuses goodwill",
      "The dealer claims your warranty is void because you used an independent garage for routine servicing",
      "The manufacturer is aware of the defect but won't extend the warranty period",
    ],
    responsibleBodies: {
      primary: { name: "Vehicle Manufacturer", role: "Sets warranty terms and has discretion over goodwill contributions", whenToContact: "First — request escalation to a case manager if the dealer-level claim is rejected" },
      secondary: { name: "Motor Ombudsman", abbreviation: "TMO", role: "Handles disputes about warranty terms and manufacturer obligations", whenToContact: "After the manufacturer issues a final response or after 8 weeks without resolution" },
      escalation: { name: "Trading Standards / Small Claims Court", role: "Legal enforcement when manufacturer breaches consumer rights", whenToContact: "When the Motor Ombudsman cannot resolve or the manufacturer is not a member" },
    },
    legalFramework: [
      { title: "Consumer Rights Act 2015", summary: "Statutory rights exist independently of any warranty — a warranty cannot reduce your legal rights", section: "s.31" },
      { title: "Unfair Contract Terms", summary: "Warranty exclusions that are disproportionate or hidden may be challengeable as unfair terms" },
    ],
    evidenceChecklist: ["Warranty documentation", "Service history (full)", "Rejection letter from manufacturer", "Independent inspection report", "Communications with dealer and manufacturer", "Known issue reports (forums, DVSA, TSBs)"],
    complaintRoute: [
      { step: 1, title: "Escalate Within Manufacturer", description: "Request the case be escalated to a senior case manager or customer relations director", whatToSubmit: "Written escalation request with full history and evidence", expectedOutcome: "Senior review and possible goodwill offer" },
      { step: 2, title: "File with Motor Ombudsman", description: "Submit a formal complaint if the manufacturer is a TMO member", whatToSubmit: "Ombudsman complaint form with all correspondence and evidence", expectedOutcome: "Independent adjudication — binding on the manufacturer if you accept" },
      { step: 3, title: "Pre-Action Letter", description: "Send a formal pre-action letter giving 14 days to resolve before court proceedings", whatToSubmit: "Letter citing CRA 2015, detailing losses, and stating intent to issue proceedings", expectedOutcome: "Settlement offer or preparation for small claims" },
    ],
    expectedOutcomes: ["Goodwill repair authorised by manufacturer", "Warranty claim reconsidered and approved", "Ombudsman-ordered repair or compensation", "Settlement after pre-action letter", "Court-ordered remedy"],
  },
  {
    slug: "poor-repairs",
    title: "Poor Repairs / Repeat Failures",
    description: "A garage or dealer has carried out substandard repairs, or the same fault keeps recurring after repair.",
    icon: "Wrench",
    symptoms: [
      "Same fault recurring after repair",
      "New faults appearing after garage work",
      "Parts not replaced as quoted",
      "Vehicle returned in worse condition",
      "Overcharging for work not carried out",
    ],
    exampleScenarios: [
      "You paid £800 for a gearbox repair and the same fault returned within 2 weeks",
      "The garage replaced the wrong part and now refuses to fix it without further payment",
      "You were charged for genuine parts but received aftermarket alternatives",
    ],
    responsibleBodies: {
      primary: { name: "The Garage / Repairer", role: "Legally responsible for work carried out — must be done with reasonable care and skill", whenToContact: "Immediately — give them the opportunity to put it right" },
      secondary: { name: "Motor Ombudsman", abbreviation: "TMO", role: "Handles complaints about garage service quality", whenToContact: "If the garage is a TMO member and refuses to resolve the issue" },
      escalation: { name: "Trading Standards / Small Claims Court", role: "Legal enforcement for substandard services", whenToContact: "When the garage refuses all resolution and losses are significant" },
    },
    legalFramework: [
      { title: "Consumer Rights Act 2015", summary: "Services must be performed with reasonable care and skill, within a reasonable time, and for a reasonable price", section: "s.49, s.52, s.51" },
      { title: "Supply of Goods and Services Act 1982", summary: "Applies to mixed contracts — goods supplied must be of satisfactory quality" },
    ],
    evidenceChecklist: ["Original repair invoice", "Diagnostic report (before and after)", "Independent inspection of the repair work", "Photos/videos of substandard work", "Communications with the garage", "Quotes from other garages for corrective work"],
    complaintRoute: [
      { step: 1, title: "Formal Complaint to Garage", description: "Write to the garage detailing the substandard work and requesting a remedy", whatToSubmit: "Formal letter citing s.49 CRA 2015 with evidence of the poor repair", expectedOutcome: "Garage offers to redo the work or provides a refund" },
      { step: 2, title: "Independent Assessment", description: "Get an independent mechanic to assess the work and provide a report", whatToSubmit: "Written report confirming substandard work", expectedOutcome: "Evidence to support your claim" },
      { step: 3, title: "Motor Ombudsman or Legal Action", description: "Escalate to TMO or file a small claims court claim", whatToSubmit: "Full case file with both inspection reports and all correspondence", expectedOutcome: "Ordered repair or compensation" },
    ],
    expectedOutcomes: ["Free corrective repair by the original garage", "Full or partial refund of repair costs", "Compensation for consequential losses", "Ombudsman-ordered remedy", "Small claims court judgment"],
  },
  {
    slug: "motor-finance-disputes",
    title: "Motor Finance Disputes",
    description: "Issues with PCP, HP, or other motor finance agreements including mis-selling, hidden fees, or finance on faulty vehicles.",
    icon: "Banknote",
    symptoms: [
      "Finance agreement terms not properly explained",
      "Hidden fees or balloon payments",
      "Unable to reject a faulty financed vehicle",
      "Dealer commission not disclosed",
      "Negative equity issues at end of PCP",
      "Finance company refusing to act on faulty vehicle",
    ],
    exampleScenarios: [
      "You have a PCP on a faulty vehicle and the finance company refuses to let you reject it",
      "You were not told about dealer commission on your finance agreement",
      "The balloon payment is far higher than the car is worth",
    ],
    responsibleBodies: {
      primary: { name: "Finance Provider", role: "Jointly liable with the dealer for faulty goods under s.75 CCA 1974 or s.75A CRA 2015", whenToContact: "When you want to reject or claim against a faulty financed vehicle" },
      secondary: { name: "Financial Conduct Authority", abbreviation: "FCA", role: "Regulates consumer credit and motor finance providers", whenToContact: "To report systemic issues or firms acting outside FCA rules" },
      escalation: { name: "Financial Ombudsman Service", abbreviation: "FOS", role: "Independent dispute resolution for financial services complaints", whenToContact: "After 8 weeks without resolution or receipt of a final response from the provider" },
    },
    legalFramework: [
      { title: "Consumer Credit Act 1974", summary: "Section 75 makes the finance provider jointly liable for breach of contract or misrepresentation on credit agreements between £100 and £30,000", section: "s.75" },
      { title: "Consumer Rights Act 2015", summary: "Right to reject faulty goods applies against the finance provider under a hire purchase agreement", section: "s.19, s.20" },
      { title: "FCA Consumer Duty", summary: "Firms must act to deliver good outcomes for retail customers" },
    ],
    evidenceChecklist: ["Finance agreement (full document)", "Vehicle purchase invoice", "Evidence of faults", "Communications with dealer and finance provider", "Credit check records", "Commission disclosure (or lack thereof)"],
    complaintRoute: [
      { step: 1, title: "Formal Complaint to Finance Provider", description: "Write to the finance company setting out your complaint and citing s.75 CCA 1974", whatToSubmit: "Formal letter with finance agreement reference, fault details, and legal basis", expectedOutcome: "Finance provider investigates and may authorise rejection/repair" },
      { step: 2, title: "Escalate to Financial Ombudsman", description: "If the finance provider rejects your complaint or fails to respond within 8 weeks", whatToSubmit: "FOS complaint form with full case file", expectedOutcome: "FOS adjudication — can award up to £415,000 in compensation" },
      { step: 3, title: "Report to FCA", description: "Report the firm if you believe systemic misconduct (e.g., undisclosed commission)", whatToSubmit: "FCA online reporting form with details of the misconduct", expectedOutcome: "FCA may investigate the firm — supports wider regulatory action" },
    ],
    expectedOutcomes: ["Vehicle rejection and full refund of payments", "Compensation for mis-sold finance", "Finance agreement unwound due to misrepresentation", "FOS award of compensation", "Reduced settlement figure"],
  },
  {
    slug: "insurance-claim-issues",
    title: "Insurance Claim Issues",
    description: "Your motor insurer has unfairly rejected a claim, undervalued your vehicle, or acted in bad faith.",
    icon: "Shield",
    symptoms: [
      "Claim rejected without clear explanation",
      "Settlement offer far below market value",
      "Excessive delays in processing claim",
      "Insurer not honouring policy terms",
      "Third-party claim disputes",
    ],
    exampleScenarios: [
      "Your insurer wrote off your vehicle and offered £2,000 below market value",
      "Your claim was rejected because of an alleged non-disclosure you were never asked about",
      "The insurer has taken 3 months to process your claim with no updates",
    ],
    responsibleBodies: {
      primary: { name: "Your Insurance Provider", role: "Must handle claims fairly, promptly, and in line with policy terms", whenToContact: "First — request a formal review of the claim decision" },
      secondary: { name: "Financial Ombudsman Service", abbreviation: "FOS", role: "Independent dispute resolution for insurance complaints", whenToContact: "After 8 weeks or receipt of a final response letter" },
      escalation: { name: "Financial Conduct Authority", abbreviation: "FCA", role: "Regulates insurance firms and can investigate systemic issues", whenToContact: "To report firms acting outside FCA rules" },
    },
    legalFramework: [
      { title: "Insurance Act 2015", summary: "Requires fair presentation of risk — remedies must be proportionate to the breach" },
      { title: "FCA Insurance Conduct of Business Sourcebook (ICOBS)", summary: "Insurers must handle claims promptly and fairly and not unreasonably reject claims" },
      { title: "Consumer Rights Act 2015", summary: "Insurance is a service — must be provided with reasonable care and skill", section: "s.49" },
    ],
    evidenceChecklist: ["Insurance policy document", "Claim reference number", "Rejection letter or settlement offer", "Vehicle valuation evidence (Autotrader, CAP, Glass's)", "Photos of damage", "Independent repair quotes", "Communications with insurer"],
    complaintRoute: [
      { step: 1, title: "Formal Complaint to Insurer", description: "Submit a formal complaint challenging their decision with supporting evidence", whatToSubmit: "Formal complaint letter with policy reference, evidence of value, and legal basis", expectedOutcome: "Insurer reviews and may revise the offer" },
      { step: 2, title: "Escalate to Financial Ombudsman", description: "If the insurer maintains their position after 8 weeks", whatToSubmit: "FOS complaint with full evidence pack", expectedOutcome: "FOS adjudication and potential award" },
    ],
    expectedOutcomes: ["Revised settlement reflecting true market value", "Claim approval after review", "FOS award of compensation", "Apology and process improvement"],
  },
  {
    slug: "mot-garage-complaints",
    title: "MOT & Garage Complaints",
    description: "Issues with MOT testing standards, fraudulent passes or failures, or garage misconduct.",
    icon: "ClipboardCheck",
    symptoms: [
      "Vehicle passed MOT despite obvious defects",
      "Vehicle failed MOT on items that don't warrant failure",
      "Garage pressuring unnecessary repairs to pass MOT",
      "MOT certificate discrepancies",
      "Testing station not following proper procedures",
    ],
    exampleScenarios: [
      "Your vehicle was failed for an advisory item and the garage insisted on expensive repairs before retesting",
      "You discovered your MOT pass was fraudulent — the vehicle was never actually tested",
      "A garage failed your vehicle for items it shouldn't have, then offered to repair them",
    ],
    responsibleBodies: {
      primary: { name: "Driver & Vehicle Standards Agency", abbreviation: "DVSA", role: "Oversees MOT testing standards and can investigate testing stations", whenToContact: "When you suspect an MOT was conducted improperly or fraudulently" },
      secondary: { name: "Trading Standards", role: "Investigates businesses engaging in fraudulent or deceptive practices", whenToContact: "When a garage is using MOT testing to pressure unnecessary repairs" },
      escalation: { name: "Motor Ombudsman", abbreviation: "TMO", role: "Handles service quality complaints against member garages", whenToContact: "After direct complaint to the garage has failed" },
    },
    legalFramework: [
      { title: "Road Traffic Act 1988", summary: "Sets out the legal requirements for MOT testing and the offences for fraudulent certificates", section: "s.45-48" },
      { title: "Consumer Rights Act 2015", summary: "Garage services must be performed with reasonable care and skill", section: "s.49" },
    ],
    evidenceChecklist: ["MOT certificate", "MOT history (check via gov.uk)", "Photos/videos of alleged defects", "Independent inspection report", "Repair invoices from the testing station", "Communications with the garage"],
    complaintRoute: [
      { step: 1, title: "Complain to the Garage", description: "Put your complaint in writing to the garage manager", whatToSubmit: "Formal letter detailing the issues with the MOT test", expectedOutcome: "Garage offers retest or refund" },
      { step: 2, title: "Report to DVSA", description: "File an MOT complaint with DVSA online", whatToSubmit: "DVSA complaint form with MOT reference, vehicle details, and evidence", expectedOutcome: "DVSA may audit the testing station" },
      { step: 3, title: "Trading Standards or Legal Action", description: "Report fraudulent practices to Trading Standards", whatToSubmit: "Full evidence pack", expectedOutcome: "Investigation and possible prosecution" },
    ],
    expectedOutcomes: ["Free MOT retest", "DVSA audit of the testing station", "Refund of unnecessary repair costs", "Trading Standards prosecution", "Testing station losing authorisation"],
  },
  {
    slug: "faulty-parts",
    title: "Faulty Parts / Component Failures",
    description: "A vehicle part or component has failed prematurely, is defective, or was not fit for purpose.",
    icon: "Cog",
    symptoms: [
      "Part failed well before expected lifespan",
      "Replacement part is defective out of the box",
      "Component failure causing further vehicle damage",
      "Counterfeit or non-genuine parts sold as genuine",
    ],
    exampleScenarios: [
      "A brake disc cracked after 5,000 miles despite being rated for 30,000",
      "A turbo replacement failed within weeks of fitting",
      "You were sold 'genuine' parts that turned out to be counterfeit",
    ],
    responsibleBodies: {
      primary: { name: "Parts Supplier / Retailer", role: "Responsible for the quality of goods sold under Consumer Rights Act", whenToContact: "First — the retailer is liable, not the manufacturer" },
      secondary: { name: "Trading Standards", role: "Investigates counterfeit goods and unsafe products", whenToContact: "When counterfeit parts are involved or the supplier refuses to act" },
      escalation: { name: "Vehicle Certification Agency", abbreviation: "VCA", role: "Investigates safety-critical component failures", whenToContact: "When the part failure poses a safety risk" },
    },
    legalFramework: [
      { title: "Consumer Rights Act 2015", summary: "Goods must be of satisfactory quality and fit for purpose", section: "s.9, s.10" },
      { title: "General Product Safety Regulations 2005", summary: "Products must be safe — distributors must not supply unsafe products" },
    ],
    evidenceChecklist: ["Purchase receipt for the part", "Part number and manufacturer details", "Photos of the failed component", "Mechanic's report on the failure", "Evidence of mileage at failure", "Original packaging and labelling"],
    complaintRoute: [
      { step: 1, title: "Return to Retailer", description: "Exercise your right to reject or request replacement from the retailer", whatToSubmit: "Formal letter with receipt, failure evidence, and CRA 2015 reference", expectedOutcome: "Refund or replacement part" },
      { step: 2, title: "Report Counterfeit/Unsafe Parts", description: "If the part is counterfeit or posed a safety risk, report to Trading Standards", whatToSubmit: "Part details, packaging, purchase records", expectedOutcome: "Investigation into the supplier" },
    ],
    expectedOutcomes: ["Refund or replacement of defective part", "Compensation for consequential damage", "Trading Standards action against counterfeit sellers"],
  },
  {
    slug: "dvla-registration-issues",
    title: "DVLA / Registration Issues",
    description: "Problems with vehicle registration, V5C documents, vehicle tax, or DVLA administrative errors.",
    icon: "FileKey",
    symptoms: [
      "V5C not received or incorrect details",
      "Vehicle tax refund not processed",
      "SORN not properly recorded",
      "Keeper dispute — shown as keeper of a vehicle you've sold",
      "Personalised registration issues",
    ],
    exampleScenarios: [
      "You sold a vehicle 6 months ago but DVLA still shows you as the registered keeper",
      "Your V5C has incorrect details and DVLA is not responding to correction requests",
      "You've been fined for no tax on a vehicle you declared SORN",
    ],
    responsibleBodies: {
      primary: { name: "Driver & Vehicle Licensing Agency", abbreviation: "DVLA", role: "Responsible for vehicle registration, licensing, and vehicle tax", whenToContact: "First point of contact for all registration and licensing issues" },
      secondary: { name: "Parliamentary & Health Service Ombudsman", abbreviation: "PHSO", role: "Investigates complaints about government departments including DVLA", whenToContact: "After DVLA's internal complaints process is exhausted" },
      escalation: { name: "Your MP", role: "Can raise issues directly with DVLA on your behalf", whenToContact: "When DVLA is unresponsive and the Ombudsman route is too slow" },
    },
    legalFramework: [
      { title: "Vehicle Excise and Registration Act 1994", summary: "Governs vehicle registration and taxation requirements" },
      { title: "Road Vehicles (Registration and Licensing) Regulations 2002", summary: "Sets out the detailed rules for V5C and registration processes" },
    ],
    evidenceChecklist: ["V5C document (or copy)", "Proof of sale (if disputing keeper status)", "DVLA correspondence", "Screenshots of DVLA online account", "Tax payment receipts", "SORN confirmation"],
    complaintRoute: [
      { step: 1, title: "Contact DVLA Directly", description: "Call or write to DVLA's customer service with your complaint", whatToSubmit: "Formal letter with vehicle registration, issue details, and supporting documents", expectedOutcome: "DVLA corrects the record or explains their position" },
      { step: 2, title: "DVLA Formal Complaints", description: "If initial contact fails, submit a formal complaint through DVLA's complaints procedure", whatToSubmit: "Formal complaint referencing previous contact and unresolved issues", expectedOutcome: "Senior review within DVLA" },
      { step: 3, title: "Escalate to PHSO or MP", description: "If DVLA's complaints process fails, go to the Parliamentary Ombudsman or contact your MP", whatToSubmit: "Full correspondence history with DVLA", expectedOutcome: "Independent investigation or MP intervention" },
    ],
    expectedOutcomes: ["DVLA corrects vehicle records", "Refund of incorrectly charged tax", "Keeper status updated", "PHSO finding of maladministration", "Compensation for financial losses caused by DVLA errors"],
  },
  {
    slug: "enforcement-seizure",
    title: "Enforcement / Seizure Issues",
    description: "Your vehicle has been seized, clamped, or impounded — potentially unlawfully or disproportionately.",
    icon: "Lock",
    symptoms: [
      "Vehicle seized for alleged no insurance",
      "Vehicle clamped on private land",
      "Impound fees escalating daily",
      "Police seizure without proper grounds",
      "DVLA enforcement for tax issues",
    ],
    exampleScenarios: [
      "Police seized your vehicle claiming no insurance, but you were insured — MID not updated",
      "A private company clamped your vehicle on private land and is demanding excessive fees",
      "Your vehicle was seized and crushed without proper notice",
    ],
    responsibleBodies: {
      primary: { name: "The Seizing Authority", role: "Must follow proper procedures and have lawful grounds for seizure", whenToContact: "Immediately — request grounds for seizure and your rights in writing" },
      secondary: { name: "IOPC / Police Complaints", abbreviation: "IOPC", role: "Investigates complaints about police conduct during seizure", whenToContact: "When police have acted improperly during a vehicle seizure" },
      escalation: { name: "Magistrates' Court / County Court", role: "Can order return of vehicle and award compensation for unlawful seizure", whenToContact: "When the vehicle was seized without lawful authority and isn't being returned" },
    },
    legalFramework: [
      { title: "Road Traffic Act 1988", summary: "Powers for police to seize uninsured vehicles — strict procedures must be followed", section: "s.165A" },
      { title: "Protection of Freedoms Act 2012", summary: "Banned wheel clamping on private land in England and Wales" },
      { title: "Taking Control of Goods Regulations 2013", summary: "Bailiffs must follow strict procedures when seizing vehicles for debt enforcement" },
    ],
    evidenceChecklist: ["Seizure notice/receipt", "Insurance certificate (if claiming wrongful seizure)", "Photos of the vehicle and location", "Police body-worn camera footage request", "Communications with the seizing authority", "Proof of ownership"],
    complaintRoute: [
      { step: 1, title: "Challenge the Seizure", description: "Write to the seizing authority demanding grounds and requesting return of the vehicle", whatToSubmit: "Formal letter with proof of insurance/tax/ownership", expectedOutcome: "Vehicle returned without charge" },
      { step: 2, title: "Complain to IOPC (if police)", description: "File a complaint about police conduct during the seizure", whatToSubmit: "IOPC complaint form with seizure details and evidence", expectedOutcome: "Investigation into police actions" },
      { step: 3, title: "Court Application", description: "Apply to court for return of vehicle and compensation", whatToSubmit: "Court application with full evidence of unlawful seizure", expectedOutcome: "Court-ordered return and compensation" },
    ],
    expectedOutcomes: ["Vehicle returned without charge", "Refund of impound fees", "Police disciplinary action", "Court-ordered compensation", "Apology and policy change"],
  },
]

// ============================================================================
// AUTHORITIES DIRECTORY
// ============================================================================

export const MOTORING_AUTHORITIES: MotoringAuthority[] = [
  {
    slug: "dvsa",
    name: "Driver & Vehicle Standards Agency",
    abbreviation: "DVSA",
    description: "Government agency responsible for setting and enforcing vehicle safety standards, managing MOT testing, overseeing vehicle recalls, and investigating safety defect reports from the public.",
    jurisdiction: "Great Britain (England, Scotland, Wales)",
    whenToContact: "When your vehicle has a safety defect that could affect other road users, when you suspect an MOT was conducted improperly, or when a manufacturer is failing to address a known safety issue.",
    whatTheyCannotDo: "Cannot force a manufacturer to pay you compensation, cannot resolve individual consumer disputes, cannot order specific repairs on your vehicle.",
    contactUrl: "https://www.gov.uk/government/organisations/driver-and-vehicle-standards-agency",
    complaintsUrl: "https://www.gov.uk/report-vehicle-safety-defect",
    phoneNumber: "0300 123 9000",
  },
  {
    slug: "dvla",
    name: "Driver & Vehicle Licensing Agency",
    abbreviation: "DVLA",
    description: "Government agency responsible for maintaining the register of drivers and vehicles in Great Britain, issuing driving licences, collecting vehicle excise duty (road tax), and managing V5C registration documents.",
    jurisdiction: "Great Britain (England, Scotland, Wales)",
    whenToContact: "For vehicle registration issues, V5C problems, vehicle tax disputes, keeper status disputes, or personalised registration plate issues.",
    whatTheyCannotDo: "Cannot resolve mechanical faults, cannot act on safety defect reports (that's DVSA), cannot handle MOT disputes.",
    contactUrl: "https://www.gov.uk/government/organisations/driver-and-vehicle-licensing-agency",
    complaintsUrl: "https://www.gov.uk/government/organisations/driver-and-vehicle-licensing-agency/about/complaints-procedure",
    phoneNumber: "0300 790 6801",
  },
  {
    slug: "vca",
    name: "Vehicle Certification Agency",
    abbreviation: "VCA",
    description: "The UK's designated Type Approval Authority, responsible for ensuring vehicles and vehicle parts meet environmental and safety standards before they can be sold in the UK.",
    jurisdiction: "United Kingdom",
    whenToContact: "When a vehicle type has a systemic safety defect that the manufacturer and DVSA have failed to address, or when you suspect a vehicle does not meet its type approval specifications.",
    whatTheyCannotDo: "Cannot handle individual consumer complaints, cannot order compensation, does not deal with used car sales disputes.",
    contactUrl: "https://www.vehicle-certification-agency.gov.uk",
    complaintsUrl: "https://www.vehicle-certification-agency.gov.uk/contact-us/",
  },
  {
    slug: "dft",
    name: "Department for Transport",
    abbreviation: "DfT",
    description: "Government department responsible for transport policy in England and reserved transport matters in Scotland, Wales, and Northern Ireland. Oversees DVSA, DVLA, and VCA.",
    jurisdiction: "United Kingdom (policy); England (most operational matters)",
    whenToContact: "As a last resort when DVSA, DVLA, or VCA have failed to act and there is a systemic issue requiring ministerial attention.",
    whatTheyCannotDo: "Does not handle individual complaints directly — will refer to the relevant agency. Cannot order manufacturers to take specific action.",
    contactUrl: "https://www.gov.uk/government/organisations/department-for-transport",
    complaintsUrl: "https://www.gov.uk/government/organisations/department-for-transport/about/complaints-procedure",
  },
  {
    slug: "trading-standards",
    name: "Trading Standards",
    abbreviation: "TS",
    description: "Local authority service that enforces consumer protection legislation. Investigates businesses engaged in unfair trading, fraud, or selling unsafe products. Accessed via Citizens Advice consumer helpline.",
    jurisdiction: "England and Wales (via local authorities)",
    whenToContact: "When a dealer or garage is engaging in unfair or deceptive practices, selling unsafe products, or refusing to comply with consumer protection law.",
    whatTheyCannotDo: "Cannot award you compensation directly, cannot act as your legal representative, may not investigate individual one-off complaints.",
    contactUrl: "https://www.citizensadvice.org.uk/consumer/get-more-help/report-to-trading-standards/",
    complaintsUrl: "https://www.citizensadvice.org.uk/consumer/get-more-help/report-to-trading-standards/",
    phoneNumber: "0808 223 1133",
  },
  {
    slug: "citizens-advice",
    name: "Citizens Advice",
    abbreviation: "CA",
    description: "Free, independent advice service covering consumer rights, debt, housing, and more. Acts as the gateway to Trading Standards via the consumer helpline.",
    jurisdiction: "England and Wales",
    whenToContact: "For free initial advice on your consumer rights, to report a business to Trading Standards, or when you need guidance on next steps.",
    whatTheyCannotDo: "Cannot take legal action on your behalf, cannot force a business to act, does not provide formal legal representation.",
    contactUrl: "https://www.citizensadvice.org.uk",
    complaintsUrl: "https://www.citizensadvice.org.uk/consumer/get-more-help/report-to-trading-standards/",
    phoneNumber: "0808 223 1133",
  },
  {
    slug: "motor-ombudsman",
    name: "The Motor Ombudsman",
    abbreviation: "TMO",
    description: "Independent dispute resolution body for the motor industry. Handles complaints about vehicle purchases, servicing, repairs, and warranty issues — but only against businesses that are registered members.",
    jurisdiction: "United Kingdom",
    whenToContact: "After you've exhausted the business's own complaints procedure (8 weeks or final response), and the business is a registered TMO member.",
    whatTheyCannotDo: "Cannot act against businesses that are not members. Cannot handle complaints about private sales. Decisions are binding on the business but not on you.",
    contactUrl: "https://www.themotorombudsman.org",
    complaintsUrl: "https://www.themotorombudsman.org/consumers/make-a-complaint",
    phoneNumber: "0345 241 3008",
  },
  {
    slug: "financial-ombudsman",
    name: "Financial Ombudsman Service",
    abbreviation: "FOS",
    description: "Independent dispute resolution service for financial services complaints including motor finance, insurance, and credit. Can make binding decisions and award compensation up to £415,000.",
    jurisdiction: "United Kingdom",
    whenToContact: "After 8 weeks without resolution from your finance provider or insurer, or after receiving a final response letter.",
    whatTheyCannotDo: "Cannot change the law, cannot fine companies, cannot deal with complaints that are already in court.",
    contactUrl: "https://www.financial-ombudsman.org.uk",
    complaintsUrl: "https://www.financial-ombudsman.org.uk/consumers/how-to-complain",
    phoneNumber: "0800 023 4567",
  },
  {
    slug: "fca",
    name: "Financial Conduct Authority",
    abbreviation: "FCA",
    description: "Regulates financial services firms in the UK, including motor finance providers and insurance companies. Sets conduct rules and can investigate and fine firms for misconduct.",
    jurisdiction: "United Kingdom",
    whenToContact: "To report systemic issues with a financial services firm (not individual disputes — use FOS for those). Particularly relevant for undisclosed dealer commission on motor finance.",
    whatTheyCannotDo: "Cannot resolve individual complaints or award compensation to individuals. Cannot act on one-off disputes.",
    contactUrl: "https://www.fca.org.uk",
    complaintsUrl: "https://www.fca.org.uk/consumers/report-scam-unauthorised-firm",
    phoneNumber: "0800 111 6768",
  },
  {
    slug: "cma",
    name: "Competition & Markets Authority",
    abbreviation: "CMA",
    description: "Promotes competition and tackles anti-competitive behaviour. Investigates market-wide issues including misleading pricing, warranty practices, and anti-competitive agreements in the motor industry.",
    jurisdiction: "United Kingdom",
    whenToContact: "When you suspect market-wide anti-competitive practices in the motor industry, such as price fixing, coordinated warranty denials, or systematic misleading claims.",
    whatTheyCannotDo: "Cannot resolve individual consumer disputes. Investigations are typically market-wide, not case-specific.",
    contactUrl: "https://www.gov.uk/government/organisations/competition-and-markets-authority",
    complaintsUrl: "https://www.gov.uk/government/organisations/competition-and-markets-authority/about/complaints-procedure",
  },
  {
    slug: "ico",
    name: "Information Commissioner's Office",
    abbreviation: "ICO",
    description: "Regulates data protection and freedom of information in the UK. Relevant when motoring companies mishandle your personal data or refuse subject access requests.",
    jurisdiction: "United Kingdom",
    whenToContact: "When a motor company has mishandled your personal data, refused a subject access request, or shared your data without consent.",
    whatTheyCannotDo: "Cannot award compensation to individuals (you'd need the courts for that). Cannot force a company to delete specific records if they have a lawful basis.",
    contactUrl: "https://ico.org.uk",
    complaintsUrl: "https://ico.org.uk/make-a-complaint/",
    phoneNumber: "0303 123 1113",
  },
]

// ============================================================================
// LAWS & RIGHTS
// ============================================================================

export const MOTORING_LAWS: MotoringLaw[] = [
  {
    slug: "consumer-rights-act-2015",
    title: "Consumer Rights Act 2015",
    year: 2015,
    description: "The primary legislation protecting consumers when buying goods and services. Requires vehicles to be of satisfactory quality, fit for purpose, and as described. Provides rights to reject, repair, replacement, and price reduction.",
    keyRights: [
      "Goods must be of satisfactory quality (s.9)",
      "Goods must be fit for a particular purpose (s.10)",
      "Goods must match the description (s.11)",
      "Right to reject within 30 days for a full refund (s.20)",
      "Right to repair or replacement after 30 days (s.23)",
      "Right to price reduction or final right to reject after failed repair (s.24)",
      "Services must be performed with reasonable care and skill (s.49)",
      "Burden of proof on retailer for first 6 months (s.19(14))",
    ],
    timeLimits: "30 days for short-term right to reject. 6 months with burden on retailer. Up to 6 years to bring a claim (Limitation Act 1980).",
    applicationScenarios: [
      "Vehicle purchased from a dealer is faulty",
      "Garage repair work is substandard",
      "Vehicle does not match the dealer's advertisement",
    ],
    legislationUrl: "https://www.legislation.gov.uk/ukpga/2015/15",
  },
  {
    slug: "general-product-safety-regulations-2005",
    title: "General Product Safety Regulations 2005",
    year: 2005,
    description: "Requires that all products placed on the market are safe. Manufacturers and distributors have ongoing duties to monitor product safety, notify authorities of risks, and take corrective action including recalls.",
    keyRights: [
      "Products must be safe under normal or reasonably foreseeable conditions of use",
      "Manufacturers must inform consumers of risks that are not immediately obvious",
      "Manufacturers must take measures to prevent risks (including withdrawal and recall)",
      "Distributors must not supply products they know to be dangerous",
      "Consumers can report unsafe products to Trading Standards",
    ],
    timeLimits: "No specific time limit — applies throughout the product's reasonably foreseeable lifespan.",
    applicationScenarios: [
      "A vehicle has a design defect that makes it unsafe",
      "A manufacturer knows about a safety defect but has not recalled the vehicle",
      "A component failure creates a danger to the driver or other road users",
    ],
    legislationUrl: "https://www.legislation.gov.uk/uksi/2005/1803",
  },
  {
    slug: "road-vehicles-approval-regulations-2020",
    title: "Road Vehicles (Approval) Regulations 2020",
    year: 2020,
    description: "Sets out the UK framework for vehicle type approval following Brexit. Manufacturers must ensure vehicles meet safety and environmental standards. Vehicles that fail to meet approval standards can be subject to recall.",
    keyRights: [
      "Vehicles must meet applicable technical standards before sale",
      "Manufacturers must notify the VCA of any safety defects",
      "VCA can require mandatory recalls for vehicles that don't meet standards",
      "Consumers can report vehicles that don't meet approval standards to VCA",
    ],
    timeLimits: "No specific consumer time limit — regulations apply to manufacturers at point of sale and throughout vehicle life.",
    applicationScenarios: [
      "A vehicle has a systemic defect suggesting it didn't meet type approval",
      "The manufacturer is aware of a defect but hasn't notified VCA",
      "A vehicle modification by the manufacturer has introduced a safety risk",
    ],
    legislationUrl: "https://www.legislation.gov.uk/uksi/2020/818",
  },
  {
    slug: "consumer-credit-act-1974",
    title: "Consumer Credit Act 1974",
    year: 1974,
    description: "Protects consumers who buy goods on credit. Section 75 makes the finance provider jointly liable with the seller for breach of contract or misrepresentation on credit agreements between £100 and £30,000.",
    keyRights: [
      "Finance provider is jointly liable for faulty goods (s.75)",
      "Right to claim against the finance company when the dealer has ceased trading",
      "Protection against unfair credit relationships (s.140A)",
      "Right to receive pre-contract information",
      "Right to withdraw from a credit agreement within 14 days",
    ],
    timeLimits: "6 years from the date of the breach to bring a claim. 14-day cooling-off period for credit agreements.",
    applicationScenarios: [
      "Vehicle purchased on PCP or HP is faulty and the dealer won't help",
      "Dealer has gone bust but you're still paying finance on a faulty vehicle",
      "Finance agreement was mis-sold or commission was not disclosed",
    ],
    legislationUrl: "https://www.legislation.gov.uk/ukpga/1974/39",
  },
]

// ============================================================================
// EVIDENCE TEMPLATES (per issue category)
// ============================================================================

export const MOTORING_EVIDENCE_TEMPLATES: EvidenceTemplate[] = [
  {
    categorySlug: "vehicle-safety-defects",
    items: [
      { label: "Vehicle Registration (V5C)", description: "Copy of V5C showing registered keeper, VIN, and vehicle details", required: true },
      { label: "VIN Number", description: "17-character Vehicle Identification Number from the vehicle or V5C", required: true },
      { label: "Current Mileage", description: "Odometer reading at time of fault and current reading", required: true },
      { label: "Service History", description: "Full service records showing maintenance has been carried out", required: true },
      { label: "Diagnostic Fault Codes", description: "OBD-II fault codes read from the vehicle's ECU", required: false },
      { label: "Independent Inspection Report", description: "Report from an independent accredited engineer confirming the defect", required: false },
      { label: "Photos & Videos", description: "Visual evidence of the defect, damage, or fault conditions", required: true },
      { label: "Fault Timeline", description: "Detailed timeline of when the fault first appeared and how it progressed", required: true },
      { label: "Manufacturer Correspondence", description: "All emails, letters, and call records with the manufacturer or dealer", required: false },
      { label: "Repair Invoices & Quotes", description: "Costs incurred or quoted for diagnosis and repair", required: false },
      { label: "Road/Weather Conditions", description: "Conditions at the time of failure (e.g., standing water, temperature)", required: false },
    ],
  },
  {
    categorySlug: "dealer-sale-issues",
    items: [
      { label: "Purchase Receipt/Invoice", description: "Proof of purchase showing price, date, dealer details", required: true },
      { label: "Vehicle Advertisement", description: "Screenshot or printout of the original listing/advert", required: true },
      { label: "V5C Registration Document", description: "Shows keeper history and vehicle details", required: true },
      { label: "MOT History", description: "Full MOT history via gov.uk/check-mot-history", required: true },
      { label: "HPI/Provenance Check", description: "Report showing outstanding finance, write-offs, stolen status", required: false },
      { label: "Independent Inspection", description: "Post-purchase inspection report detailing faults", required: false },
      { label: "Photos/Videos of Faults", description: "Visual evidence of issues with the vehicle", required: true },
      { label: "Dealer Communications", description: "All correspondence with the selling dealer", required: true },
      { label: "Finance Agreement", description: "Copy of any finance agreement associated with the purchase", required: false },
    ],
  },
  {
    categorySlug: "motor-finance-disputes",
    items: [
      { label: "Finance Agreement", description: "Complete copy of the signed finance agreement", required: true },
      { label: "Pre-Contract Information", description: "Any information provided before signing (APR, total payable, etc.)", required: true },
      { label: "Vehicle Purchase Invoice", description: "The invoice from the dealer showing the vehicle price", required: true },
      { label: "Evidence of Vehicle Faults", description: "Inspection reports, photos, diagnostic codes proving faults", required: false },
      { label: "Finance Provider Correspondence", description: "All letters and emails with the finance company", required: true },
      { label: "Commission Disclosure", description: "Any disclosure (or evidence of non-disclosure) of dealer commission", required: false },
      { label: "Payment Records", description: "Bank statements showing payments made under the agreement", required: false },
    ],
  },
  {
    categorySlug: "poor-repairs",
    items: [
      { label: "Original Repair Invoice", description: "Invoice showing what work was quoted and charged", required: true },
      { label: "Pre-Repair Diagnostic", description: "Diagnostic report from before the repair work", required: false },
      { label: "Post-Repair Diagnostic", description: "Diagnostic report showing the fault has recurred or new faults exist", required: true },
      { label: "Independent Inspection", description: "Third-party assessment of the repair quality", required: false },
      { label: "Photos/Videos", description: "Visual evidence of substandard work", required: true },
      { label: "Garage Communications", description: "All correspondence with the repairing garage", required: true },
      { label: "Corrective Repair Quotes", description: "Quotes from other garages to fix the substandard work", required: false },
    ],
  },
]

// ============================================================================
// HELPERS
// ============================================================================

export function getMotoringCategory(slug: string): MotoringIssueCategory | undefined {
  return MOTORING_ISSUE_CATEGORIES.find((c) => c.slug === slug)
}

export function getMotoringAuthority(slug: string): MotoringAuthority | undefined {
  return MOTORING_AUTHORITIES.find((a) => a.slug === slug)
}

export function getMotoringLaw(slug: string): MotoringLaw | undefined {
  return MOTORING_LAWS.find((l) => l.slug === slug)
}

export function getEvidenceTemplate(categorySlug: string): EvidenceTemplate | undefined {
  return MOTORING_EVIDENCE_TEMPLATES.find((t) => t.categorySlug === categorySlug)
}
