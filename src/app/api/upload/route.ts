import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  const file = request.body || '';
  const contentType = request.headers.get('content-type') || 'image/jpeg';
  const filename = `${nanoid()}.${contentType.split('/')[1]}`;
  
  try {
    const blob = await put(filename, file, {
      contentType,
      access: 'public',
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}