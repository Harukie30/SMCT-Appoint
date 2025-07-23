import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, booking } = await request.json();
    
    // Validate required fields
    if (!to || !subject || !booking) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, or booking data' },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Use an email service (SendGrid, Mailgun, etc.)
    // 2. Send the email
    // 3. Log the email
    
    console.log('Sending email to:', to);
    console.log('Subject:', subject);
    console.log('Booking data:', booking);
    
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      to: to,
      subject: subject,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 