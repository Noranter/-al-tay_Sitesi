import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Role from '@/models/Role';

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const role = await Role.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(role);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    await Role.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Role deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
