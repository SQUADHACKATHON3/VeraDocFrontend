import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Verification from '@/models/Verification';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only PDF, JPG, PNG allowed.' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 5MB' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileBase64 = buffer.toString('base64');

    await dbConnect();

    const verification = new Verification({
      userId: session.user.id,
      documentName: file.name,
      status: 'pending',
      paymentStatus: 'pending',
      fileBase64: fileBase64,
    });

    await verification.save();

    const squadSecretKey = process.env.SQUAD_SECRET_KEY;
    if (!squadSecretKey) {
      throw new Error('SQUAD_SECRET_KEY is missing from environment');
    }

    const transactionRef = verification._id.toString();
    const squadResponse = await fetch('https://sandbox-api-d.squadco.com/transaction/initiate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${squadSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: session.user.email,
        amount: 100000,
        currency: 'NGN',
        transaction_ref: transactionRef,
        callback_url: `https://veradoc.vercel.app/verify/${transactionRef}`,
      }),
    });

    const squadData = await squadResponse.json();

    if (!squadResponse.ok || !squadData.data?.checkout_url) {
      console.error('Squad API Error:', squadData);
      return NextResponse.json({ error: 'Failed to initiate payment with Squad' }, { status: 500 });
    }

    verification.squadTransactionRef = transactionRef;
    await verification.save();

    return NextResponse.json({
      verificationId: transactionRef,
      checkoutUrl: squadData.data.checkout_url,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Initiate Error:', error);
    return NextResponse.json({ error: 'Internal server error', detail: error.message }, { status: 500 });
  }
}
