import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/db"; // Corrected path
import Profile, { IProfile } from "../../../models/Profile"; // Corrected path
import formidable, { Fields, Files, Part } from "formidable";
import fs from "fs/promises";
import path from "path";
import { IncomingMessage } from "http";
import { Readable } from "stream";
import ImageKit from "imagekit";

// Configure ImageKit SDK
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
  privateKey: process.env.NEXT_IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT!,
});

// Define the shape of the profile data (adjust as per your actual data model)
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
}

// Directory to save uploaded files (relative to the project root)
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Ensure the upload directory exists
const ensureUploadDir = async () => {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error("Failed to create upload directory:", error);
  }
};

// Important: Next.js needs to know not to parse the body itself
// when you are handling multipart/form-data with a library like formidable.
export const config = {
  api: {
    bodyParser: false,
  },
};

// but Next.js App Router provides a Web API Request object.
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
export async function GET(req: Request) {
  console.log("Attempting to connect to database...");
  try {
    await connectToDatabase();
    console.log("Database connected successfully.");
  } catch (dbError: any) {
    console.error("Database connection error in GET /api/profile:", dbError);
    return NextResponse.json({ success: false, message: 'Database connection failed', error: dbError.message }, { status: 500 });
  }

  try {
    console.log("Attempting to find profile...");
    let profile: IProfile | null = await Profile.findOne({});
    
    if (!profile) {
      console.log("No profile found, attempting to create a default one...");
      profile = await Profile.create({
        firstName: 'New',
        lastName: 'User',
        email: `default-user-${Date.now()}@example.com`,
        phone: '',
        location: '',
        bio: 'This is a default profile. Please update your information.',
        avatar: '',
        twoFactorEnabled: false,
        notificationPreferences: {
          security: { email: true, push: true, sms: false, inApp: true },
          updates: { email: true, push: false, sms: false, inApp: true },
          marketing: { email: false, push: false, sms: false, inApp: false },
          activity: { email: true, push: true, sms: false, inApp: true },
        },
        appearanceSettings: {
          theme: 'light', fontSize: 'medium', compactMode: false, showAnimations: true, accentColor: 'blue'
        }
      });
      console.log("Created initial default profile with ID:", profile?._id);
    }

    console.log("Profile fetched/created successfully:", profile);
    await new Promise(resolve => setTimeout(resolve, 500));
    return NextResponse.json({ success: true, profile: profile });
  } catch (error: any) {
    console.error("Error fetching or creating profile in GET /api/profile:", error);
    return NextResponse.json({ success: false, message: 'Failed to fetch or create profile', error: error.message }, { status: 500 });
  }
}

// PUT /api/profile - Updates the user profile including avatar upload to ImageKit
export async function PUT(req: Request) {
  await connectToDatabase();

  const form = formidable({
    // formidable uses a temporary directory by default for uploads.
    keepExtensions: true, // Keep original file extensions
    maxFileSize: 5 * 1024 * 1024, // Max 5MB file size
    // Do not set uploadDir here; ImageKit handles storage directly.
  });

  const mockReq = await streamIncomingMessage(req);

  return new Promise((resolve) => {
    form.parse(mockReq, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form data:", err);
        return resolve(
          NextResponse.json(
            { message: "Error processing request", error: err.message },
            { status: 400 }
          )
        );
      }

      // !!! IMPORTANT: In a real application, you must get the user ID from the authenticated session/token.
      const profileId = Array.isArray(fields._id) ? fields._id[0] : null;

      if (!profileId) {
        return resolve(
          NextResponse.json(
            { success: false, message: "Profile ID not provided for update." },
            { status: 400 }
          )
        );
      }

      const updateData: Partial<IProfile> = {};

      // Process textual fields from `fields` object
      for (const key in fields) {
        if (
          key !== "_id" &&
          Array.isArray(fields[key]) &&
          fields[key].length > 0
        ) {
          const value = fields[key][0];
          if (
            key === "notificationPreferences" ||
            key === "appearanceSettings"
          ) {
            try {
              updateData[key as keyof IProfile] = JSON.parse(value as string);
            } catch (parseError) {
              console.warn(`Could not parse JSON for ${key}:`, value);
              updateData[key as keyof IProfile] = value as any;
            }
          } else {
            updateData[key as keyof IProfile] = value as any;
          }
        }
      }

      let avatarUrlToSave: string | undefined;

      // Process avatar file upload (if 'avatarFile' was sent)
      if (files.avatarFile && files.avatarFile.length > 0) {
        const uploadedFile = files.avatarFile[0];
        try {
          const imagekitUploadResponse = await imagekit.upload({
            file: await fs.readFile(uploadedFile.filepath), // Read the file buffer
            fileName: uploadedFile.originalFilename || "avatar_upload", // Use original filename or a default
            folder: "user_avatars", // Optional: organize your uploads in a specific folder in ImageKit
          });
          avatarUrlToSave = imagekitUploadResponse.url;
          // Delete the temporary file created by formidable
          await fs.unlink(uploadedFile.filepath);
        } catch (imagekitError: any) {
          console.error("ImageKit upload error:", imagekitError);
          // Try to clean up temp file even if ImageKit upload fails
          try {
            if (uploadedFile.filepath) await fs.unlink(uploadedFile.filepath);
          } catch (cleanupError) {
            console.error("Error cleaning up temp file:", cleanupError);
          }
          return resolve(
            NextResponse.json(
              {
                success: false,
                message: "Failed to upload avatar to ImageKit",
                error: imagekitError.message,
              },
              { status: 500 }
            )
          );
        }
      } else {
        // If no new avatar file is provided, keep the existing one
        const currentProfile = await Profile.findById(profileId);
        avatarUrlToSave = currentProfile?.avatar; // Use optional chaining to safely access avatar
      }

      updateData.avatar = avatarUrlToSave;

      try {
        const updatedProfile = await Profile.findByIdAndUpdate(
          profileId,
          updateData,
          {
            new: true,
            runValidators: true,
          }
        );

        if (!updatedProfile) {
          return resolve(
            NextResponse.json(
              { success: false, message: "Profile not found for update" },
              { status: 404 }
            )
          );
        }

        resolve(
          NextResponse.json({
            success: true,
            message: "Profile updated successfully!",
            profile: updatedProfile,
          })
        );
      } catch (error: any) {
        console.error("Error updating profile in DB:", error);
        if (error.name === "ValidationError") {
          return resolve(
            NextResponse.json(
              { success: false, message: error.message, errors: error.errors },
              { status: 400 }
            )
          );
        }
        resolve(
          NextResponse.json(
            {
              success: false,
              message: "Failed to update profile",
              error: error.message,
            },
            { status: 500 }
          )
        );
      }
    });
  });
}
