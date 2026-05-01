import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';
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
    const start = Date.now();
    console.log(`[${new Date().toISOString()}] API: Connecting to DB...`);
    await dbConnect();
    console.log(`[${new Date().toISOString()}] API: Connected after ${Date.now() - start}ms, finding settings...`);
    const findStart = Date.now();
    let settings = await Settings.findOne();
    console.log(`[${new Date().toISOString()}] API: Settings found in ${Date.now() - findStart}ms:`, !!settings);
    if (!settings) {
      console.log(`[${new Date().toISOString()}] API: Creating default settings...`);
      settings = await Settings.create({});
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] API Error in /api/settings:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = await req.json();
    await dbConnect();
    let settings = await Settings.findOne();
    if (settings) {
      settings = await Settings.findOneAndUpdate({}, data, { new: true });
    } else {
      settings = await Settings.create(data);
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
