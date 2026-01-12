import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';
import { emailTemplates } from './templates/email.templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private apiInstance: SibApiV3Sdk.TransactionalEmailsApi;
  private senderEmail: string;
  private senderName: string;

  constructor(private configService: ConfigService) {
    this.initializeBrevo();
    this.senderEmail =
      this.configService.get<string>('SENDER_EMAIL') || 'no-reply@gmail.com';
    this.senderName =
      this.configService.get<string>('SENDER_NAME') || 'Company Nepal';
  }
  private initializeBrevo() {
    try {
      const apiKey = this.configService.get<string>('BREVO_API_KEY');

      if (!apiKey) {
        throw new Error('BREVO_API_KEY is not set in environment variables');
      }

      // Initialize the default client
      const defaultClient = SibApiV3Sdk.ApiClient.instance;

      // Configure API key authorization
      const apiKeyAuth = defaultClient.authentications['api-key'];
      apiKeyAuth.apiKey = apiKey;

      // Create transactional emails API instance
      this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

      this.logger.log('Brevo email service initialized');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error('Failed to initialize Brevo:', message);
      if (err instanceof Error) throw err;
      throw new Error(message);
    }
  }

  async sendEmail(params: {
    to: string;
    subject: string;
    htmlContent: string;
  }): Promise<{ success: boolean; messageId?: string }> {
    try {
      const { to, subject, htmlContent } = params;

      const sender = {
        email: this.senderEmail,
        name: this.senderName,
      };

      // Configure email using Brevo's SendSmtpEmail model
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.sender = sender;
      sendSmtpEmail.to = [{ email: to }];
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = htmlContent;

      this.logger.log(`Sending email to: ${to}`);

      let response: { messageId: string };
      try {
        response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      } catch (apiError: unknown) {
        const errorMsg =
          apiError instanceof Error ? apiError.message : String(apiError);
        this.logger.error('Error sending email:', errorMsg);
        throw apiError;
      }

      this.logger.log(
        `Email sent successfully. Message ID: ${response.messageId}`,
      );

      return { success: true, messageId: response.messageId };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error sending email:', errorMessage);
      throw error;
    }
  }

  async sendVerificationEmail(
    email: string,
    token: string,
    userName: string,
  ): Promise<void> {
    try {
      const verificationUrl = `${this.configService.get<string>('CLIENT_URL')}/auth/verify/${token}`;

      const { subject, htmlContent } = emailTemplates.verificationEmail(
        userName,
        verificationUrl,
      );

      await this.sendEmail({
        to: email,
        subject,
        htmlContent,
      });

      this.logger.log(`Verification email sent to: ${email}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error in sendVerificationEmail:', errorMessage);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, userName: string): Promise<void> {
    try {
      const { subject, htmlContent } = emailTemplates.welcomeEmail(userName);

      await this.sendEmail({
        to: email,
        subject,
        htmlContent,
      });

      this.logger.log(`Welcome email sent to: ${email}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error in sendWelcomeEmail:', errorMessage);
      // Don't throw - welcome email is non-critical
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userName: string,
  ): Promise<void> {
    try {
      const resetLink = `${this.configService.get<string>('CLIENT_URL')}/auth/reset-password/${resetToken}`;

      const { subject, htmlContent } = emailTemplates.passwordResetEmail(
        userName,
        resetLink,
      );

      await this.sendEmail({
        to: email,
        subject,
        htmlContent,
      });

      this.logger.log(`Password reset email sent to: ${email}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error in sendPasswordResetEmail:', errorMessage);
      throw error;
    }
  }
}
