import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db'; // Corrected import path and function name
import Profile, { IProfile } from '../../../models/Profile'; // Adjust path if your project structure differs
import formidable, { Fields, Files, Part } from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import { IncomingMessage } from 'http';
import { Readable } from 'stream';

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

// In a real application, this would be stored in a database.
// For this example, we'll use a simple in-memory mock.
let userProfile: UserProfile = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '123-456-7890',
  location: 'New York, USA',
  bio: 'A passionate developer.',
  avatar: '/uploads/default_avatar.png', // Example default avatar
};

// Directory to save uploaded files (relative to the project root)
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure the upload directory exists
const ensureUploadDir = async () => {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create upload directory:', error);
  }
};

// Important: Next.js needs to know not to parse the body itself
// when you are handling multipart/form-data with a library like formidable.
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to convert Next.js Request to a Node.js IncomingMessage-like object
// This is necessary because formidable expects a Node.js IncomingMessage,
// but Next.js App Router provides a Web API Request object.
async function streamIncomingMessage(req: Request): Promise<IncomingMessage> {
  // Get the entire body as a buffer
  const bodyBuffer = await req.arrayBuffer(); 
  const readable = new Readable();
  readable.push(Buffer.from(bodyBuffer));
  readable.push(null); // Mark the end of the stream

  // Create a mock IncomingMessage object by merging the Readable stream with Request headers
  const incomingMessage = Object.assign(readable, {
    headers: Object.fromEntries(req.headers.entries()), // Convert Headers object to plain object
    method: req.method,
    url: req.url,
  }) as IncomingMessage; // Cast to IncomingMessage

  return incomingMessage;
}

// GET /api/profile - Fetches the user profile
export async function GET() {
  await connectToDatabase(); // Use the connectToDatabase function from lib/db.ts

  try {
    // Attempt to find the first profile. In a real app with auth, you'd find by user ID.
    // For this example, we assume there's one primary profile to manage.
    let profile: IProfile | null = await Profile.findOne({});

    // If no profile exists, create a default one to ensure the frontend always has data
    if (!profile) {
      profile = await Profile.create({
        firstName: 'New',
        lastName: 'User',
        email: `default-user-${Date.now()}@example.com`, // Use a unique email to prevent conflicts
        phone: null,
        location: null,
        bio: 'Default bio. Please update your profile information.',
        avatar: '/api/placeholder/150/150'
      });
      console.log("Created initial default profile:", profile);
    }

    // Simulate network delay for a more realistic experience
    await new Promise(resolve => setTimeout(resolve, 500)); 
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ message: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PUT /api/profile - Updates the user profile
export async function PUT(req: Request) {
  await connectToDatabase();
  await ensureUploadDir();

  const form = formidable({
    uploadDir: UPLOAD_DIR,
    keepExtensions: true, // Keep original file extensions
    maxFileSize: 5 * 1024 * 1024, // Max 5MB file size
    filename: (name: string, ext: string, part: Part) => {
      // Generate a unique filename for the uploaded file
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      // Use the original field name (e.g., 'avatarFile') for clarity, though it's not strictly necessary.
      return `${part.name}-${uniqueSuffix}${ext}`;
    },
  });

  // Convert Next.js Request to an IncomingMessage-like object for formidable
  const mockReq = await streamIncomingMessage(req);

  return new Promise((resolve, reject) => {
    form.parse(mockReq, async (err: any, fields: Fields, files: Files) => {
      if (err) {
        console.error('Error parsing form data:', err);
        return resolve(NextResponse.json({ message: 'Error processing request', error: err.message }, { status: 400 }));
      }

      // Process textual fields
      const updatedFields: Partial<UserProfile> = {};
      for (const key in fields) {
        // Formidable returns fields as arrays of strings. Take the first element.
        if (Array.isArray(fields[key]) && fields[key].length > 0) {
          updatedFields[key as keyof UserProfile] = String(fields[key][0]);
        }
      }

      // Process file upload (if 'avatarFile' was sent)
      let avatarUrl = userProfile.avatar; // Keep current avatar if no new file is uploaded
      if (files.avatarFile && files.avatarFile.length > 0) {
        const uploadedFile = files.avatarFile[0];
        // The file is already saved to UPLOAD_DIR by formidable.
        // Construct the public URL for the avatar.
        avatarUrl = `/uploads/${path.basename(uploadedFile.filepath)}`;
      }

      // Update the mock user profile with new data and avatar URL
      userProfile = {
        ...userProfile,
        ...updatedFields,
        avatar: avatarUrl,
      };

      // In a real application, you would save `userProfile` to your database here.
      // e.g., await db.updateUser(userProfile.id, userProfile);

      resolve(NextResponse.json({ message: 'Profile updated successfully!', profile: userProfile }));
    });
  });
} 