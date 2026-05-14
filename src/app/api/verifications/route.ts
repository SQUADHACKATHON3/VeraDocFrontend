import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Verification from '@/models/Verification';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const verdict = searchParams.get('verdict');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const query: any = { userId: session.user.id };

    if (verdict) {
      query.verdict = verdict;
    }

    if (search) {
      query.documentName = { $regex: search, $options: 'i' };
    }

    await dbConnect();

    const verifications = await Verification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-fileBase64');

    const total = await Verification.countDocuments(query);

    return NextResponse.json({
      data: verifications,
      total,
      page,
      limit
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', detail: error.message }, { status: 500 });
  }
}
