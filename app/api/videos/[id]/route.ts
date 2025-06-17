import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    const filePath = join(process.cwd(), 'public', 'uploads', videoId);

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { message: 'Video not found' },
        { status: 404 }
      );
    }

    await unlink(filePath);

    return NextResponse.json({
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { message: 'Error deleting video' },
      { status: 500 }
    );
  }
} 