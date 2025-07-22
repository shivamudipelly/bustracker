import nodemailer from "nodemailer"
import { environment } from "../config/environment"
import { logger } from "../config/logger"

export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: environment.get("EMAIL_USER"),
        pass: environment.get("EMAIL_PASS"),
      },
    })
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const verificationLink = `${environment.get("FRONTEND_URL")}/api/users/verify-email?token=${token}`

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333;">Hello ${name},</h2>
            <p style="color: #555;">Thank you for registering! Please click the link below to verify your email address and complete the registration process:</p>
            <a href="${verificationLink}" style="display: inline-block; background-color: #4CAF50; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Verify Your Email</a>
            <p style="color: #555; margin-top: 20px;">If you did not request this, please ignore this email.</p>
            <footer style="margin-top: 30px; font-size: 12px; color: #888;">&copy; 2025 Bus Tracking System</footer>
          </div>
        </body>
      </html>
    `

    await this.sendEmail(email, "Verify Your Email", html)
    logger.info(`Verification email sent to: ${email}`)
  }

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const resetLink = `${environment.get("FRONTEND_URL")}/reset-password?token=${token}`

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333;">Hello ${name},</h2>
            <p style="color: #555;">We received a request to reset your password. If you did not request this, please ignore this email.</p>
            <p style="color: #555;">To reset your password, click the link below:</p>
            <a href="${resetLink}" style="display: inline-block; background-color: #FF5722; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Reset Password</a>
            <p style="color: #555; margin-top: 20px;">This link will expire in 1 hour.</p>
            <footer style="margin-top: 30px; font-size: 12px; color: #888;">&copy; 2025 Bus Tracking System</footer>
          </div>
        </body>
      </html>
    `

    await this.sendEmail(email, "Password Reset Request", html)
    logger.info(`Password reset email sent to: ${email}`)
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: environment.get("EMAIL_USER"),
        to,
        subject,
        html,
      })
    } catch (error) {
      logger.error("Failed to send email:", error)
      throw new Error("Failed to send email")
    }
  }
}
