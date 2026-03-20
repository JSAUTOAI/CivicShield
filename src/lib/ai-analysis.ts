// AI Legal Analysis Engine — powered by Claude API
// Analyzes issues against UK law and generates structured legal analysis

export interface RightsViolation {
  type: string
  description: string
  legalResponse: string
  severity: "high" | "medium" | "low"
}

export interface LegalPrecedentResult {
  caseName: string
  caseReference: string
  year: string
  court: string
  courtLevel: string
  keyPrinciple: string
  relevance: string
  legalDeclaration: string
  caseUrl?: string
  isBinding: boolean
}

export interface LegislationResult {
  actTitle: string
  description: string
  legalDeclaration: string
  relevance: string
}

export interface RecommendedAction {
  title: string
  description: string
  priority: "primary" | "secondary"
  actionUrl?: string
}

export interface LegalAnalysisResult {
  summary: string
  rightsViolations: RightsViolation[]
  precedents: LegalPrecedentResult[]
  legislation: LegislationResult[]
  recommendedActions: RecommendedAction[]
  complaintText: string
  complaintRecipient: {
    name: string
    organization: string
    address: string
    email?: string
  }
  ccRecipients: Array<{
    name: string
    organization: string
    role: string
  }>
}

const ANALYSIS_SYSTEM_PROMPT = `You are a UK legal analysis AI for CivicShield, a civic rights platform. You analyze issues reported by UK citizens and provide structured legal analysis.

Your role is to:
1. Identify specific rights violations based on UK law (common law, statute law, and natural rights of the living man/woman)
2. Find relevant legal precedents (real UK case law with accurate citations)
3. Identify relevant UK legislation
4. Generate a professional, solicitor-grade formal complaint letter
5. Identify the correct complaint recipients and oversight bodies to CC
6. Recommend specific actions the person can take

IMPORTANT GUIDELINES:
- Always defend the rights of the individual, especially natural rights that exist prior to and independent of statutory law
- Reference real UK case law with accurate citations
- Reference real UK legislation with correct act names and years
- Generate complaint letters that are formal, professional, and legally sound
- Identify the correct regulatory/oversight body for each type of complaint
- Include legal declaration templates the person can use
- Be thorough but accessible — explain legal concepts in plain English
- Always consider: Human Rights Act 1998, common law rights, natural law principles

RESPOND IN VALID JSON matching this exact structure:
{
  "summary": "Brief summary of the legal position",
  "rightsViolations": [
    {
      "type": "Name of violation (e.g. Trespass, Harassment)",
      "description": "Description of how this violation occurred",
      "legalResponse": "A quoted legal response the person can use",
      "severity": "high|medium|low"
    }
  ],
  "precedents": [
    {
      "caseName": "Full case name with year",
      "caseReference": "Neutral citation e.g. [2006] UKHL 55",
      "year": "Year",
      "court": "Court name",
      "courtLevel": "House of Lords|Supreme Court|High Court|Court of Appeal|Crown Court|Magistrates Court",
      "keyPrinciple": "The key legal principle established",
      "relevance": "How this applies to the current issue",
      "legalDeclaration": "A legal declaration template citing this case",
      "isBinding": true/false
    }
  ],
  "legislation": [
    {
      "actTitle": "Full act name with year",
      "description": "What this act covers and why it's relevant",
      "legalDeclaration": "A legal declaration invoking this legislation",
      "relevance": "How specifically it applies"
    }
  ],
  "recommendedActions": [
    {
      "title": "Action title",
      "description": "What to do and why",
      "priority": "primary|secondary"
    }
  ],
  "complaintText": "The full formal complaint letter text with [Your Name], [Your Address] etc. placeholders",
  "complaintRecipient": {
    "name": "Recipient name or title",
    "organization": "Organization name",
    "address": "Full address if known",
    "email": "Email if known"
  },
  "ccRecipients": [
    {
      "name": "Oversight body name",
      "organization": "e.g. Independent Office for Police Conduct",
      "role": "Why they are being CC'd"
    }
  ]
}`

