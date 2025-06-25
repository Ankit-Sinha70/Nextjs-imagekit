import { authOptions } from "@/lib/auth";
import formidable from "formidable";
import fs from "fs/promises";
import { IncomingMessage } from "http";
import ImageKit from "imagekit";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Readable } from "stream";
import { connectToDatabase } from "../../../lib/db";
import Profile, { IProfile } from "../../../models/Profile";
import User from "../../../models/User";

// Configure ImageKit SDK
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
  privateKey: process.env.NEXT_IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT!,
});

async function streamIncomingMessage(req: Request): Promise<IncomingMessage> {
  const bodyBuffer = await req.arrayBuffer();
  const readable = new Readable();
  readable.push(Buffer.from(bodyBuffer));
  readable.push(null);

  const incomingMessage = Object.assign(readable, {
    headers: Object.fromEntries(req.headers.entries()),
    method: req.method,
    url: req.url,
  }) as IncomingMessage;

  return incomingMessage;
}

// GET /api/profile - Fetches the user profile
export async function GET() {
  console.log("Attempting to connect to database...");
  try {
    await connectToDatabase();
    console.log("Database connected successfully.");
  } catch (dbError: unknown) {
    let errorMessage = "Database connection failed";
    if (dbError instanceof Error) {
      errorMessage = dbError.message;
    }
    console.error("Database connection error in GET /api/profile:", errorMessage, dbError);
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 500 }
    );
  }

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    console.log(`Attempting to find profile for user ID: ${userId}, Email: ${userEmail}`);
    let profile: IProfile | null = await Profile.findOne({ user: userId });

    if (!profile) {
      console.log(`No profile found for user ID: ${userId}. Attempting to create a default one...`);
      const userFromDb = await User.findById(userId).select("email name");
      if (!userFromDb) {
        console.error(
          `Error: User ${userId} not found in DB when trying to create profile.`
        );
        return NextResponse.json(
          {
            success: false,
            message: "User not found to create profile",
            error: "User data missing",
          },
          { status: 404 }
        );
      }

      const defaultFirstName =
        userFromDb.name ||
        (userFromDb.email ? userFromDb.email.split("@")[0] : "New");
      const defaultLastName = userFromDb.email
        ? userFromDb.email.split("@")[1]
          ? userFromDb.email.split("@")[1].split(".")[0]
          : "User"
        : "User";

      profile = await Profile.create({
        user: userId,
        firstName: defaultFirstName,
        lastName: defaultLastName,
        email: userFromDb.email,
        phone: "",
        location: "",
        bio: "This is a default profile. Please update your information.",
        avatar: "",
        twoFactorEnabled: false,
        twoFactorConfirmed: false,
        notificationPreferences: {
          security: { email: true, push: true, sms: false, inApp: true },
          updates: { email: true, push: false, sms: false, inApp: true },
          marketing: { email: false, push: false, sms: false, inApp: false },
          activity: { email: true, push: true, sms: false, inApp: true },
        },
        appearanceSettings: {
          theme: "light",
          fontSize: "medium",
          compactMode: false,
          showAnimations: true,
          accentColor: "blue",
        },
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    return NextResponse.json(profile);
  } catch (error: unknown) {
    let errorMessage = "Failed to fetch or create profile";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error(
      "Error fetching or creating profile in GET /api/profile:",
      errorMessage,
      error
    );
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  await connectToDatabase();

  const form = formidable({
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,
  });

  const mockReq = await streamIncomingMessage(req);

  try {
    const { fields, files } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(mockReq, (err, fields, files) => {
        if (err) {
          return reject(err);
        }
        resolve({ fields, files });
      });
    });

    // IMPORTANT: Get the user ID from the authenticated session.
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const userId = session.user.id;

    const currentProfile = await Profile.findOne({ user: userId });
    if (!currentProfile) {
      return NextResponse.json(
        { success: false, message: "No profile found for logged in user." },
        { status: 404 }
      );
    }

    const updateData: Partial<IProfile> = {};

    for (const key in fields) {
      if (Array.isArray(fields[key]) && fields[key].length > 0) {
        const value = fields[key][0];
        if (typeof value === 'string') {
          if (
            key === "notificationPreferences" ||
            key === "appearanceSettings"
          ) {
            try {
              updateData[key as keyof IProfile] = JSON.parse(value);
            } catch (parseError: unknown) {
              let warnMessage = `Could not parse JSON for ${key}`;
              if (parseError instanceof Error) {
                warnMessage += `: ${parseError.message}`;
              }
              console.warn(warnMessage, value);
              // If JSON parsing fails, we don't update this specific field in updateData
            }
          } else if (key === "twoFactorEnabled" || key === "twoFactorConfirmed") {
              updateData[key as keyof IProfile] = value === "true"; // Parse boolean strings
          } else {
            if (key !== "_id" && key !== "user" && key !== "twoFactorSecret") {
              updateData[key as keyof IProfile] = value; // Assign directly as string
            }
          }
        }
      }
    }

    let avatarUrlToSave: string | undefined;

    if (files.avatarFile && files.avatarFile.length > 0) {
      const uploadedFile = files.avatarFile[0];
      try {
        const imagekitUploadResponse = await imagekit.upload({
          file: await fs.readFile(uploadedFile.filepath),
          fileName: uploadedFile.originalFilename || `avatar_${userId}`,
          folder: "user_avatars",
        });
        avatarUrlToSave = imagekitUploadResponse.url;
        await fs.unlink(uploadedFile.filepath);
      } catch (imagekitError: unknown) {
        let errorMessage = "ImageKit upload error.";
        if (imagekitError instanceof Error) {
          errorMessage += `: ${imagekitError.message}`;
        }
        console.error(errorMessage, imagekitError);
        try {
          if (uploadedFile.filepath) await fs.unlink(uploadedFile.filepath);
        } catch (cleanupError: unknown) {
          let cleanupErrorMessage = "Error cleaning up temp file.";
          if (cleanupError instanceof Error) {
            cleanupErrorMessage += `: ${cleanupError.message}`;
          }
          console.error(cleanupErrorMessage, cleanupError);
        }
        return NextResponse.json(
          { success: false, message: "Failed to upload avatar to ImageKit" },
          { status: 500 }
        );
      }
    }

    // If avatarUrlToSave is defined, add it to updateData
    if (avatarUrlToSave !== undefined) {
      updateData.avatar = avatarUrlToSave;
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { user: userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return NextResponse.json(
        { success: false, message: "Profile not found for update." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully!",
      profile: updatedProfile,
    });
  } catch (error: unknown) {
    let errorMessage = "Error processing request.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error in PUT /api/profile:", errorMessage, error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
