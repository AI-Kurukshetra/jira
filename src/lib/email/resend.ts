'use server'

import { Resend } from 'resend'

import { logger } from '@/lib/logger'

interface EmailPayload {
  to: string
  subject: string
  html: string
  text: string
}

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY')
  }
  return new Resend(apiKey)
}

const getFromAddress = () => {
  const from = process.env.RESEND_FROM
  if (!from) {
    throw new Error('Missing RESEND_FROM')
  }
  return from
}

export async function sendEmail(payload: EmailPayload) {
  try {
    const client = getResendClient()
    const from = getFromAddress()
    await client.emails.send({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text
    })
  } catch (error) {
    logger.error({ error }, 'Failed to send email')
  }
}
