import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey && !apiKey.includes('placeholder') ? new Resend(apiKey) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export async function sendOtpEmail(email: string, otp: string): Promise<{ success: boolean; message: string }> {
  console.log(`\n==================================================`);
  console.log(`📧 [RESEND OTP SERVICE] OTP Code for ${email}: [ ${otp} ]`);
  console.log(`==================================================\n`);

  if (!resend) {
    console.log(`ℹ️ [Resend Service] Resend API key is not configured or using placeholder. OTP logged above for quick testing.`);
    return { success: true, message: 'OTP sent (logged to console in dev mode)' };
  }

  try {
    const data = await resend.emails.send({
      from: fromEmail.includes('<') ? fromEmail : `SovereignX Auth <${fromEmail}>`,
      to: [email],
      subject: `Your SovereignX Verification Code: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0b0d10; color: #ffffff; padding: 40px; borderRadius: 12px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #ffffff; text-align: center; font-size: 24px;">Welcome to SovereignX</h2>
          <p style="color: #a0a0a0; font-size: 15px; text-align: center;">Use the verification code below to complete your registration:</p>
          <div style="background-color: #161920; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #c394ff;">${otp}</span>
          </div>
          <p style="color: #606060; font-size: 12px; text-align: center;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
        </div>
      `,
    });

    if (data.error) {
      console.error('❌ [Resend Error]:', data.error);
      return { success: true, message: 'OTP generated (Email delivery failed, check console for code)' };
    }

    console.log('✅ [Resend] Verification email dispatched successfully to', email);
    return { success: true, message: 'OTP sent successfully to email' };
  } catch (err: any) {
    console.error('⚠️ [Resend Exception]:', err?.message || err);
    return { success: true, message: 'OTP generated (fallback console mode)' };
  }
}
