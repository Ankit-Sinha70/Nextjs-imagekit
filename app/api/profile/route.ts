import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/db";
import Profile, { IProfile } from "../../../models/Profile";
import formidable, { Fields, Files, Part } from "formidable";
import fs from "fs/promises";
import path from "path";
import { IncomingMessage } from "http";
import { Readable } from "stream";
import ImageKit from "imagekit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import User from "../../../models/User";

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

export const config = {
  api: {
    bodyParser: false,
  },
};

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
  ("Attempting to connect to database...");
  try {
    await connectToDatabase();
    ("Database connected successfully.");
  } catch (dbError: any) {
    console.error("Database connection error in GET /api/profile:", dbError);
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: dbError.message,
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
    const userName = session.user.name;

    `Attempting to find profile for user ID: ${userId}, Email: ${userEmail}`;
    let profile: IProfile | null = await Profile.findOne({ user: userId });

    if (!profile) {
      `No profile found for user ID: ${userId}. Attempting to create a default one...`;

      // Fetch user details from User model to populate required profile fields
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

      // Provide robust fallback values for required fields
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
  } catch (error: any) {
    console.error(
      "Error fetching or creating profile in GET /api/profile:",
      error
    );
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch or create profile",
        error: error.message,
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

      // !!! IMPORTANT: Get the user ID from the authenticated session.
      const session = await getServerSession(authOptions);
      if (!session || !session.user?.id) {
        return resolve(new NextResponse("Unauthorized", { status: 401 }));
      }
      const userId = session.user.id;

      const profileIdFromRequest = Array.isArray(fields._id)
        ? fields._id[0]
        : null;
      const currentProfile = await Profile.findOne({ user: userId });
      if (!currentProfile) {
        return resolve(
          NextResponse.json(
            { success: false, message: "No profile found for logged in user." },
            { status: 404 }
          )
        );
      }

      const updateData: Partial<IProfile> = {};

      for (const key in fields) {
        if (Array.isArray(fields[key]) && fields[key].length > 0) {
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
            if (key !== "_id" && key !== "user" && key !== "twoFactorSecret") {
              updateData[key as keyof IProfile] = value as any;
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
        } catch (imagekitError: any) {
          console.error("ImageKit upload error:", imagekitError);
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
        avatarUrlToSave = currentProfile?.avatar;
      }

      updateData.avatar = avatarUrlToSave;

      try {
        const updatedProfile = await Profile.findOneAndUpdate(
          { user: userId },
          updateData,
          {
            new: true,
            runValidators: true,
          }
        );

        if (!updatedProfile) {
          return resolve(
            NextResponse.json(
              {
                success: false,
                message: "Profile not found for update (by user ID)",
              },
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
