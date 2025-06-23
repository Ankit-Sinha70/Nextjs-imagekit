import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Profile, { INotificationPreferences, IProfile } from "@/models/Profile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  await connectToDatabase();
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let profile: IProfile | null = await Profile.findOne({ email: session.user.email });
    if (!profile) {
      profile = await Profile.create({
        email: session.user.email,
        firstName: session.user.name?.split(' ')[0] || "User",
        lastName: session.user.name?.split(' ').slice(1).join(' ') || "",
      });
    }

    // Return only the notificationPreferences
    await new Promise((resolve) => setTimeout(resolve, 500));
    return NextResponse.json(profile?.notificationPreferences);
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return NextResponse.json(
      { message: "Failed to fetch notification preferences." },
      { status: 500 }
    );
  }
}

// PUT /api/notifications - Updates the user's notification preferences
export async function PUT(request: Request) {
  await connectToDatabase();

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const updatedPreferences: INotificationPreferences = await request.json();

    let profile: IProfile | null = await Profile.findOne({ email: session.user.email });

    if (!profile) {
      // If no profile exists for the authenticated user, create one and then update its preferences
      profile = await Profile.create({
        email: session.user.email,
        firstName: session.user.name?.split(' ')[0] || "User",
        lastName: session.user.name?.split(' ').slice(1).join(' ') || "",
        notificationPreferences: updatedPreferences, 
      });
    } else {
      profile.notificationPreferences = updatedPreferences;
      await profile.save();
    }

    await new Promise((resolve) => setTimeout(resolve, 500)); 

    return NextResponse.json({
      message: "Notification preferences updated successfully!",
      preferences: profile?.notificationPreferences,
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return NextResponse.json(
      { message: "Failed to update notification preferences." },
      { status: 500 }
    );
  }
}
