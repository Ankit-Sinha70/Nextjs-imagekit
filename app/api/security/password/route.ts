import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db";
import Profile, { IProfile } from "../../../../models/Profile";
import bcrypt from "bcryptjs";

export async function PUT(request: Request) {
  await connectToDatabase();

  try {
    const {
      newPassword,
      confirmPassword,
    } = await request.json();

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: "New passwords do not match." },
        { status: 400 }
      );
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const profile: IProfile | null = await Profile.findOne({});

    if (!profile) {
      return NextResponse.json(
        { message: "Profile not found." },
        { status: 404 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    profile.hashedPassword = hashedPassword;
    await profile.save();

    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({ message: "Password updated successfully!" });
  } catch (error: unknown) {
    let errorMessage = "Failed to update password.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error updating password:", errorMessage, error);
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
