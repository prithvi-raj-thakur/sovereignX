import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    // In a real application, you would verify the OTP against the database/Redis
    // and check if it has expired.

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock validation: accept '123456' as the valid OTP for any email
    if (otp === '123456') {
      return NextResponse.json({ success: true, message: 'OTP verified successfully' });
    } else {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in verify-otp:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
