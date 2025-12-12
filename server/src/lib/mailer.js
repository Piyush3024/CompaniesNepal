import { sendEmail, emailTemplates } from '../config/email.config.js';

export default async function sendVerificationEmail(email, token, userName) {
  try {
    const verificationUrl = `${process.env.CLIENT_URL}/auth/verify/${token}`;
    console.log("userName",userName)
    console.log("verificationUrl",verificationUrl)
    const { subject, htmlContent } = emailTemplates.verificationEmail(userName, verificationUrl);
    await sendEmail({
      to: email,
      subject,
      htmlContent
    });
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Error in sendVerificationEmail:', error.message);
    throw error;
  }
}
