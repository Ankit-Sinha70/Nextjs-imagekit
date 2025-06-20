import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Video, { IVideo } from "@/models/Video";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    const videos = await Video.find({}).sort({ createdAt: -1 }).lean();

    if (!videos || videos.length === 0) {
      return NextResponse.json([], { status: 200 });
    }
    console.log(videos, ":Videos")
    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json(
      {
        error: `Failed to fetch videos${error}`,
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        {
          error: "Unauthorized User",
        },
        {
          status: 401,
        }
      );
    }
    await connectToDatabase();
    const body: IVideo = await request.json();
    if (
      !body.title ||
      !body.description ||
      !body.thumbnailUrl ||
      !body.url ||
      !body.fileId ||
      !body.name
    ) {
      return NextResponse.json(
        {
          error: "Invalid Request: Missing required video fields",
        },
        {
          status: 400,
        }
      );
    }
    const videoData = {
      ...body,
      owner: session.user.id,
      controls: body.controls ?? true,
      transformation: {
        height: body.transformation?.height ?? 1920,
        width: body.transformation?.width ?? 1080,
        quality: body.transformation?.quality ?? 100,
      },
    };
    const newVideo = await Video.create(videoData);
    return NextResponse.json(newVideo);
  } catch (error) {
    console.error('Failed to create video:', error);
    return NextResponse.json(
      {
        error: `Failed to create video: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      {
        status: 500,
      }
    );
  }
}
