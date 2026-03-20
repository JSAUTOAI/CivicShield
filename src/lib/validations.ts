import { z } from "zod"

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9!@#$%^&*]/, "Password must contain at least one number or symbol"),
  fullName: z.string().min(2, "Full name is required").max(100),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const issueSchema = z.object({
  issueCategory: z.string().min(1, "Category is required"),
  issueType: z.string().min(1, "Issue type is required"),
  description: z.string().min(10, "Please provide more detail (at least 10 characters)"),
  organization: z.string().min(1, "Organization is required"),
  individual: z.string().optional(),
  dateOfIncident: z.string().min(1, "Date is required"),
  timeOfIncident: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  userRole: z.string().default("complainant"),
  isAnonymous: z.boolean().default(false),
})

export const complaintUpdateSchema = z.object({
  complaintText: z.string().optional(),
  status: z.enum(["draft", "sent", "opened", "responded"]).optional(),
  recipientName: z.string().optional(),
  recipientEmail: z.string().email().optional(),
  recipientAddress: z.string().optional(),
  recipientOrg: z.string().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type IssueInput = z.infer<typeof issueSchema>
export type ComplaintUpdateInput = z.infer<typeof complaintUpdateSchema>
