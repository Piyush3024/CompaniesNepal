
import SibApiV3Sdk from 'sib-api-v3-sdk';

// Configure Brevo API client using the same pattern as your working portfolio
const configureBrevo = () => {
    try {
        if (!process.env.BREVO_API_KEY) {
            throw new Error('BREVO_API_KEY is not set in .env');
        }
        
        // Initialize the default client (same as portfolio)
        const defaultClient = SibApiV3Sdk.ApiClient.instance;
        
        // Configure API key authorization (same as portfolio)
        const apiKey = defaultClient.authentications['api-key'];
        apiKey.apiKey = process.env.BREVO_API_KEY;
        
        // Return the transactional emails API instance (same as portfolio)
        return new SibApiV3Sdk.TransactionalEmailsApi();
    } catch (error) {
        console.error('Brevo configuration error:', error.message);
        throw error;
    }
};

// Send email using Brevo API (following portfolio pattern exactly)
export const sendEmail = async ({ to, subject, htmlContent }) => {
    try {
        console.log('Attempting to send email...');
        
        // Use the same configuration pattern as portfolio
        const defaultClient = SibApiV3Sdk.ApiClient.instance;
        const apiKey = defaultClient.authentications['api-key'];
        apiKey.apiKey = process.env.BREVO_API_KEY;
        
        // Setup API instance (same as portfolio)
        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        
        const sender = {
            email: process.env.SENDER_EMAIL || 'no-reply@gmal.com',
            name: process.env.SENDER_NAME || 'lms'
        };

        // Configure email using Brevo's SendSmtpEmail model (same as portfolio)
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.sender = sender;
        sendSmtpEmail.to = [{ email: to }];
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = htmlContent;

        console.log('Sending email with configuration:', {
            to,
            subject,
            sender: sender.email,
            senderName: sender.name
        });

    
        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Email sent successfully via Brevo API');
        console.log('Message ID:', response.messageId);
        
        return { success: true, messageId: response.messageId };
    } catch (error) {
        console.error('Error sending email via Brevo:', error.message);
        
        // Log more details about the error for debugging
        if (error.response) {
            console.error('Brevo API Error Response:', error.response.text || error.response.body);
        }
        
        throw error;
    }
};

// Email templates
// Email templates
export const emailTemplates = {
    welcomeEmail: (userName) => ({
        subject: 'Welcome to Company Nepal',
        htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #333; text-align: center;">Welcome to Company Nepal!</h1>
                <p>Dear ${userName},</p>
                <p>Welcome to <strong>Company Nepal</strong> - your business directory and marketplace. We're excited to have you on board!</p>
                <p>You can now explore companies, products, and services through our platform.</p>
                <p>If you have any questions, feel free to reach out to our support team.</p>
                <p>Best regards,<br><strong>Company Nepal Team</strong></p>
            </div>
        `
    }),

    verificationEmail: (userName, verificationLink) => ({
        subject: 'Verify Your Company Nepal Account',
        htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #2c3e50; text-align: center;">Verify Your Account</h1>
                <p>Dear ${userName},</p>
                <p>Thank you for signing up with <strong>Company Nepal</strong>! Please complete your registration process by verifying your email address:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" 
                       style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Verify Email Address
                    </a>
                </div>
                <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
                <p style="word-break: break-all;">${verificationLink}</p>
                <p>This verification link will expire in 15 min.</p>
                <p>If you didn't create an account with us, please ignore this email.</p>
                <p>Best regards,<br><strong>Company Nepal Team</strong></p>
            </div>
        `
    }),

    passwordResetEmail: (userName, resetLink) => ({
        subject: 'Reset Your Company Nepal Password',
        htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #dc3545; text-align: center;">Reset Your Password</h1>
                <p>Dear ${userName},</p>
                <p>You requested to reset your password for your <strong>Company Nepal</strong> account. Click the button below to reset it:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" 
                       style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
                <p style="word-break: break-all;">${resetLink}</p>
                <p>This reset link will expire in 15 min.</p>
                <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
                <p>Best regards,<br><strong>Company Nepal Team</strong></p>
            </div>
        `
    }),
};
