// Issue categories and their specific sub-types
export const ISSUE_CATEGORIES = {
  "Public Sector & Government": [
    "Police Conduct",
    "Local Council",
    "School Board",
    "Bailiff / Enforcement",
    "Solicitor",
  ],
  "Business & Commerce": [
    "Utility Companies (Gas, Water, Electricity)",
    "Telecom Providers (Broadband / Mobile)",
    "Banks & Financial Institutions",
    "Insurance Companies",
    "Delivery & Logistics Companies",
    "Suppliers / Contractors",
    "Clients / Non-Payment Disputes",
    "Private Companies / Corporations",
  ],
  "Employment & Workplace": [
    "Employers (Grievances, Unfair Dismissal)",
    "Employment Agencies",
    "Trade Unions",
  ],
  "Legal & Justice": [
    "Probation Services",
    "Prisons",
    "Barristers / Legal Firms",
    "Professional Bodies (SRA, GMC, RICS, ICO, FCA, etc.)",
  ],
  "Personal / Individual": [
    "Neighbour Disputes",
    "Harassment / Personal Complaints",
    "Other Individual",
  ],
  "Motoring & Vehicle Issues": [
    "Vehicle Safety Defects & Recalls",
    "Dealer Sale Issues",
    "Warranty & Goodwill Disputes",
    "Poor Repairs / Repeat Failures",
    "Motor Finance Disputes",
    "Insurance Claim Issues",
    "MOT & Garage Complaints",
    "Faulty Parts / Component Failures",
    "DVLA / Registration Issues",
    "Enforcement / Seizure Issues",
  ],
} as const

export type IssueCategory = keyof typeof ISSUE_CATEGORIES

export const USER_ROLES = [
  {
    value: "complainant",
    label: "Complainant",
    description: "You are raising the issue/filing the complaint",
  },
  {
    value: "respondent",
    label: "Respondent",
    description: "You are responding to allegations or claims",
  },
] as const

export const ISSUE_STATUSES = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  in_progress: { label: "In Progress", color: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  complaint_sent: { label: "Complaint Sent", color: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  under_review: { label: "Under Review", color: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  resolved: { label: "Resolved", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  escalated: { label: "Escalated", color: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
} as const

export const COMPLAINT_STATUSES = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-700" },
  sent: { label: "Sent", color: "bg-emerald-50 text-emerald-700" },
  opened: { label: "Opened", color: "bg-blue-50 text-blue-700" },
  responded: { label: "Responded", color: "bg-purple-50 text-purple-700" },
} as const

export const RESOURCE_CATEGORIES = [
  { value: "legislation", label: "Legislation", icon: "Scale" },
  { value: "case_law", label: "Case Law", icon: "Gavel" },
  { value: "natural_rights", label: "Natural Rights", icon: "Shield" },
  { value: "parking_fines", label: "Parking Fines", icon: "Car" },
  { value: "educational", label: "Educational", icon: "BookOpen" },
] as const

export const NAV_ITEMS = [
  { label: "Home", href: "/", icon: "Home" },
  { label: "My Issues", href: "/issues", icon: "ListChecks" },
  { label: "Resources", href: "/resources", icon: "BookOpen", badge: "New" },
  { label: "New", href: "/issues/new", icon: "Plus" },
  { label: "Complaints", href: "/complaints", icon: "FileText" },
  { label: "Motoring", href: "/motoring", icon: "Car" },
] as const

export const MORE_MENU_ITEMS = [
  { label: "Legal Dictionary", href: "/dictionary", icon: "BookA", badge: "New" },
  { label: "Trending Petitions", href: "/petitions", icon: "TrendingUp", badge: "Popular" },
  { label: "Rights Explorer", href: "/rights", icon: "Search" },
  { label: "Case Law Library", href: "/case-law", icon: "Star" },
  { label: "Help & Support", href: "/help", icon: "HelpCircle" },
] as const
