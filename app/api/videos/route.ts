import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const files = await readdir(uploadDir);
    
    const videos = files
      .filter(file => file.match(/\.(mp4|webm|ogg)$/))
      .map(file => ({
        id: file,
        url: `/uploads/${file}`,
        title: file,
        createdAt: new Date().toISOString()
      }));

    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { message: 'Error fetching videos' },
      { status: 500 }
    );
  }
} 