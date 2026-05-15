import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Role from '@/models/Role';
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
    const members = await BoardMember.find().populate('roles').sort({ order: 1 });
    return NextResponse.json(members);
  } catch (error) {
    console.error('API Error in GET /api/board:', error);
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
    const member = await BoardMember.create(data);
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('API Error in POST /api/board:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