export async function analyzeIssue(issue: {
  issueCategory: string
  issueType: string
  description: string
  organization: string
  individual?: string | null
  dateOfIncident: string
  timeOfIncident?: string | null
  location: string
  userRole: string
}): Promise<LegalAnalysisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    // Return a structured mock response for development
    return getMockAnalysis(issue)
  }

  const userMessage = `Analyze this civic rights issue reported by a UK citizen:

ISSUE CATEGORY: ${issue.issueCategory}
SPECIFIC TYPE: ${issue.issueType}
DESCRIPTION: ${issue.description}
ORGANIZATION INVOLVED: ${issue.organization}
${issue.individual ? `INDIVIDUAL: ${issue.individual}` : ""}
DATE: ${issue.dateOfIncident}
${issue.timeOfIncident ? `TIME: ${issue.timeOfIncident}` : ""}
LOCATION: ${issue.location}
ROLE: ${issue.userRole}

Provide a full legal analysis with rights violations, precedents, legislation, complaint letter, and recommended actions. The complaint should be addressed to the correct department/person at ${issue.organization} and CC the appropriate oversight body.`

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: ANALYSIS_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Claude API error:", errorText)
    throw new Error(`AI analysis failed: ${response.status}`)
  }

  const data = await response.json()
  const content = data.content[0]?.text

  if (!content) {
    throw new Error("Empty response from AI")
  }

  // Parse JSON from the response
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("Could not parse AI response as JSON")
  }

  return JSON.parse(jsonMatch[0]) as LegalAnalysisResult
}

