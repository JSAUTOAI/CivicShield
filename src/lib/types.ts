// Shared TypeScript interfaces for API responses
// These mirror Prisma models but represent the shape of data returned by API routes

export interface IssueListItem {
  id: number
  issueCategory: string
  issueType: string
  description: string
  organization: string
  individual: string | null
  dateOfIncident: string
  timeOfIncident: string | null
  location: string
  status: string
  isAnonymous: boolean
  hasComplaint: boolean
  complaintSent: boolean
  userRole: string
  createdAt: string
  complaints: { id: number; status: string; sentAt: string | null }[]
  legalAnalysis: { id: number }[]
  _count: { evidenceItems: number }
}

export interface LegalAnalysisData {
  id: number
  issueId: number
  relevantLaws: Array<{
    title: string
    section: string
    description: string
    relevance: string
  }>
  rightViolations: Array<{
    right: string
    severity: string
    description: string
    legislation: string
  }>
  recommendedActions: Array<{
    action: string
    priority: string
    description: string
    deadline?: string
  }>
  precedents: Array<{
    caseName: string
    reference: string
    court: string
    relevance: string
    outcome: string
  }>
  createdAt: string
}

export interface ComplaintData {
  id: number
  issueId: number
  complaintText: string
  complaintFormat: string
  recipientName: string | null
  recipientEmail: string | null
  recipientAddress: string | null
  recipientOrg: string | null
  ccRecipients: Array<{ name: string; organization: string; role: string }>
  userCcEmail: string | null
  status: string
  sentAt: string | null
  sentVia: string | null
  openedAt: string | null
  respondedAt: string | null
  responseText: string | null
  createdAt: string
  updatedAt: string
}

export interface IssueDetail {
  id: number
  userId: number | null
  issueCategory: string
  issueType: string
  description: string
  organization: string
  individual: string | null
  dateOfIncident: string
  timeOfIncident: string | null
  location: string
  status: string
  evidence: unknown[]
  isAnonymous: boolean
  hasComplaint: boolean
  complaintSent: boolean
  userRole: string
  createdAt: string
  complaints: ComplaintData[]
  legalAnalysis: LegalAnalysisData[]
  evidenceItems: Array<{
    id: number
    evidenceType: string
    fileName: string | null
    fileUrl: string | null
    description: string | null
    uploadedAt: string
  }>
  issueChangeHistory: Array<{
    id: number
    fieldName: string
    oldValue: string | null
    newValue: string | null
    changedAt: string
    changeType: string
  }>
}

export interface ComplaintWithIssue extends ComplaintData {
  issue: {
    id: number
    issueType: string
    issueCategory: string
    organization: string
    description: string
    status: string
  }
}

export interface ResourceData {
  id: number
  title: string
  description: string | null
  content: string | null
  category: string
  subcategory: string | null
  resourceType: string
  tags: string[]
  iconName: string | null
  url: string | null
  isFeatured: boolean
  sortOrder: number
}

export interface DashboardStats {
  totalIssues: number
  activeComplaints: number
  sentComplaints: number
  resolvedIssues: number
}

// Legal Dictionary
export interface DictionaryTermData {
  id: number
  term: string
  slug: string
  definition: string
  legalDefinition: string | null
  category: string
  jurisdiction: string
  source: string | null
  relatedActNames: string[]
  relatedCaseNames: string[]
  seeAlso: string[]
  tags: string[]
  usageExample: string | null
  isFeatured: boolean
}

export interface DictionaryTermDetail extends DictionaryTermData {
  relatedLegislation: Array<{ actName: string; url: string | null }>
  relatedCases: Array<{ caseName: string; url: string | null }>
  relatedTerms: Array<{ term: string; slug: string; definition: string }>
}

export interface DictionaryListResponse {
  terms: DictionaryTermData[]
  total: number
  page: number
  totalPages: number
  letterCounts: Record<string, number>
}
