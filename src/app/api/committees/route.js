import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Committee from '@/models/Committee';
import BoardMember from '@/models/BoardMember';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_workshop_site';

async function isAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  if (!token) return false;
  try {
    jwt.verify(token.value, JWT_SECRET);
    return true;
  } catch (e) {
    return false;
  }
}

export async function GET() {
  try {
    await dbConnect();
    const committees = await Committee.find({}).populate('divanMembers adminMember secretaryMember pressMember').sort({ createdAt: 1 });
    return NextResponse.json(committees);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = await req.json();
    await dbConnect();
    const committee = await Committee.create(data);
    return NextResponse.json(committee, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