// Development mock — provides realistic analysis structure
function getMockAnalysis(issue: {
  issueCategory: string
  issueType: string
  description: string
  organization: string
}): LegalAnalysisResult {
  return {
    summary: `Defending the rights of the living man under UK legislation and common law. Based on the reported incident involving ${issue.organization}, several potential rights violations have been identified.`,
    rightsViolations: [
      {
        type: "Trespass",
        description: `If the implied right of access was revoked, any entry onto the property may constitute trespass unless specific legal authority was obtained.`,
        legalResponse: `"I do not consent to this violation of my trespass. Under applicable law, I request that you cease this action immediately and respect my lawful rights."`,
        severity: "high",
      },
      {
        type: "Harassment",
        description: `The actions described could be considered harassment if they involved threatening behavior or caused significant alarm and distress.`,
        legalResponse: `"I do not consent to this violation of my harassment. Under Protection from Harassment Act 1997, I request that you cease this action immediately and respect my lawful rights."`,
        severity: "high",
      },
    ],
    precedents: [
      {
        caseName: "Evans v. South Ribble Borough Council [1993]",
        caseReference: "[1993] QB 426",
        year: "1993",
        court: "UK High Court",
        courtLevel: "High Court",
        keyPrinciple: "Establishes rights protection in similar contexts. Bailiffs must adhere strictly to entry rights and can be held liable for trespass.",
        relevance: "This case dealt with unauthorized entry by enforcement officers, reinforcing that they can be held liable for any trespass.",
        legalDeclaration: `"With reference to the precedent established in Evans, I assert that my rights in this context must be upheld."`,
        isBinding: false,
      },
      {
        caseName: "R v. Bogdal [2011]",
        caseReference: "R v. Bogdal [2011]",
        year: "2011",
        court: "Crown Court",
        courtLevel: "Crown Court",
        keyPrinciple: "Considered harassment by bailiffs and supported use of the Protection from Harassment Act 1997 in similar circumstances.",
        relevance: "Directly applicable to allegations of harassment by enforcement agents.",
        legalDeclaration: `"As established in R v. Bogdal, I assert my right to protection from harassment."`,
        isBinding: false,
      },
      {
        caseName: "Laporte v Chief Constable of Gloucestershire [2006] UKHL 55",
        caseReference: "[2006] UKHL 55",
        year: "2006",
        court: "House of Lords",
        courtLevel: "House of Lords",
        keyPrinciple: "Police must act proportionately when restricting liberty and freedom of movement.",
        relevance: "Establishes that authorities must act proportionately.",
        legalDeclaration: `"Police actions restricting my liberty must be proportionate to any legitimate aim."`,
        isBinding: true,
      },
      {
        caseName: "Austin v Commissioner of Police of the Metropolis [2009] UKHL 5",
        caseReference: "[2009] UKHL 5",
        year: "2009",
        court: "House of Lords",
        courtLevel: "House of Lords",
        keyPrinciple: "Concerns the lawfulness of containment ('kettling') by police and the threshold for deprivation of liberty.",
        relevance: "Relevant to any restriction of movement by authorities.",
        legalDeclaration: `"Any restriction of my movement by authorities must be justified, necessary and proportionate."`,
        isBinding: true,
      },
      {
        caseName: "Javed v British Gas Trading Ltd [2021] EWHC 2682",
        caseReference: "[2021] EWHC 2682",
        year: "2021",
        court: "High Court",
        courtLevel: "High Court",
        keyPrinciple: "Concerns the lawfulness of bailiff/enforcement actions and proper notification requirements.",
        relevance: "Enforcement agents must provide proper notice before taking enforcement action.",
        legalDeclaration: `"Enforcement agents must provide proper notice before taking enforcement action."`,
        isBinding: false,
      },
      {
        caseName: "R (Wandsworth LBC) v Magistrates' Court [2003] EWHC 2083",
        caseReference: "[2003] EWHC 2083",
        year: "2003",
        court: "High Court",
        courtLevel: "High Court",
        keyPrinciple: "Established principles for warrants of entry and execution by bailiffs.",
        relevance: "Bailiffs must have proper and valid warrants before entering property.",
        legalDeclaration: `"Bailiffs must have proper and valid warrants before entering my property."`,
        isBinding: false,
      },
    ],
    legislation: [
      {
        actTitle: "Tribunals, Courts and Enforcement Act 2007",
        description: "This Act outlines the powers and responsibilities of enforcement agents (bailiffs), including conduct rules and entry rights.",
        legalDeclaration: `"I invoke my rights under Tribunals, Courts and Enforcement Act 2007. This legislation clearly establishes that my rights in this matter must be respected."`,
        relevance: "Directly governs bailiff conduct and powers of entry.",
      },
      {
        actTitle: "Protection from Harassment Act 1997",
        description: "This Act provides protection against harassment and can be applied if a bailiff's conduct causes fear, alarm, or distress.",
        legalDeclaration: `"I invoke my rights under Protection from Harassment Act 1997. This legislation clearly establishes that my rights in this matter must be respected."`,
        relevance: "Applicable where enforcement conduct constitutes harassment.",
      },
      {
        actTitle: "The Taking Control of Goods Regulations 2013",
        description: "These Regulations stipulate the procedures that bailiffs must follow, including restrictions on forceful entry and conduct standards.",
        legalDeclaration: `"I invoke my rights under The Taking Control of Goods Regulations 2013. This legislation clearly establishes that my rights in this matter must be respected."`,
        relevance: "Sets out specific rules bailiffs must follow.",
      },
    ],
    recommendedActions: [
      {
        title: `File a Complaint with the Bailiff's Creditor or Agency`,
        description: `To address the misconduct, start by filing a formal complaint with the creditors or the agency that employed the bailiff.`,
        priority: "primary",
      },
      {
        title: "Report to the Police",
        description: "If you believe criminal acts like trespassing or harassment occurred, report the incident to the police.",
        priority: "secondary",
      },
      {
        title: "Consult a Solicitor",
        description: "Consult with a solicitor experienced in civil rights or consumer law to explore potential legal actions.",
        priority: "secondary",
      },
    ],
    complaintText: `[Your Address]
[City, Postcode]
[Date]

${issue.organization}
[Agency's Address]
[City, Postcode]

Dear Sir/Madam,

Subject: Formal Complaint Regarding Misconduct and Rights Violation

I am writing to formally register a complaint regarding an incident that took place involving your organization. The details of this matter are set out below.

${issue.description}

This conduct constitutes a breach of my fundamental rights under both statutory and common law. Specifically, I draw your attention to the following:

1. The Tribunals, Courts and Enforcement Act 2007, which sets out the powers and limitations of enforcement agents
2. The Taking Control of Goods Regulations 2013, which prescribes the procedures that must be followed
3. The Protection from Harassment Act 1997, which prohibits conduct causing alarm or distress

I am aware of my rights under the above legislation and common law, and I hereby invoke these protections. I request that you:

1. Acknowledge receipt of this complaint within 14 days
2. Conduct a thorough investigation into the conduct described
3. Provide a full written response within 28 days
4. Take appropriate disciplinary action against any individuals found to have acted improperly
5. Confirm what measures will be put in place to prevent similar incidents

I reserve the right to escalate this matter to the relevant regulatory body and/or to pursue legal action should a satisfactory response not be received.

Yours faithfully,

[Your Name]`,
    complaintRecipient: {
      name: "Complaints Department",
      organization: issue.organization,
      address: "[Organization Address]",
    },
    ccRecipients: [
      {
        name: "Relevant Oversight Body",
        organization: "Appropriate regulatory authority",
        role: "Oversight and accountability",
      },
    ],
  }
}
