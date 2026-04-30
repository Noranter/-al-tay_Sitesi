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

export async function GET(req, { params }) {
  try {
    const p = await params;
    await dbConnect();
    const committee = await Committee.findById(p.id).populate('divanMembers adminMember secretaryMember pressMember');
    if (!committee) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(committee);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const p = await params;
    const data = await req.json();
    await dbConnect();
    const committee = await Committee.findByIdAndUpdate(p.id, data, { new: true });
    if (!committee) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(committee);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const p = await params;
    await dbConnect();
    const committee = await Committee.findByIdAndDelete(p.id);
    if (!committee) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
