import nodemailer from 'nodemailer'

interface SendMailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

type MailTransporter = {
  sendMail: (options: {
    from?: string
    to: string
    subject: string
    text?: string
    html?: string
  }) => Promise<unknown>
}

function isEmailEnabled() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD &&
    process.env.SMTP_FROM
  )
}

let transporter: MailTransporter | null = null

function getTransporter() {
  if (!isEmailEnabled()) {
    return null
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    }) as MailTransporter
  }

  return transporter
}

export async function sendMail({ to, subject, html, text }: SendMailOptions) {
  const transport = getTransporter()

  if (!transport) {
    console.warn('[mailer] SMTP environment variables not fully configured. Email skipped.')
    return
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
    html,
  })
}
