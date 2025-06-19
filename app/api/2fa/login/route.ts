import { NextResponse } from "next/server";
import { authenticator } from "otplib";
import { connectToDatabase } from "../../../../lib/db";
import User from "../../../../models/User";
import Profile from "../../../../models/Profile";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const { email, token } = await req.json();

    if (!email || !token) {
      return new NextResponse("Email and 2FA code are required", {
        status: 400,
      });
    }

    const user = await User.findOne({ email }).select("_id");

    if (!user) {
      return new NextResponse("Invalid credentials", { status: 401 });
    }

    const profile = await Profile.findOne({ user: user._id });

    if (!profile) {
      return new NextResponse("User profile not found or 2FA not set up.", {
        status: 404,
      });
    }

    if (
      !profile.twoFactorEnabled ||
      !profile.twoFactorSecret ||
      !profile.twoFactorConfirmed
    ) {
      return new NextResponse(
        "Two-factor authentication is not enabled or set up for this account.",
        { status: 403 }
      );
    }

    const isValid = authenticator.verify({
      token,
      secret: profile.twoFactorSecret,
    });

    if (!isValid) {
      return new NextResponse("Invalid 2FA code", { status: 400 });
    }

    return NextResponse.json({ message: "2FA code verified successfully." });
  } catch (error) {
    console.error("2FA login verify error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
