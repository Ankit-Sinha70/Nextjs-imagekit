import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db";
import Profile, { IProfile } from "../../../../models/Profile";
import User from "../../../../models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(request: Request) {
  await connectToDatabase();

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email }).select(
      "_id"
    );
    if (!user) {
      return new NextResponse("User not found.", { status: 404 });
    }

    const { enabled } = await request.json();

    const profile: IProfile | null = await Profile.findOneAndUpdate(
      { user: user._id },
      { twoFactorEnabled: enabled },
      { new: true, upsert: true }
    );

    if (!profile) {
      return NextResponse.json(
        { message: "Profile not found or could not be updated." },
        { status: 404 }
      );
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({
      message: "Two-factor authentication status updated.",
      twoFactorEnabled: profile.twoFactorEnabled,
    });
  } catch (error: unknown) {
    let errorMessage = "Failed to update two-factor status.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error updating two-factor status:", errorMessage, error);
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
