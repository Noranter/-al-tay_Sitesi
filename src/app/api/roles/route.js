import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Role from '@/models/Role';

export async function GET() {
  try {
    await dbConnect();
    const roles = await Role.find().sort({ order: 1, name: 1 });
    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const role = await Role.create(body);
    return NextResponse.json(role);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
