import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, RequestTimeoutException } from '@nestjs/common';

type activateAccountContext = {
  fullName: string;
  email: string;
  otp: string;
  frontendUrl: string;
};
@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}
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
