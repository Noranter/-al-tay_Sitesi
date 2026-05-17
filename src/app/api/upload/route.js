import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

function sanitizeFilename(filename) {
  const charMap = {
    'Ç': 'C', 'ç': 'c',
    'Ğ': 'G', 'ğ': 'g',
    'I': 'I', 'ı': 'i',
    'İ': 'I',
    'Ö': 'O', 'ö': 'o',
    'Ş': 'S', 'ş': 's',
    'Ü': 'U', 'ü': 'u'
  };
  
  // Replace Turkish chars
  let cleaned = filename.split('').map(char => charMap[char] || char).join('');
  
  // Remove accents/diacritics
  cleaned = cleaned.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Replace spaces and special characters with hyphens/underscores
  cleaned = cleaned.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '_');
  
  return cleaned;
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string' || !file.arrayBuffer) {
      return NextResponse.json({ error: 'Geçersiz veya boş dosya yüklendi.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Ensure directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      console.error('Directory creation error:', e);
    }

    const originalName = file.name || 'upload.bin';
    const cleanName = sanitizeFilename(originalName);
    const filename = `${uuidv4()}-${cleanName}`;
    const path = join(uploadDir, filename);
    
    await writeFile(path, buffer);
    
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ error: `Yükleme hatası: ${error.message}` }, { status: 500 });
  }
}
