import { NextResponse } from 'next/server';
import twilio from 'twilio';

// Initialize the Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceId = process.env.TWILIO_VERIFY_SERVICE_ID as string;

if (!accountSid || !authToken || !verifyServiceId) {
  throw new Error('Missing required Twilio credentials');
}

const client = twilio(accountSid, authToken);

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    // Ensure phone number is in E.164 format
    let formattedNumber = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      formattedNumber = '+' + phoneNumber;
    }

    console.log('Sending verification to:', formattedNumber); // Debug log

    const verification = await client.verify.v2
      .services(verifyServiceId)
      .verifications.create({
        to: formattedNumber,
        channel: 'sms'
      });

    console.log('Verification status:', verification.status); // Debug log

    return NextResponse.json({ 
      success: true, 
      status: verification.status,
      message: 'Verification code sent successfully'
    });

  } catch (error: any) {
    console.error('Detailed error:', error); // Debug log
    
    let errorMessage = 'Failed to send verification code';
    
    if (error.code === 60200) {
      errorMessage = 'Invalid phone number format';
    } else if (error.code === 60203) {
      errorMessage = 'Max send attempts reached';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error.message 
      },
      { status: 400 }
    );
  }
}
