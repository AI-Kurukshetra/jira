interface NotificationTemplateInput {
  title: string
  message: string
}

export function buildNotificationEmail({ title, message }: NotificationTemplateInput) {
  const subject = title
  const text = `${title}\n\n${message}\n\nView in ProjectHub.`
  const html = `
    <div style="font-family: Inter, Arial, sans-serif; background: #0A0A0F; color: #F0F0FF; padding: 24px;">
      <div style="max-width: 520px; margin: 0 auto; background: #16161F; border: 1px solid #1E1E2E; border-radius: 12px; padding: 20px;">
        <h2 style="margin: 0 0 8px; font-size: 18px;">${title}</h2>
        <p style="margin: 0 0 16px; color: #9B9BB8;">${message}</p>
        <div style="font-size: 12px; color: #5C5C78;">ProjectHub Notification</div>
      </div>
    </div>
  `
  return { subject, html, text }
}
