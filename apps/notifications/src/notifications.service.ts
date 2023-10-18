import { Injectable } from '@nestjs/common';
import { NotifyEmailDto } from './dto/notify-email.dto';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsService {
  constructor(private readonly configService: ConfigService) {}
  private readonly transporter = nodemailer.createTransport({
    host: this.configService.get('SMTP_HOST'),
    port: this.configService.get('SMTP_PORT'),
    auth: {
      user: this.configService.get('SMTP_USER'),
      pass: this.configService.get('SMTP_PASSWORD'),
    },
  });
  async notifyEmail({ email, text }: NotifyEmailDto) {
    await this.transporter.sendMail({
      from: this.configService.get('SMTP_USER'),
      to: email,
      subject: 'Reservation created',
      text,
    });
  }
}
