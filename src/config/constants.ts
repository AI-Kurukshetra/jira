export const ATTACHMENTS_BUCKET = 'attachments'
export const MAX_ATTACHMENT_SIZE_MB = 10
export const MAX_ATTACHMENT_BYTES = MAX_ATTACHMENT_SIZE_MB * 1024 * 1024
export const ALLOWED_ATTACHMENT_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/zip',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]
