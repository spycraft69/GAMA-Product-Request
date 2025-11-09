declare module 'nodemailer' {
  export interface TransportOptions {
    host?: string
    port?: number
    secure?: boolean
    auth?: {
      user?: string
      pass?: string
    }
  }

  export interface SendMailOptions {
    from?: string
    to?: string
    subject?: string
    text?: string
    html?: string
  }

  export interface Transporter<TReturn = unknown> {
    sendMail(mailOptions: SendMailOptions): Promise<TReturn>
  }

  export function createTransport(options: TransportOptions): Transporter

  const nodemailer: {
    createTransport: typeof createTransport
  }

  export default nodemailer
}

