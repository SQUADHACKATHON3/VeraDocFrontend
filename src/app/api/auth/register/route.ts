import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, organisation, email, password } = body;

    if (!name || !organisation || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      organisation,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return NextResponse.json({ message: 'Account created successfully' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', detail: error.message }, { status: 500 });
  }
}