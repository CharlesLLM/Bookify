import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    ignoreTLS: true,
  });

  async sendVerificationEmail(email: string, token: string) {
    const url = `${process.env.APP_URL}/users/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Verify your email',
      html: `
        <h2>Email Verification</h2>
        <p>Click below to verify your account:</p>
        <a href="${url}">${url}</a>
      `,
    });
  }

  async sendTwoFactorCode(email: string, code: string) {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Your Two-Factor Authentication Code',
      html: `
        <h2>Two-Factor Authentication</h2>
        <p>Your 2FA code is: ${code}</p>
        <p>This code expires in 10 minutes.</p>
      `,
    });
  }
}
