import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Verification from '@/models/Verification';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-squad-signature');
    const secretKey = process.env.SQUAD_SECRET_KEY || '';

    const hash = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.Event || payload.event;
    
    if (eventType !== 'charge_successful') {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const transactionRef = payload.Body?.transaction_ref || payload.data?.transaction_ref;
    if (!transactionRef) {
      return NextResponse.json({ error: 'Missing transaction_ref' }, { status: 400 });
    }

    await dbConnect();

    const verification = await Verification.findById(transactionRef);
    if (!verification) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
    }

    verification.paymentStatus = 'paid';
    verification.status = 'processing';
    await verification.save();

    if (verification.fileBase64) {
      const fileBuffer = Buffer.from(verification.fileBase64, 'base64');
      const formData = new FormData();
      
      const blob = new Blob([fileBuffer], { type: 'application/octet-stream' });
      formData.append('file', blob, verification.documentName);

      const fastApiUrl = process.env.FASTAPI_SERVICE_URL || 'https://veradoc-ai.onrender.com';
      const internalKey = process.env.INTERNAL_SERVICE_KEY || '';

      try {
        const fastApiResponse = await fetch(`${fastApiUrl}/analyze`, {
          method: 'POST',
          headers: {
            'X-Internal-Key': internalKey,
          },
          body: formData,
        });

        if (!fastApiResponse.ok) {
          throw new Error('FastAPI responded with an error');
        }

        const result = await fastApiResponse.json();

        verification.status = 'complete';
        verification.verdict = result.verdict;
        verification.trustScore = result.trust_score;
        verification.flags = result.flags || [];
        verification.passedChecks = result.passed_checks || [];
        verification.summary = result.summary;
        verification.completedAt = new Date();
        verification.fileBase64 = undefined;
        await verification.save();

      } catch (aiError) {
        console.error('AI Processing Error:', aiError);
        verification.status = 'error';
        verification.fileBase64 = undefined;
        await verification.save();
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
