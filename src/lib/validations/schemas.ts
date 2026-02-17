import { z } from 'zod'

const PASSWORD_MIN_LENGTH = 8
const PROJECT_NAME_MIN = 3
const PROJECT_NAME_MAX = 100
const PROJECT_KEY_MIN = 2
const PROJECT_KEY_MAX = 10
const SUMMARY_MAX = 255
const DESCRIPTION_MAX = 20000
const LABEL_MAX = 30
const COMMENT_MAX = 5000
const STORY_POINTS_MIN = 0
const STORY_POINTS_MAX = 99

const passwordRegex = /^(?=.*[A-Z])(?=.*\d).+$/

export const registerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .regex(passwordRegex, 'Password must include 1 uppercase letter and 1 number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email')
})

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`),
    newPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
      .regex(passwordRegex, 'Password must include 1 uppercase letter and 1 number'),
    confirmPassword: z.string()
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

export const updateProfileSchema = z.object({
  fullName: z.string().min(1).optional(),
  displayName: z.string().min(1).max(50).optional(),
  avatarUrl: z.string().url().optional(),
  timezone: z.string().min(1).optional(),
  notifications: z
    .object({
      email: z.boolean().optional(),
      inApp: z.boolean().optional(),
      assignments: z.boolean().optional(),
      statusChanges: z.boolean().optional(),
      comments: z.boolean().optional(),
      mentions: z.boolean().optional()
    })
    .optional()
})

export const adminUserCreateSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  role: z.enum(['system_admin', 'project_admin', 'developer', 'viewer']).optional()
})

export const adminUserUpdateSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['system_admin', 'project_admin', 'developer', 'viewer']).optional(),
  isActive: z.boolean().optional()
})

export const projectSchema = z.object({
  name: z.string().min(PROJECT_NAME_MIN).max(PROJECT_NAME_MAX),
  key: z
    .string()
    .min(PROJECT_KEY_MIN)
    .max(PROJECT_KEY_MAX)
    .regex(/^[A-Z0-9]+$/, 'Project key must be uppercase alphanumeric'),
  projectType: z.enum(['software', 'business', 'ops']),
  description: z.string().max(500).optional(),
  leadUserId: z.string().uuid().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  avatarUrl: z.string().url().optional()
})

export const projectMemberSchema = z.object({
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(['project_admin', 'developer', 'viewer'])
})

export const sprintSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1).max(200),
  goal: z.string().max(500).optional(),
  status: z.enum(['pending', 'active', 'completed']).optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional()
})

export const labelSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1).max(LABEL_MAX),
  colorHex: z.string().regex(/^#([0-9a-fA-F]{6})$/, 'Invalid color')
})

export const issueSchema = z.object({
  projectId: z.string().uuid(),
  sprintId: z.string().uuid().nullable().optional(),
  parentIssueId: z.string().uuid().nullable().optional(),
  columnId: z.string().uuid().nullable().optional(),
  issueType: z.enum(['story', 'task', 'bug', 'subtask']),
  summary: z.string().min(1).max(SUMMARY_MAX),
  description: z.string().max(DESCRIPTION_MAX).optional(),
  status: z.enum(['todo', 'inprogress', 'done']).optional(),
  priority: z.enum(['highest', 'high', 'medium', 'low', 'lowest']).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  reporterId: z.string().uuid().nullable().optional(),
  storyPoints: z.number().int().min(STORY_POINTS_MIN).max(STORY_POINTS_MAX).optional(),
  dueDate: z.string().date().optional()
})

export const issueUpdateSchema = issueSchema.partial().extend({
  id: z.string().uuid()
})

export const commentSchema = z.object({
  issueId: z.string().uuid(),
  body: z.string().min(1).max(COMMENT_MAX)
})

export const attachmentSchema = z.object({
  issueId: z.string().uuid(),
  fileName: z.string().min(1).max(200),
  fileSize: z.number().int().nonnegative().optional(),
  fileType: z.string().min(1).max(100).optional(),
  storagePath: z.string().min(1).max(300)
})

export const notificationSchema = z.object({
  recipientId: z.string().uuid(),
  type: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  relatedIssueId: z.string().uuid().nullable().optional(),
  relatedProjectId: z.string().uuid().nullable().optional()
})

export const searchSchema = z.object({
  query: z.string().min(2).max(200),
  projectId: z.string().uuid().optional(),
  scope: z.enum(['project', 'all']).optional()
})
