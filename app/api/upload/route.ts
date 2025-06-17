import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('video') as File;
    
    if (!file) {
      return NextResponse.json(
        { message: 'No file uploaded' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Create a unique filename
    const uniqueFilename = `${Date.now()}-${file.name}`;
    const filePath = join(uploadDir, uniqueFilename);

    // Write the file
    await writeFile(filePath, buffer);

    return NextResponse.json({
      message: 'File uploaded successfully',
      url: `/uploads/${uniqueFilename}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'Error uploading file', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 