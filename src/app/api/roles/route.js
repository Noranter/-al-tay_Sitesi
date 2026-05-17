import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Role from '@/models/Role';

export async function GET() {
  try {
    await dbConnect();
    let roles = await Role.find().sort({ order: 1, name: 1 });
    
    let updated = false;
    for (let role of roles) {
      if (role.level === undefined || role.level === null) {
        let detectedLevel = 4;
        const nameLower = role.name.toLowerCase();
        if (nameLower.includes('danışman') || nameLower.includes('öğretmen')) {
          detectedLevel = 1;
        } else if (nameLower.includes('koordinatör') || nameLower.includes('kordinatör')) {
          detectedLevel = 2;
        } else if (nameLower.includes('komite') || nameLower.includes('sekreter') || nameLower.includes('admin') || nameLower.includes('divan')) {
          detectedLevel = 3;
        } else {
          detectedLevel = 4;
        }
        
        role.level = detectedLevel;
        await Role.findByIdAndUpdate(role._id, { level: detectedLevel });
        updated = true;
      }
    }
    
    if (updated) {
      roles = await Role.find().sort({ order: 1, name: 1 });
    }
    
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
