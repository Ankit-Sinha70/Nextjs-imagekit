import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '../../../../lib/db';
import Video from '../../../../models/Video'; 

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } } 
) {
  try {
    const videoId = params.id;

    if (!videoId) {
      return NextResponse.json(
        { message: 'Video ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find and delete the video by its _id
    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if (!deletedVideo) {
      return NextResponse.json(
        { message: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Video deleted successfully', videoId: deletedVideo._id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      {
        message: 'Error deleting video',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}