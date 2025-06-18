import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db'; // Corrected import path and function name
import Profile, { IProfile } from '../../../models/Profile'; // Adjust path if your project structure differs

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
export async function PUT(request: Request) {
  await connectToDatabase(); // Connect to MongoDB

  try {
    const updatedData = await request.json(); // Data from the frontend

    // Try to find the existing profile
    let profileToUpdate: IProfile | null = await Profile.findOne({});

    let updatedProfileResult: IProfile | null;

    if (!profileToUpdate) {
      // If no profile exists, create one (this handles initial save if DB is empty)
      console.log("No existing profile found, creating a new one on PUT.");
      updatedProfileResult = await Profile.create({
        firstName: updatedData.firstName || 'New',
        lastName: updatedData.lastName || 'User',
        email: updatedData.email || `temp-user-${Date.now()}@example.com`,
        phone: updatedData.phone || null,
        location: updatedData.location || null,
        bio: updatedData.bio || null,
        avatar: updatedData.avatar || null,
      });
    } else {
      // Update the existing profile in MongoDB
      updatedProfileResult = await Profile.findOneAndUpdate(
        { _id: profileToUpdate._id }, // Find by the existing profile's ID
        updatedData,                 // The data sent from the frontend
        { new: true, runValidators: true } // Return the updated document and run schema validators
      );

      if (!updatedProfileResult) {
        return NextResponse.json({ message: 'Profile not found after initial check.' }, { status: 404 });
      }
      console.log("Successfully updated profile:", updatedProfileResult);
    }

    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

    return NextResponse.json({ message: 'Profile updated successfully', profile: updatedProfileResult });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    if (error.code === 11000) {
      return NextResponse.json({ message: 'The email address provided is already in use.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to update profile' }, { status: 500 });
  }
} 