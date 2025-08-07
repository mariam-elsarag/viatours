import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, RequestTimeoutException } from '@nestjs/common';

type activateAccountContext = {
  fullName?: string;
  email?: string;
  otp?: string;
  frontendUrl?: string;
  dashboardUrl?: string;
  reason?: string;
};
@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}
  async approveAgent(email: string, fullName: string) {
    await this.send(email, 'Approve', 'agent-approved', {
      fullName,
      dashboardUrl: process.env.Agent_SERVER ?? '',
    });
  }
  async rejectAgent(email: string, fullName: string, reason: string) {
    await this.send(email, 'Rejection', 'agent-rejected', {
      fullName,
      reason,
    });
  }
  async suspended(email: string, fullName: string, reason: string) {
    await this.send(email, 'Suspended', 'agent-suspended', {
      fullName,
      reason,
    });
  }

  async activateAccountEmail(email: string, fullName: string, otp: string) {
    await this.send(email, 'Activate Account', 'activation', {
      fullName,
      email,
      otp,
      frontendUrl: process.env.FRONT_SERVER || '',
    });
  }

  async forgetPasswordEmail(email: string, fullName: string, otp: string) {
    await this.send(email, 'Reset Your Password', 'forget-password', {
      fullName,
      email,
      otp,
      frontendUrl: process.env.FRONT_SERVER || '',
    });
  }

  private async send(
    email: string,
    subject: string,
    template: string,
    context: activateAccountContext,
  ) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: `"viatours" <no-reply@viatours.com>`,
        subject: subject,
        template,
        context,
      });
    } catch (err) {
      console.error('Email send error:', err);
      throw new RequestTimeoutException('Failed to send activation email.');
    }
  }
}
