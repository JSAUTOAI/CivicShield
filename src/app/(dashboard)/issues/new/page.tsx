"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, type SelectOption } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ISSUE_CATEGORIES, USER_ROLES, type IssueCategory } from "@/lib/constants"
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  FileImage,
  FileVideo,
  FileText,
  Users,
  Search,
  CheckCircle,
  Info,
  X,
} from "lucide-react"

const steps = ["Details", "Evidence", "Review", "Analysis"]

const categoryOptions: SelectOption[] = Object.keys(ISSUE_CATEGORIES).map((cat) => ({
  value: cat,
  label: cat,
}))

const roleOptions: SelectOption[] = USER_ROLES.map((r) => ({
  value: r.value,
  label: r.label,
  description: r.description,
}))

export default function NewIssuePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(0)
  const [submitting, setSubmitting] = React.useState(false)
  const [formData, setFormData] = React.useState({
    category: "",
    role: "complainant",
    issueType: "",
    description: "",
    organization: "",
    individual: "",
    dateOfIncident: "",
    timeOfIncident: "",
    location: "",
    isAnonymous: false,
  })
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([])
  const [isDragOver, setIsDragOver] = React.useState(false)

  const issueTypeOptions: SelectOption[] = formData.category
    ? (ISSUE_CATEGORIES[formData.category as IssueCategory] || []).map((t) => ({
        value: t,
        label: t,
      }))
    : []

  const progressValue = ((currentStep + 1) / steps.length) * 100

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    setUploadedFiles((prev) => [...prev, ...files])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center animate-fade-in">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Log a New Issue</h1>
      </div>

      {/* Progress */}
      <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.05s" }}>
        <Progress value={progressValue} />
        <div className="mt-3 flex justify-between">
          {steps.map((step, i) => (
            <button
              key={step}
              onClick={() => i <= currentStep && setCurrentStep(i)}
              className={cn(
                "text-sm font-medium transition-colors",
                i === currentStep
                  ? "text-brand-600 dark:text-brand-400"
                  : i < currentStep
                  ? "text-foreground cursor-pointer hover:text-brand-600"
                  : "text-muted-foreground cursor-default"
              )}
            >
              {step}
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <CardContent className="p-8">
          {/* STEP 1: Details */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Issue Details</h2>

              <Select
                label="Issue Category"
                options={categoryOptions}
                value={formData.category}
                onChange={(val) =>
                  setFormData({ ...formData, category: val, issueType: "" })
                }
                placeholder="Select an issue category"
              />

              <Select
                label="Your Role in This Issue"
                options={roleOptions}
                value={formData.role}
                onChange={(val) => setFormData({ ...formData, role: val })}
                placeholder="Select your role"
              />

              {formData.category && (
                <p className="text-xs text-brand-600 dark:text-brand-400">
                  This helps us provide targeted legal guidance based on your position in the matter.
                </p>
              )}

              {issueTypeOptions.length > 0 && (
                <Select
                  label="Specific Issue Type"
                  options={issueTypeOptions}
                  value={formData.issueType}
                  onChange={(val) => setFormData({ ...formData, issueType: val })}
                  placeholder="Select a specific issue type"
                />
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  What happened?
                </label>
                <Textarea
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="min-h-[140px]"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Be specific and include relevant details.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    Organization Involved
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="E.g., Greenfield Council, Thames Valley Police"
                      value={formData.organization}
                      onChange={(e) =>
                        setFormData({ ...formData, organization: e.target.value })
                      }
                      className="flex-1"
                    />
                    <Button variant="outline" size="default" className="gap-1.5 whitespace-nowrap">
                      <Search className="h-4 w-4" />
                      Find details
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    Individual (if applicable)
                  </label>
                  <Input
                    placeholder="Name or ID number if known"
                    value={formData.individual}
                    onChange={(e) =>
                      setFormData({ ...formData, individual: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    Date of Incident
                  </label>
                  <Input
                    type="date"
                    value={formData.dateOfIncident}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfIncident: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    Time (if known)
                  </label>
                  <Input
                    type="time"
                    value={formData.timeOfIncident}
                    onChange={(e) =>
                      setFormData({ ...formData, timeOfIncident: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Location
                </label>
                <Input
                  placeholder="Address or description of location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* STEP 2: Evidence */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Upload Evidence</h2>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all duration-200",
                  isDragOver
                    ? "border-brand-400 bg-brand-50/50 dark:border-brand-600 dark:bg-brand-900/10"
                    : "border-border hover:border-brand-300 dark:hover:border-brand-700"
                )}
              >
                <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="mb-1 text-sm font-medium text-foreground">
                  Drag files here or click to upload
                </p>
                <p className="mb-4 text-xs text-muted-foreground">
                  Support for images, documents, video, and audio files
                </p>
                <label>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                  />
                  <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-brand-600 hover:to-brand-700 hover:shadow-md cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Select Files
                  </span>
                </label>
              </div>

              {/* Uploaded files list */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadedFiles.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        {file.type.startsWith("image/") ? (
                          <FileImage className="h-5 w-5 text-blue-500" />
                        ) : file.type.startsWith("video/") ? (
                          <FileVideo className="h-5 w-5 text-purple-500" />
                        ) : (
                          <FileText className="h-5 w-5 text-amber-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(i)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <Card className="border-brand-100 bg-brand-50/30 dark:border-brand-900/30 dark:bg-brand-900/10">
                <CardContent className="p-4">
                  <p className="mb-2 text-sm font-semibold text-foreground">
                    Accepted evidence types:
                  </p>
                  <div className="space-y-1.5">
                    {[
                      "Photos of incidents, damage, or interactions",
                      "Video or audio recordings",
                      "Official correspondence or documents",
                      "Witness statements or affidavits",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 3: Review */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Review Your Issue</h2>

              <Card className="border-border">
                <CardContent className="p-6">
                  <h3 className="mb-4 text-base font-semibold text-foreground">
                    Issue Summary
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Issue Type</p>
                      <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                        {formData.issueType || formData.category || "Not specified"}
                      </p>
                    </div>

                    {formData.description && (
                      <div>
                        <p className="text-xs text-muted-foreground">Description</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {formData.description}
                        </p>
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Organization</p>
                        <p className="text-sm font-medium">{formData.organization || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Date of Incident</p>
                        <p className="text-sm font-medium">
                          {formData.dateOfIncident
                            ? new Date(formData.dateOfIncident).toLocaleDateString("en-GB")
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Time of Incident</p>
                        <p className="text-sm font-medium">{formData.timeOfIncident || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="text-sm font-medium">{formData.location || "—"}</p>
                      </div>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Evidence</p>
                        <p className="text-sm font-medium">
                          {uploadedFiles.length} file{uploadedFiles.length !== 1 ? "s" : ""} attached
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
                <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  After submitting, our AI will analyze your issue against relevant UK
                  laws and regulations and provide you with tailored guidance.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Analysis (submitting) */}
          {currentStep === 3 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                {submitting ? "Analyzing Your Issue..." : "Ready to Submit"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {submitting
                  ? "Our AI is reviewing your issue against UK legislation, case law, and relevant regulations. This typically takes 10-30 seconds."
                  : "Click Submit and Analyze to begin the AI legal analysis."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        {currentStep > 0 ? (
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
        ) : (
          <div />
        )}

        {currentStep < steps.length - 1 ? (
          <Button
            variant="brand"
            loading={submitting}
            onClick={async () => {
              if (currentStep === 2) {
                // Submit issue and trigger analysis
                setCurrentStep(3)
                setSubmitting(true)
                try {
                  // Create the issue
                  const issueRes = await fetch("/api/issues", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      issueCategory: formData.category,
                      issueType: formData.issueType || formData.category,
                      description: formData.description,
                      organization: formData.organization,
                      individual: formData.individual || undefined,
                      dateOfIncident: formData.dateOfIncident,
                      timeOfIncident: formData.timeOfIncident || undefined,
                      location: formData.location,
                      userRole: formData.role,
                      isAnonymous: formData.isAnonymous,
                    }),
                  })

                  if (!issueRes.ok) {
                    const err = await issueRes.json()
                    throw new Error(err.error || "Failed to create issue")
                  }

                  const issue = await issueRes.json()

                  // Trigger AI analysis
                  const analysisRes = await fetch(`/api/issues/${issue.id}/analyze`, {
                    method: "POST",
                  })

                  if (!analysisRes.ok) {
                    toast.error("Issue saved but analysis failed. You can retry from the issue page.")
                    router.push(`/issues/${issue.id}`)
                    return
                  }

                  toast.success("Issue analyzed successfully!")
                  router.push(`/issues/${issue.id}`)
                } catch (err) {
                  toast.error((err as Error).message)
                  setSubmitting(false)
                  setCurrentStep(2)
                }
              } else {
                setCurrentStep(currentStep + 1)
              }
            }}
            className="gap-2"
          >
            {currentStep === 2 ? "Submit and Analyze" : `Next: ${steps[currentStep + 1]}`}
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}
