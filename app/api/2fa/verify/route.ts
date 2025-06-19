import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { authenticator } from "otplib";
import { connectToDatabase } from "../../../../lib/db";
import User from "../../../../models/User";
import Profile from "../../../../models/Profile";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { secret, token } = await req.json();

    if (!secret || !token) {
      return new NextResponse("Secret and token are required", { status: 400 });
    }

    // Verify the provided token against the secret generated in the previous step.
    const isValid = authenticator.verify({ token, secret });

    if (!isValid) {
      return new NextResponse("Invalid 2FA code. Please try again.", {
        status: 400,
      });
    }

    // Find the user to get their ID
    const user = await User.findOne({ email: session.user.email }).select(
      "_id"
    );
    if (!user) {
      return new NextResponse("User not found.", { status: 404 });
    }

    // If valid, save the secret to the user's profile and mark 2FA as confirmed and enabled.
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: user._id },
      {
        twoFactorSecret: secret,
        twoFactorConfirmed: true,
        twoFactorEnabled: true,
      },
      { new: true, upsert: true }
    );

    if (!updatedProfile) {
      return new NextResponse("Failed to update profile for 2FA setup.", {
        status: 500,
      });
    }

    return NextResponse.json({
      message: "Two-factor authentication successfully enabled and verified.",
    });
  } catch (error) {
    console.error("2FA verify error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
