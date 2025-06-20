import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import { connectToDatabase } from '../../../lib/db'; 
import Video from '../../../models/Video'; 
import { getServerSession } from 'next-auth'; 
import { authOptions } from '@/lib/auth';

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
  privateKey: process.env.NEXT_IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT!,
});

export async function POST(request: Request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const formData = await request.formData();
    const file = formData.get('video') as File;
    
    if (!file) {
      return NextResponse.json(
        { message: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert file to buffer for ImageKit upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to ImageKit
    const imageKitResponse = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder: '/videos', 
      useUniqueFileName: true,
      tags: ['video', 'user-upload'], 
    });

    // Connect to MongoDB
    await connectToDatabase();

    // Create a new video document in MongoDB
    const newVideo = await Video.create({
      title: imageKitResponse.name,
      description: `Uploaded video: ${imageKitResponse.name}`,
      url: imageKitResponse.url,
      fileId: imageKitResponse.fileId,
      name: imageKitResponse.name,
      thumbnailUrl: imageKitResponse.thumbnailUrl,
      owner: userId, // Use the actual userId here
    });

    return NextResponse.json({
      message: 'Video uploaded successfully to ImageKit and saved to DB',
      url: imageKitResponse.url,
      videoId: newVideo._id,
    });
  } catch (error) {
    console.error('Upload and DB save error:', error);
    return NextResponse.json(
      { message: 'Error uploading file or saving to database', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 