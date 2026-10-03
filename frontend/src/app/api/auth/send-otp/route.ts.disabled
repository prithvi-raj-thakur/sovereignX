import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // In a real application, you would:
    // 1. Generate a secure 6-digit OTP
    // 2. Save it to a database/Redis with an expiration time
    // 3. Send it via email (using Nodemailer, Resend, Sendgrid, etc.)

    console.log(`[MOCK EMAIL SERVER] Sending OTP '123456' to ${email}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error in send-otp:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
