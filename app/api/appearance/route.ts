import { connectToDatabase } from "@/lib/db";
import Profile, { IAppearanceSettings, IProfile } from "@/models/Profile";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";

export async function GET() {
  await connectToDatabase();

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    let profile: IProfile | null = await Profile.findOne({ user: userId });

    if (!profile) {
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      profile = await Profile.create({
        user: userId,
        email: user.email,
        firstName: session.user.name?.split(" ")[0] || "User",
        lastName: session.user.name?.split(" ").slice(1).join(" ") || "",
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    return NextResponse.json(profile?.appearanceSettings);
  } catch (error) {
    console.error("Error fetching appearance settings:", error);
    return NextResponse.json(
      { message: "Failed to fetch appearance settings." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  await connectToDatabase();

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const updatedSettings: IAppearanceSettings = await request.json();

    let profile: IProfile | null = await Profile.findOne({ user: userId });

    if (!profile) {
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      profile = await Profile.create({
        user: userId,
        email: user.email,
        firstName: session.user.name?.split(" ")[0] || "New",
        lastName: session.user.name?.split(" ").slice(1).join(" ") || "User",
        appearanceSettings: updatedSettings, // Set received settings
      });
    } else {
      // Update the existing profile's appearance settings
      // Ensure only allowed fields are updated to prevent arbitrary data injection
      profile.appearanceSettings = {
        ...profile.appearanceSettings, // Keep existing if not provided
        theme: updatedSettings.theme || profile.appearanceSettings.theme,
        fontSize:
          updatedSettings.fontSize || profile.appearanceSettings.fontSize,
        compactMode:
          updatedSettings.compactMode ?? profile.appearanceSettings.compactMode,
        showAnimations:
          updatedSettings.showAnimations ??
          profile.appearanceSettings.showAnimations,
        accentColor:
          updatedSettings.accentColor || profile.appearanceSettings.accentColor,
      };
      await profile.save();
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({
      message: "Appearance settings updated successfully!",
      settings: profile?.appearanceSettings,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update appearance settings." },
      { status: 500 }
    );
  }
}
