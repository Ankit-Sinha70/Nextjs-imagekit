import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db'; // Adjust path
import Profile, { IProfile } from '../../../../models/Profile'; // Adjust path
import bcrypt from 'bcryptjs';

export async function PUT(request: Request) {
  await connectToDatabase();

  try {
    const { currentPassword: _currentPassword, newPassword, confirmPassword } = await request.json();

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ message: 'New passwords do not match.' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ message: 'New password must be at least 8 characters long.' }, { status: 400 });
    }

    let profile: IProfile | null = await Profile.findOne({});

    if (!profile) {
      return NextResponse.json({ message: 'Profile not found.' }, { status: 404 });
    }

    // In a real application, you would compare currentPassword with profile.hashedPassword
    // For this example, we'll skip the current password check since there's no login flow.
    // if (profile.hashedPassword && !await bcrypt.compare(currentPassword, profile.hashedPassword)) {
    //   return NextResponse.json({ message: 'Incorrect current password.' }, { status: 401 });
    // }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    profile.hashedPassword = hashedPassword;
    await profile.save();

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({ message: 'Password updated successfully!' });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json({ message: 'Failed to update password.' }, { status: 500 });
  }
} 