/**
 * CivicShield Resource Tab Data
 *
 * Hardwired content for all resource page tabs:
 * Case Law, Natural Rights, Parking Fines, Educational
 *
 * The Legislation tab uses its own inline data in the resources page.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface CaseLawEntry {
  caseName: string
  citation: string
  year: number
  court: string
  keyPrinciple: string
  category: string
  url: string | null
  tags: string[]
}

export interface NaturalRightsEntry {
  title: string
  description: string
  sourceUrl: string | null
  section: string
  tags: string[]
}

export interface ParkingFinesEntry {
  title: string
  description: string
  section: string
  sourceUrl: string | null
  tags: string[]
  actionType?: "guide" | "legislation" | "template" | "awareness" | "link"
}

export interface EducationalEntry {
  title: string
  description: string
  section: string
  sourceUrl: string | null
  tags: string[]
}

// ============================================================================
// CASE LAW
// ============================================================================

export const caseLawResources: CaseLawEntry[] = [
  // Police & Liberty
  {
    caseName: "Entick v Carrington",
    citation: "[1765] EWHC KB J98",
    year: 1765,
    court: "Court of King's Bench",
    keyPrinciple: "Established that the state cannot interfere with property rights without clear legal authority. General warrants are unlawful. The executive must point to specific legal authority for any action it takes.",
    category: "Police & Liberty",
    url: "https://www.bailii.org/ew/cases/EWHC/KB/1765/J98.html",
    tags: ["property rights", "warrants", "state power", "fundamental"],
  },
  {
    caseName: "Laporte v Chief Constable of Gloucestershire",
    citation: "[2006] UKHL 55",
    year: 2006,
    court: "House of Lords",
    keyPrinciple: "Police cannot prevent people from attending a lawful protest on the basis that a breach of the peace might occur. Preventive action must be proportionate and based on imminent threat.",
    category: "Police & Liberty",
    url: "https://www.bailii.org/uk/cases/UKHL/2006/55.html",
    tags: ["right to protest", "police powers", "breach of peace"],
  },
  {
    caseName: "Austin v Commissioner of Police of the Metropolis",
    citation: "[2009] UKHL 5",
    year: 2009,
    court: "House of Lords",
    keyPrinciple: "Police 'kettling' (containing protesters) does not necessarily breach Article 5 right to liberty if it is the least intrusive and most effective means of preventing imminent violence.",
    category: "Police & Liberty",
    url: "https://www.bailii.org/uk/cases/UKHL/2009/5.html",
    tags: ["kettling", "right to liberty", "article 5", "protest"],
  },
  {
    caseName: "Rice v Connolly",
    citation: "[1966] 2 QB 414",
    year: 1966,
    court: "Queen's Bench",
    keyPrinciple: "There is no general duty to assist the police with their enquiries. Refusing to answer police questions does not constitute obstructing an officer in the execution of their duty.",
    category: "Police & Liberty",
    url: null,
    tags: ["right to silence", "police questioning", "obstruction"],
  },
  {
    caseName: "Christie v Leachinsky",
    citation: "[1947] AC 573",
    year: 1947,
    court: "House of Lords",
    keyPrinciple: "A person being arrested must be informed of the true reason for their arrest at the time of arrest or as soon as practicable afterwards. Failure to do so renders the arrest unlawful.",
    category: "Police & Liberty",
    url: null,
    tags: ["arrest", "reason for arrest", "unlawful detention"],
  },
  {
    caseName: "Osman v Ferguson",
    citation: "[1993] 4 All ER 344",
    year: 1993,
    court: "Court of Appeal",
    keyPrinciple: "The police owe a general duty to the public but ordinarily do not owe a specific duty of care to individual members of the public. However, the state has positive obligations under Article 2 ECHR to protect life.",
    category: "Police & Liberty",
    url: null,
    tags: ["duty of care", "police liability", "article 2"],
  },

  // Negligence & Duty of Care
  {
    caseName: "Donoghue v Stevenson",
    citation: "[1932] UKHL 100",
    year: 1932,
    court: "House of Lords",
    keyPrinciple: "Established the modern law of negligence and the 'neighbour principle': you owe a duty of care to persons who are so closely and directly affected by your actions that you ought reasonably to have them in contemplation.",
    category: "Negligence & Duty",
    url: "https://www.bailii.org/uk/cases/UKHL/1932/100.html",
    tags: ["negligence", "duty of care", "neighbour principle", "foundational"],
  },
  {
    caseName: "Caparo Industries v Dickman",
    citation: "[1990] UKHL 2",
    year: 1990,
    court: "House of Lords",
    keyPrinciple: "Established the three-part test for duty of care: (1) harm must be foreseeable, (2) there must be a relationship of proximity, and (3) it must be fair, just, and reasonable to impose a duty.",
    category: "Negligence & Duty",
    url: "https://caselaw.nationalarchives.gov.uk/ukhl/1990/2",
    tags: ["duty of care", "three-part test", "foreseeability", "proximity"],
  },
  {
    caseName: "Bolam v Friern Hospital Management Committee",
    citation: "[1957] 1 WLR 582",
    year: 1957,
    court: "Queen's Bench",
    keyPrinciple: "A professional is not negligent if they act in accordance with a practice accepted as proper by a responsible body of professionals skilled in that particular area (the 'Bolam test').",
    category: "Negligence & Duty",
    url: null,
    tags: ["medical negligence", "professional standard", "bolam test"],
  },
  {
    caseName: "Hedley Byrne v Heller & Partners",
    citation: "[1964] AC 465",
    year: 1964,
    court: "House of Lords",
    keyPrinciple: "A duty of care can arise from negligent misstatements causing economic loss where there is a 'special relationship' between the parties — typically where one party relies on the other's professional expertise.",
    category: "Negligence & Duty",
    url: null,
    tags: ["negligent misstatement", "economic loss", "special relationship"],
  },

  // Human Rights & Public Law
  {
    caseName: "Ridge v Baldwin",
    citation: "[1964] UKHL 2",
    year: 1964,
    court: "House of Lords",
    keyPrinciple: "Revived the principles of natural justice in administrative law. A chief constable dismissed without a hearing had his dismissal declared void. Decision-makers must give affected persons the right to be heard.",
    category: "Human Rights & Public Law",
    url: "https://www.bailii.org/uk/cases/UKHL/1963/2.html",
    tags: ["natural justice", "fair hearing", "administrative law"],
  },
  {
    caseName: "Associated Provincial Picture Houses v Wednesbury Corporation",
    citation: "[1948] 1 KB 223",
    year: 1948,
    court: "Court of Appeal",
    keyPrinciple: "Established the 'Wednesbury unreasonableness' test: a decision can be challenged if it is so unreasonable that no reasonable authority could have come to it. The foundation of judicial review in English law.",
    category: "Human Rights & Public Law",
    url: null,
    tags: ["wednesbury", "unreasonableness", "judicial review", "public law"],
  },
  {
    caseName: "R (Daly) v Secretary of State for the Home Department",
    citation: "[2001] UKHL 26",
    year: 2001,
    court: "House of Lords",
    keyPrinciple: "Proportionality is a more structured and intensive review than Wednesbury unreasonableness when human rights are engaged. Courts must assess whether the interference is proportionate to the legitimate aim pursued.",
    category: "Human Rights & Public Law",
    url: "https://caselaw.nationalarchives.gov.uk/ukhl/2001/26",
    tags: ["proportionality", "human rights", "judicial review"],
  },
  {
    caseName: "Golder v United Kingdom",
    citation: "[1975] ECHR 1",
    year: 1975,
    court: "European Court of Human Rights",
    keyPrinciple: "Article 6 ECHR guarantees not just a fair trial but also the right of access to a court. A prisoner denied access to a solicitor to bring civil proceedings had his Article 6 rights violated.",
    category: "Human Rights & Public Law",
    url: "https://www.echr.coe.int/",
    tags: ["access to court", "article 6", "prisoner rights"],
  },
  {
    caseName: "R (UNISON) v Lord Chancellor",
    citation: "[2017] UKSC 51",
    year: 2017,
    court: "Supreme Court",
    keyPrinciple: "Employment tribunal fees were unlawful because they prevented access to justice. The right of access to courts is inherent in the rule of law and cannot be undermined by excessive fees.",
    category: "Human Rights & Public Law",
    url: "https://caselaw.nationalarchives.gov.uk/uksc/2017/51",
    tags: ["access to justice", "tribunal fees", "rule of law"],
  },

  // Employment
  {
    caseName: "Polkey v AE Dayton Services Ltd",
    citation: "[1988] AC 344",
    year: 1988,
    court: "House of Lords",
    keyPrinciple: "An employer must follow a fair procedure when dismissing an employee. Even if the employer would have dismissed anyway, failure to follow fair procedure makes the dismissal unfair.",
    category: "Employment",
    url: null,
    tags: ["unfair dismissal", "fair procedure", "employment rights"],
  },
  {
    caseName: "British Home Stores v Burchell",
    citation: "[1980] ICR 303",
    year: 1980,
    court: "Employment Appeal Tribunal",
    keyPrinciple: "For misconduct dismissals, the employer must show: (1) a genuine belief in the employee's guilt, (2) reasonable grounds for that belief, and (3) a reasonable investigation.",
    category: "Employment",
    url: null,
    tags: ["misconduct", "reasonable belief", "investigation", "dismissal"],
  },
  {
    caseName: "Western Excavating v Sharp",
    citation: "[1978] QB 761",
    year: 1978,
    court: "Court of Appeal",
    keyPrinciple: "For constructive dismissal, the employer must have committed a fundamental breach of contract. The employee must resign in response to that breach and not delay too long before resigning.",
    category: "Employment",
    url: null,
    tags: ["constructive dismissal", "breach of contract", "resignation"],
  },
  {
    caseName: "Malik v BCCI",
    citation: "[1998] AC 20",
    year: 1998,
    court: "House of Lords",
    keyPrinciple: "Every employment contract contains an implied term of mutual trust and confidence. An employer must not, without reasonable cause, conduct itself in a manner calculated to destroy or seriously damage the relationship of trust.",
    category: "Employment",
    url: null,
    tags: ["trust and confidence", "implied terms", "employer conduct"],
  },

  // Housing & Property
  {
    caseName: "Street v Mountford",
    citation: "[1985] AC 809",
    year: 1985,
    court: "House of Lords",
    keyPrinciple: "The key distinction between a tenancy and a licence is exclusive possession. If an occupier has exclusive possession for a term at a rent, they are a tenant regardless of what the agreement says.",
    category: "Housing & Property",
    url: null,
    tags: ["tenancy", "licence", "exclusive possession", "landlord"],
  },
  {
    caseName: "Southwark LBC v Mills",
    citation: "[2001] 1 AC 1",
    year: 2001,
    court: "House of Lords",
    keyPrinciple: "A landlord's obligation to repair does not extend to providing soundproofing or preventing noise from neighbouring properties. The covenant for quiet enjoyment protects against physical interference, not noise nuisance.",
    category: "Housing & Property",
    url: null,
    tags: ["quiet enjoyment", "noise", "landlord obligations", "council housing"],
  },
  {
    caseName: "Bruton v London & Quadrant Housing Trust",
    citation: "[2000] 1 AC 406",
    year: 2000,
    court: "House of Lords",
    keyPrinciple: "A tenancy can be created even by a person who does not own the property. What matters is exclusive possession, a term, and rent — the legal character of the arrangement, not the grantor's title.",
    category: "Housing & Property",
    url: null,
    tags: ["tenancy creation", "exclusive possession", "housing trust"],
  },

  // Consumer
  {
    caseName: "Carlill v Carbolic Smoke Ball Company",
    citation: "[1893] 1 QB 256",
    year: 1893,
    court: "Court of Appeal",
    keyPrinciple: "A unilateral offer made to the public can create a binding contract when someone performs the required conditions. Companies can be held to advertising promises. Foundation of consumer protection law.",
    category: "Consumer",
    url: null,
    tags: ["unilateral contract", "advertising", "consumer rights", "foundational"],
  },
  {
    caseName: "Director General of Fair Trading v First National Bank",
    citation: "[2001] UKHL 52",
    year: 2001,
    court: "House of Lords",
    keyPrinciple: "Courts can assess whether contract terms are unfair even if they relate to the adequacy of the price. The test is whether the term creates a significant imbalance in the parties' rights and obligations to the detriment of the consumer.",
    category: "Consumer",
    url: "https://caselaw.nationalarchives.gov.uk/ukhl/2001/52",
    tags: ["unfair terms", "consumer protection", "contract"],
  },
]

// ============================================================================
// NATURAL RIGHTS
// ============================================================================

export const naturalRightsResources: NaturalRightsEntry[] = [
  // Constitutional Documents
  {
    title: "Magna Carta (1215)",
    description: "The Great Charter established that the King is subject to the law, not above it. Key provisions include the right to a fair trial by peers (Clause 39), access to justice (Clause 40), and protection from unlawful imprisonment. Still partially in force today.",
    sourceUrl: "https://www.legislation.gov.uk/aep/Edw1cc1929/25/9",
    section: "Constitutional Documents",
    tags: ["foundational", "rule of law", "fair trial", "1215"],
  },
  {
    title: "Bill of Rights 1689",
    description: "Established parliamentary sovereignty, freedom of speech in Parliament, the right to petition the monarch without fear of prosecution, protection against cruel and unusual punishment, and the right to bear arms for defence.",
    sourceUrl: "https://www.legislation.gov.uk/aep/WilsandMar2/1/2",
    section: "Constitutional Documents",
    tags: ["parliament", "free speech", "petition", "constitutional"],
  },
  {
    title: "Habeas Corpus Act 1679",
    description: "Strengthened the ancient writ of habeas corpus — the right to challenge unlawful detention in court. Requires anyone detaining a person to bring them before a court to justify the detention. A cornerstone of personal liberty.",
    sourceUrl: "https://www.legislation.gov.uk/aep/Cha2/31/2",
    section: "Constitutional Documents",
    tags: ["detention", "liberty", "court", "fundamental"],
  },
  {
    title: "Universal Declaration of Human Rights (1948)",
    description: "Adopted by the United Nations General Assembly, this declaration sets out fundamental human rights to be universally protected. 30 articles covering civil, political, economic, social, and cultural rights. Not directly enforceable but morally authoritative.",
    sourceUrl: "https://www.un.org/en/about-us/universal-declaration-of-human-rights",
    section: "Constitutional Documents",
    tags: ["UN", "universal rights", "international", "1948"],
  },
  {
    title: "European Convention on Human Rights (1950)",
    description: "An international treaty protecting human rights and fundamental freedoms in Europe. Incorporated into UK law by the Human Rights Act 1998. Enforceable in UK courts and, ultimately, the European Court of Human Rights in Strasbourg.",
    sourceUrl: "https://www.echr.coe.int/european-convention-on-human-rights",
    section: "Constitutional Documents",
    tags: ["ECHR", "human rights", "enforceable", "Strasbourg"],
  },

  // ECHR Rights
  {
    title: "Article 2 — Right to Life",
    description: "Everyone's right to life shall be protected by law. The state has a positive duty to protect life and must investigate deaths where state agents are involved. This is an absolute right with very limited exceptions.",
    sourceUrl: "https://www.echr.coe.int/european-convention-on-human-rights",
    section: "ECHR Rights",
    tags: ["article 2", "absolute right", "state duty", "investigation"],
  },
  {
    title: "Article 3 — Prohibition of Torture",
    description: "No one shall be subjected to torture or to inhuman or degrading treatment or punishment. This is an absolute right — there are no exceptions, even in times of war or public emergency.",
    sourceUrl: "https://www.echr.coe.int/european-convention-on-human-rights",
    section: "ECHR Rights",
    tags: ["article 3", "absolute right", "torture", "degrading treatment"],
  },
  {
    title: "Article 5 — Right to Liberty and Security",
    description: "Everyone has the right to liberty. No one shall be deprived of their liberty except in specific cases provided by law (e.g., after conviction, lawful arrest). Anyone detained must be told the reason and brought promptly before a judge.",
    sourceUrl: "https://www.echr.coe.int/european-convention-on-human-rights",
    section: "ECHR Rights",
    tags: ["article 5", "liberty", "detention", "arrest"],
  },
  {
    title: "Article 6 — Right to a Fair Trial",
    description: "Everyone is entitled to a fair and public hearing within a reasonable time by an independent and impartial tribunal. Includes the presumption of innocence, the right to legal representation, and the right to examine witnesses.",
    sourceUrl: "https://www.echr.coe.int/european-convention-on-human-rights",
    section: "ECHR Rights",
    tags: ["article 6", "fair trial", "independent court", "presumption of innocence"],
  },
  {
    title: "Article 8 — Right to Respect for Private and Family Life",
    description: "Everyone has the right to respect for their private and family life, their home, and their correspondence. Public authorities cannot interfere except where necessary and proportionate for specified purposes.",
    sourceUrl: "https://www.echr.coe.int/european-convention-on-human-rights",
    section: "ECHR Rights",
    tags: ["article 8", "privacy", "family", "home", "surveillance"],
  },
  {
    title: "Article 10 — Freedom of Expression",
    description: "Everyone has the right to freedom of expression, including the freedom to hold opinions and to receive and impart information. Can be restricted only where necessary in a democratic society for specified purposes.",
    sourceUrl: "https://www.echr.coe.int/european-convention-on-human-rights",
    section: "ECHR Rights",
    tags: ["article 10", "free speech", "media", "information"],
  },
  {
    title: "Article 11 — Freedom of Assembly and Association",
    description: "Everyone has the right to peaceful assembly and freedom of association, including the right to form and join trade unions. Restrictions must be prescribed by law and necessary in a democratic society.",
    sourceUrl: "https://www.echr.coe.int/european-convention-on-human-rights",
    section: "ECHR Rights",
    tags: ["article 11", "assembly", "protest", "trade unions"],
  },
  {
    title: "Article 14 — Prohibition of Discrimination",
    description: "The enjoyment of Convention rights shall be secured without discrimination on any ground such as sex, race, colour, language, religion, political opinion, national origin, property, birth, or other status.",
    sourceUrl: "https://www.echr.coe.int/european-convention-on-human-rights",
    section: "ECHR Rights",
    tags: ["article 14", "discrimination", "equality", "non-discrimination"],
  },

  // Common Law Rights
  {
    title: "Right to Silence",
    description: "You have the right not to answer questions from the police or in court. While adverse inferences may be drawn under certain circumstances, the right itself is fundamental and predates statute.",
    sourceUrl: null,
    section: "Common Law Rights",
    tags: ["police", "interview", "self-incrimination", "ancient right"],
  },
  {
    title: "Right to Self-Defence",
    description: "You have the right to use reasonable force to defend yourself, another person, or your property from an unlawful attack. The force must be proportionate to the threat.",
    sourceUrl: null,
    section: "Common Law Rights",
    tags: ["reasonable force", "proportionate", "defence", "property"],
  },
  {
    title: "Right to Trial by Jury",
    description: "For serious criminal offences, you have the right to be tried by a jury of 12 ordinary citizens. The jury decides the facts and delivers the verdict. This right dates back to Magna Carta.",
    sourceUrl: null,
    section: "Common Law Rights",
    tags: ["jury", "criminal trial", "magna carta", "peers"],
  },
  {
    title: "Right to Travel Freely",
    description: "At common law, every person has the right to travel freely on the King's highway. This right predates statute and can only be restricted by lawful authority.",
    sourceUrl: null,
    section: "Common Law Rights",
    tags: ["freedom of movement", "highway", "travel", "ancient right"],
  },
  {
    title: "Right to Peaceful Enjoyment of Property",
    description: "You have the right to enjoy your property without unlawful interference by the state or others. Protected under common law and reinforced by Protocol 1, Article 1 of the ECHR.",
    sourceUrl: null,
    section: "Common Law Rights",
    tags: ["property", "protocol 1", "state interference", "possession"],
  },

  // Natural Justice Principles
  {
    title: "Audi Alteram Partem — Hear the Other Side",
    description: "No person should be judged or punished without being given the opportunity to present their case and respond to the evidence against them. This applies to courts, tribunals, disciplinary hearings, and any decision-making body.",
    sourceUrl: null,
    section: "Natural Justice",
    tags: ["fair hearing", "right to be heard", "due process"],
  },
  {
    title: "Nemo Judex in Causa Sua — No One Should Be a Judge in Their Own Cause",
    description: "A decision-maker must not have a personal interest in the outcome of the case. Even the appearance of bias is sufficient to invalidate a decision. This ensures impartiality in all proceedings.",
    sourceUrl: null,
    section: "Natural Justice",
    tags: ["bias", "impartiality", "conflict of interest", "fairness"],
  },
  {
    title: "Legitimate Expectation",
    description: "If a public authority makes a clear and unambiguous promise or follows a settled practice, individuals who rely on that promise or practice may have a legitimate expectation that it will be followed. Breaking this expectation without good reason may be unlawful.",
    sourceUrl: null,
    section: "Natural Justice",
    tags: ["public authority", "promise", "reliance", "administrative law"],
  },
]

// ============================================================================
// PARKING FINES
// ============================================================================

export const parkingFinesResources: ParkingFinesEntry[] = [
  // Your Rights
  {
    title: "Your Right to Contest Any Parking Charge",
    description: "You always have the right to contest a parking charge, whether issued by a council (PCN) or a private company. You should never ignore a charge — engaging with the appeals process protects your rights and can result in the charge being cancelled.",
    section: "Your Rights",
    sourceUrl: null,
    tags: ["right to appeal", "PCN", "private parking"],
    actionType: "guide",
  },
  {
    title: "28-Day Appeal Window for Council PCNs",
    description: "You have 28 days from the date of issue to pay a council Penalty Charge Notice at a 50% discount, or to make a formal representation (appeal). If you appeal within 28 days and the appeal is rejected, you get another 28 days at the discounted rate.",
    section: "Your Rights",
    sourceUrl: null,
    tags: ["PCN", "28 days", "discount", "council"],
    actionType: "guide",
  },
  {
    title: "POFA 2012 Keeper Liability",
    description: "Under the Protection of Freedoms Act 2012 Schedule 4, private parking companies can hold the registered keeper liable for unpaid charges — but ONLY if they follow strict procedures. If they fail to send the correct notices within the required timeframes, they lose the right to pursue the keeper.",
    section: "Your Rights",
    sourceUrl: "https://www.legislation.gov.uk/ukpga/2012/9/schedule/4",
    tags: ["keeper liability", "POFA", "private parking", "notice requirements"],
    actionType: "legislation",
  },

  // Relevant Legislation
  {
    title: "Protection of Freedoms Act 2012 (Schedule 4)",
    description: "Governs how private parking companies can operate. Sets out keeper liability rules, notice requirements, and the appeals framework. Companies must be members of an approved trade association (BPA or IPC) and must follow their code of practice.",
    section: "Legislation",
    sourceUrl: "https://www.legislation.gov.uk/ukpga/2012/9/schedule/4",
    tags: ["POFA", "private parking", "keeper liability"],
    actionType: "legislation",
  },
  {
    title: "Traffic Management Act 2004 (Part 6)",
    description: "Governs civil enforcement of parking by local authorities. Covers penalty charge notices (PCNs), the appeals process through the Traffic Penalty Tribunal, and enforcement agent (bailiff) involvement.",
    section: "Legislation",
    sourceUrl: "https://www.legislation.gov.uk/ukpga/2004/18/part/6",
    tags: ["council PCN", "civil enforcement", "traffic penalty tribunal"],
    actionType: "legislation",
  },
  {
    title: "Consumer Rights Act 2015 — Unfair Terms",
    description: "Private parking charges must be a genuine pre-estimate of loss, not a penalty. Excessive charges (e.g., £100+ for a minor overstay) may be unenforceable as unfair contract terms under consumer protection law.",
    section: "Legislation",
    sourceUrl: "https://www.legislation.gov.uk/ukpga/2015/15",
    tags: ["unfair terms", "excessive charges", "penalty clause"],
    actionType: "legislation",
  },
  {
    title: "Road Traffic Regulation Act 1984",
    description: "Gives local authorities the power to create Traffic Regulation Orders (TROs) for parking restrictions. If a TRO is not properly made, signed, or published, any PCN issued under it may be invalid.",
    section: "Legislation",
    sourceUrl: "https://www.legislation.gov.uk/ukpga/1984/27",
    tags: ["TRO", "parking restrictions", "council", "signage"],
    actionType: "legislation",
  },

  // How to Contest
  {
    title: "How to Appeal a Private Parking Charge",
    description: "Step 1: Don't ignore it. Step 2: Check if the company is a member of BPA (appeal to POPLA) or IPC (appeal to IAS). Step 3: Write to the company with your grounds for appeal. Step 4: If rejected, escalate to POPLA/IAS — their decision is final and binding on the company. Common grounds: unclear signage, no contract formed, charge is a penalty not a genuine pre-estimate of loss, keeper liability notice not served correctly.",
    section: "How to Contest",
    sourceUrl: "https://www.popla.co.uk/",
    tags: ["appeal process", "POPLA", "IAS", "private parking"],
    actionType: "guide",
  },
  {
    title: "How to Appeal a Council PCN",
    description: "Step 1: Make an informal challenge within 14 days (in person or writing). Step 2: If rejected, make a formal representation within 28 days. Step 3: If formal representation is rejected, appeal to the Traffic Penalty Tribunal within 28 days — this is an independent tribunal and its decision is binding on the council. Common grounds: unclear signage, faulty meter, loading/unloading, blue badge holder, mitigating circumstances.",
    section: "How to Contest",
    sourceUrl: "https://www.trafficpenaltytribunal.gov.uk/",
    tags: ["PCN appeal", "council", "Traffic Penalty Tribunal"],
    actionType: "guide",
  },
  {
    title: "What to Do If a Bailiff Contacts You About a Parking Fine",
    description: "Bailiffs can only be involved AFTER a council PCN has been registered as a debt at the Traffic Enforcement Centre and a warrant issued. For private parking, bailiffs CANNOT be used — the company must take you to court (County Court small claims). If a private company threatens bailiffs, this is likely unlawful intimidation. Check your rights under the Taking Control of Goods Regulations 2013.",
    section: "How to Contest",
    sourceUrl: null,
    tags: ["bailiffs", "enforcement", "debt", "rights"],
    actionType: "guide",
  },

  // Illegal Practices
  {
    title: "Unclear or Hidden Signage",
    description: "For a private parking charge to be enforceable, there must be clear, prominent signage at the entrance to the car park. The signs must state: the terms and conditions, the charge amount, the time limits, and how to pay. If signage is missing, obscured, or unclear, the charge may be unenforceable.",
    section: "Illegal Practices",
    sourceUrl: null,
    tags: ["signage", "private parking", "unenforceable"],
    actionType: "awareness",
  },
  {
    title: "Excessive Charges (Penalties in Disguise)",
    description: "Private parking charges must be a genuine pre-estimate of the loss suffered by the landowner. The Supreme Court ruled in ParkingEye v Beavis [2015] that £85 was not a penalty, but charges significantly above this may be challenged. Charges of £150-£200+ for minor overstays are increasingly being challenged successfully.",
    section: "Illegal Practices",
    sourceUrl: null,
    tags: ["excessive charge", "penalty", "ParkingEye v Beavis"],
    actionType: "awareness",
  },
  {
    title: "Intimidating Debt Collection Letters",
    description: "Many private parking companies use aggressive debt collection letters designed to frighten people into paying. These letters may mimic court documents, threaten county court action, or claim bailiffs will attend. Most are empty threats — check if the company has actually filed a claim at court before responding.",
    section: "Illegal Practices",
    sourceUrl: null,
    tags: ["debt collection", "intimidation", "empty threats", "harassment"],
    actionType: "awareness",
  },
  {
    title: "Fake Court Headers and Legal Threats",
    description: "Some parking companies send letters with designs that look like official court documents. This is misleading and potentially fraudulent. Real court claims come from the County Court, not from the parking company. If you receive a genuine court claim (Form N1), you MUST respond within 14 days.",
    section: "Illegal Practices",
    sourceUrl: null,
    tags: ["fake court documents", "fraud", "County Court claim"],
    actionType: "awareness",
  },
  {
    title: "Charging for Grace Periods",
    description: "Many car parks are required to offer a grace period (typically 10 minutes) before charging for overstaying. The BPA Code of Practice requires this. If a company charges you for being a few minutes over your time, this may breach the code of practice and the charge can be appealed.",
    section: "Illegal Practices",
    sourceUrl: null,
    tags: ["grace period", "BPA code", "overstay", "unfair"],
    actionType: "awareness",
  },

  // Useful Links
  {
    title: "POPLA — Parking on Private Land Appeals",
    description: "The independent appeals service for private parking charges issued by BPA (British Parking Association) member companies. Free to use for motorists. Their decisions are binding on the parking company but not on you.",
    section: "Useful Links",
    sourceUrl: "https://www.popla.co.uk/",
    tags: ["appeals", "BPA", "free service"],
    actionType: "link",
  },
  {
    title: "Traffic Penalty Tribunal",
    description: "The independent tribunal for appealing council-issued Penalty Charge Notices in England and Wales. Free to use. You can appeal online, by phone, or in person. Their decision is final.",
    section: "Useful Links",
    sourceUrl: "https://www.trafficpenaltytribunal.gov.uk/",
    tags: ["council PCN", "tribunal", "free", "appeal"],
    actionType: "link",
  },
]

// ============================================================================
// EDUCATIONAL
// ============================================================================

export const educationalResources: EducationalEntry[] = [
  // Home Schooling
  {
    title: "Your Right to Home Educate — Education Act 1996, Section 7",
    description: "Parents have a legal duty to ensure their child receives a suitable full-time education — but this does NOT have to be at school. Section 7 of the Education Act 1996 makes clear that education can be provided 'otherwise than at school'. You do not need the council's permission.",
    section: "Home Schooling",
    sourceUrl: "https://www.legislation.gov.uk/ukpga/1996/56/section/7",
    tags: ["education act", "section 7", "parent's right", "home education"],
  },
  {
    title: "How to De-Register Your Child from School",
    description: "To withdraw your child from a state school, write to the headteacher stating that you are electing to home educate. The school must remove your child from the register. You do NOT need the school's agreement. For special schools or children with an EHC plan, consent from the local authority may be needed.",
    section: "Home Schooling",
    sourceUrl: "https://www.gov.uk/home-education",
    tags: ["de-registration", "withdrawal", "school", "headteacher"],
  },
  {
    title: "Dealing with the Local Authority",
    description: "The local authority can make 'informal enquiries' to satisfy themselves that your child is receiving suitable education. However, there is NO legal requirement to register with the council, follow the national curriculum, keep set hours, take tests, or allow home visits. The burden of proof initially rests with the local authority if they believe education is unsuitable.",
    section: "Home Schooling",
    sourceUrl: "https://www.gov.uk/government/publications/elective-home-education",
    tags: ["local authority", "informal enquiries", "no registration", "rights"],
  },
  {
    title: "Elective Home Education Guidelines",
    description: "The Department for Education publishes guidelines for local authorities on elective home education. These guidelines are advisory, not mandatory. They clarify that parents are not required to: replicate school at home, follow the national curriculum, have formal lessons, or have teaching qualifications.",
    section: "Home Schooling",
    sourceUrl: "https://www.gov.uk/government/publications/elective-home-education",
    tags: ["DfE guidelines", "advisory", "curriculum", "flexibility"],
  },

  // Self-Representation
  {
    title: "Being a Litigant in Person — Your Right to Self-Represent",
    description: "You have an absolute right to represent yourself in any court or tribunal in England and Wales. Courts are required to treat litigants in person fairly and make reasonable adjustments. Judges should explain procedures and ensure you understand what is happening.",
    section: "Self-Representation",
    sourceUrl: "https://www.gov.uk/represent-yourself-in-court",
    tags: ["litigant in person", "self-representation", "court", "right"],
  },
  {
    title: "McKenzie Friends — What They Are and Your Rights",
    description: "A McKenzie Friend is a person who assists you in court by taking notes, quietly making suggestions, and helping organise documents. They are NOT a lawyer. You have a right to reasonable assistance from a McKenzie Friend, though the judge can refuse in exceptional circumstances.",
    section: "Self-Representation",
    sourceUrl: null,
    tags: ["mckenzie friend", "court assistance", "lay person", "notes"],
  },
  {
    title: "Court Etiquette and Procedures",
    description: "When representing yourself: arrive early, dress smartly, address the judge as 'Sir/Madam' or 'Your Honour', stand when speaking, do not interrupt. Bring multiple copies of all documents. Be concise and stick to the facts. The court is there to establish the truth, not to intimidate you.",
    section: "Self-Representation",
    sourceUrl: null,
    tags: ["court behaviour", "dress code", "addressing judge", "documents"],
  },
  {
    title: "Legal Aid — Check If You Qualify",
    description: "Legal aid provides free legal advice and representation for those who cannot afford it. Eligibility depends on your income, savings, the type of case, and its merits. Criminal legal aid (duty solicitor at police stations and magistrates' courts) is available to everyone regardless of means.",
    section: "Self-Representation",
    sourceUrl: "https://www.gov.uk/check-legal-aid",
    tags: ["legal aid", "means test", "free advice", "eligibility"],
  },

  // Court Procedures
  {
    title: "Small Claims Court — Claims Up to £10,000",
    description: "The small claims track is designed for straightforward disputes up to £10,000. The procedure is simplified: limited costs exposure, no formal rules of evidence, informal hearing, and judges actively help both sides. You can represent yourself without risk of paying the other side's legal costs if you lose.",
    section: "Court Procedures",
    sourceUrl: "https://www.gov.uk/make-court-claim-for-money",
    tags: ["small claims", "£10,000", "county court", "self-representation"],
  },
  {
    title: "How to File a County Court Claim (Money Claims Online)",
    description: "You can start a county court claim online using Money Claims Online (MCOL) for claims up to £100,000. You'll need the defendant's name and address, details of your claim, and the amount owed. Court fees apply (starting at £35 for claims up to £300). You can add the court fee to your claim.",
    section: "Court Procedures",
    sourceUrl: "https://www.gov.uk/make-court-claim-for-money/court-fees",
    tags: ["MCOL", "filing claim", "court fees", "online"],
  },
  {
    title: "Magistrates' Court — Criminal Proceedings",
    description: "Magistrates' courts handle less serious criminal cases (summary offences), bail hearings, and the first hearings of more serious cases before they are sent to the Crown Court. Cases are heard by either a panel of magistrates or a district judge.",
    section: "Court Procedures",
    sourceUrl: "https://www.gov.uk/courts",
    tags: ["magistrates", "criminal", "summary offence", "bail"],
  },
  {
    title: "Understanding Court Orders and Judgments",
    description: "A court order is a legally binding direction from the court. Failure to comply can result in contempt of court. A judgment is the court's decision on the case. If money is owed, the court can enforce payment through various methods including attachment of earnings, charging orders, and enforcement agents.",
    section: "Court Procedures",
    sourceUrl: null,
    tags: ["court order", "judgment", "enforcement", "contempt"],
  },

  // Legal Terminology
  {
    title: "CivicShield Legal Dictionary — 100+ UK Legal Terms",
    description: "Our comprehensive legal dictionary contains over 100 UK legal terms with plain-language definitions, links to relevant legislation and case law, and cross-references to related terms. From 'Habeas Corpus' to 'Subject Access Request' — understand the law in your own language.",
    section: "Legal Terminology",
    sourceUrl: null,
    tags: ["dictionary", "definitions", "plain language", "100+ terms"],
  },
  {
    title: "Understanding Legal Latin — Key Terms You'll Encounter",
    description: "Legal proceedings often use Latin terms. Key ones to know: habeas corpus (produce the body), ultra vires (beyond the powers), audi alteram partem (hear the other side), nemo judex in causa sua (no one should be judge in their own case), res judicata (a matter already decided).",
    section: "Legal Terminology",
    sourceUrl: null,
    tags: ["latin", "legal terms", "habeas corpus", "ultra vires"],
  },
]

// ============================================================================
// LIVING MAN'S RIGHTS DECLARATION
// ============================================================================

export const livingMansDeclaration = `DECLARATION OF RIGHTS AND STANDING

I, [FULL NAME], a living man/woman of lawful age, do hereby declare and affirm the following:

1. IDENTITY AND STANDING
I am a living, breathing man/woman, endowed with inherent and unalienable rights that exist independently of any statutory creation. I am not a legal fiction, corporation, or statutory entity.

2. NATURAL RIGHTS
I assert my natural rights as recognised under:
- Magna Carta (1215), Clauses 39 and 40
- The Bill of Rights (1689)
- The Habeas Corpus Act (1679)
- The Universal Declaration of Human Rights (1948), Articles 1-30
- The European Convention on Human Rights, Articles 2-14

3. RIGHT TO TRAVEL
I assert my right to travel freely upon the public highway without hindrance or restriction, a right that predates statute and is recognised at common law.

4. RIGHT TO PRIVACY
I assert my right to privacy of person, home, property, and correspondence, as protected under Article 8 of the European Convention on Human Rights and the common law.

5. RIGHT TO PROPERTY
I assert my right to peaceful enjoyment of my property, free from unlawful interference by any party, as protected under Protocol 1, Article 1 of the ECHR.

6. RIGHT TO FAIR TREATMENT
I assert my right to equal treatment under the law, to a fair hearing, and to natural justice in all dealings with public authorities and private entities.

7. RIGHT TO SELF-DETERMINATION
I assert my right to make decisions about my own body, health, education of my children, and manner of living, provided such decisions do not infringe upon the equal rights of others.

8. DISCLAIMER
This declaration is an assertion of existing rights, not a claim to be above or outside the law. I recognise and respect the rule of law and the legitimate authority of the courts.

Signed: _______________________
Date: _________________________
Witnessed by: __________________

NOTICE: This document is provided as a template for personal use. It is not legal advice. CivicShield is a legal process assistant, not a legal advisor.`
