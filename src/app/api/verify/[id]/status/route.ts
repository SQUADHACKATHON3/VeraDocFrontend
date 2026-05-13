import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Verification from '@/models/Verification';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    await dbConnect();

    const verification = await Verification.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!verification) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: verification.status,
      verdict: verification.verdict,
      trustScore: verification.trustScore,
      summary: verification.summary
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', detail: error.message }, { status: 500 });
  }
}
