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
    const { phoneNumber, code } = await request.json();

    // Ensure phone number is in E.164 format
    let formattedNumber = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      formattedNumber = '+' + phoneNumber;
    }

    console.log('Checking verification for:', formattedNumber); // Debug log

    const verification_check = await client.verify.v2
      .services(verifyServiceId)
      .verificationChecks.create({
        to: formattedNumber,
        code: code
      });

    console.log('Verification check status:', verification_check.status); // Debug log

    return NextResponse.json({
      success: true,
      status: verification_check.status,
      valid: verification_check.valid,
      message: 'Verification completed successfully'
    });
  } catch (error: any) {
    console.error('Detailed error:', error); // Debug log
    
    let errorMessage = 'Failed to verify code';
    
    if (error.code === 60200) {
      errorMessage = 'Invalid phone number format';
    } else if (error.code === 60202) {
      errorMessage = 'Invalid verification code';
    } else if (error.code === 60203) {
      errorMessage = 'Max check attempts reached';
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
