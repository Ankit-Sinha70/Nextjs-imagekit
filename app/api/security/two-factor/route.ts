import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db'; // Adjust path
import Profile, { IProfile } from '../../../../models/Profile'; // Adjust path

export async function PUT(request: Request) {
  await connectToDatabase();

  try {
    const { enabled } = await request.json();

    let profile: IProfile | null = await Profile.findOne({});

    if (!profile) {
      return NextResponse.json({ message: 'Profile not found.' }, { status: 404 });
    }

    profile.twoFactorEnabled = enabled;
    await profile.save();

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({ message: 'Two-factor authentication status updated.', twoFactorEnabled: profile.twoFactorEnabled });
  } catch (error) {
    console.error("Error updating two-factor status:", error);
    return NextResponse.json({ message: 'Failed to update two-factor status.' }, { status: 500 });
  }
} 